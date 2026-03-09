// DomainRoutingService: Map domain → tenant
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { tenantDomains, tenants } from '@/lib/db/schema_multi_tenant';
import { Tenant, TenantDomain } from '@/types/spec';
import { TenantService } from './tenantService';

export class DomainRoutingService {
  private tenantService = new TenantService();

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const results = await db
      .select({
        tenant: tenants,
      })
      .from(tenantDomains)
      .innerJoin(tenants, eq(tenantDomains.tenantId, tenants.id))
      .where(
        and(
          eq(tenantDomains.domain, domain),
          eq(tenantDomains.status, 'active'),
        ),
      )
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0].tenant;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as 'active' | 'suspended' | 'trial',
      featureFlags: (row.featureFlags || {}) as Record<string, boolean>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async addDomain(
    tenantId: string,
    domain: string,
  ): Promise<TenantDomain> {
    // Generate verification token
    const verificationToken = this.generateVerificationToken();

    const result = await db
      .insert(tenantDomains)
      .values({
        tenantId,
        domain,
        status: 'pending_verification',
        verificationToken,
        sslStatus: 'pending',
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      tenantId: row.tenantId,
      domain: row.domain,
      status: row.status as
        | 'pending_verification'
        | 'verified'
        | 'active'
        | 'suspended',
      verificationToken: row.verificationToken,
      lastVerifiedAt: row.lastVerifiedAt?.toISOString() || undefined,
      sslStatus: row.sslStatus as 'pending' | 'active' | 'failed',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async verifyDomain(
    tenantId: string,
    domain: string,
    token: string,
  ): Promise<boolean> {
    // Check if domain exists with matching token
    const results = await db
      .select()
      .from(tenantDomains)
      .where(
        and(
          eq(tenantDomains.tenantId, tenantId),
          eq(tenantDomains.domain, domain),
          eq(tenantDomains.verificationToken, token),
        ),
      )
      .limit(1);

    if (results.length === 0) {
      return false;
    }

    // TODO: Verify domain ownership via DNS check
    // For now, just mark as verified if token matches
    await db
      .update(tenantDomains)
      .set({
        status: 'verified',
        lastVerifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tenantDomains.tenantId, tenantId),
          eq(tenantDomains.domain, domain),
        ),
      );

    return true;
  }

  async activateDomain(tenantId: string, domainId: string): Promise<void> {
    // Mark domain as active and provision SSL
    await db
      .update(tenantDomains)
      .set({
        status: 'active',
        sslStatus: 'active', // TODO: Implement actual SSL provisioning
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tenantDomains.id, domainId),
          eq(tenantDomains.tenantId, tenantId),
        ),
      );
  }

  async listDomains(tenantId: string): Promise<TenantDomain[]> {
    const results = await db
      .select()
      .from(tenantDomains)
      .where(eq(tenantDomains.tenantId, tenantId));

    return results.map((row) => ({
      id: row.id,
      tenantId: row.tenantId,
      domain: row.domain,
      status: row.status as
        | 'pending_verification'
        | 'verified'
        | 'active'
        | 'suspended',
      verificationToken: row.verificationToken,
      lastVerifiedAt: row.lastVerifiedAt?.toISOString() || undefined,
      sslStatus: row.sslStatus as 'pending' | 'active' | 'failed',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }));
  }

  private generateVerificationToken(): string {
    // Generate a random verification token
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
