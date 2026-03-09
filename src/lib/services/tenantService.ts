// TenantService: Tenant lifecycle and feature flags
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { tenants, tenantDomains } from '@/lib/db/schema_multi_tenant';
import { Tenant, TenantStatus } from '@/types/spec';

export class TenantService {
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const results = await db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as TenantStatus,
      featureFlags: (row.featureFlags || {}) as Record<string, boolean>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const results = await db
      .select({
        tenant: tenants,
      })
      .from(tenantDomains)
      .innerJoin(tenants, eq(tenantDomains.tenantId, tenants.id))
      .where(eq(tenantDomains.domain, domain))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0].tenant;
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as TenantStatus,
      featureFlags: (row.featureFlags || {}) as Record<string, boolean>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const results = await db
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const row = results[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as TenantStatus,
      featureFlags: (row.featureFlags || {}) as Record<string, boolean>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async createTenant(data: {
    name: string;
    slug: string;
  }): Promise<Tenant> {
    const result = await db
      .insert(tenants)
      .values({
        name: data.name,
        slug: data.slug,
        status: 'active',
        featureFlags: {},
      })
      .returning();

    const row = result[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as TenantStatus,
      featureFlags: (row.featureFlags || {}) as Record<string, boolean>,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  async updateFeatureFlags(
    tenantId: string,
    flags: Record<string, boolean>,
  ): Promise<void> {
    await db
      .update(tenants)
      .set({
        featureFlags: flags,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));
  }

  async updateTenantStatus(
    tenantId: string,
    status: TenantStatus,
  ): Promise<void> {
    await db
      .update(tenants)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));
  }
}
