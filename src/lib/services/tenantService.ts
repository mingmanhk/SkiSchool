import { db } from '../db/client';
import { tenants, tenant_domains } from '../db/schema';
import { eq } from 'drizzle-orm';
import { Tenant } from '../../types/tenant';

export class TenantService {
  async getTenantBySlug(slug: string): Promise<Tenant | null> {
    const result = await db.select().from(tenants).where(eq(tenants.slug, slug)).limit(1);
    
    if (result.length === 0) return null;
    
    const row = result[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as any,
      featureFlags: (row.feature_flags as Record<string, boolean>) || {},
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async getTenantByDomain(domain: string): Promise<Tenant | null> {
    const domainResult = await db.select().from(tenant_domains).where(eq(tenant_domains.domain, domain)).limit(1);
    
    if (domainResult.length === 0) return null;
    
    const tenantId = domainResult[0].tenant_id;
    const tenantResult = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    
    if (tenantResult.length === 0) return null;

    const row = tenantResult[0];
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      status: row.status as any,
      featureFlags: (row.feature_flags as Record<string, boolean>) || {},
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async createTenant(data: {
    name: string;
    slug: string;
  }): Promise<Tenant> {
    const [newTenant] = await db.insert(tenants).values({
      name: data.name,
      slug: data.slug,
      status: 'active',
      feature_flags: {},
    }).returning();
    
    return {
      id: newTenant.id,
      slug: newTenant.slug,
      name: newTenant.name,
      status: newTenant.status as any,
      featureFlags: (newTenant.feature_flags as Record<string, boolean>) || {},
      createdAt: newTenant.created_at.toISOString(),
      updatedAt: newTenant.updated_at.toISOString(),
    };
  }

  async updateFeatureFlags(
    tenantId: string,
    flags: Record<string, boolean>,
  ): Promise<void> {
    const existing = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    if (!existing.length) return;
    
    const currentFlags = (existing[0].feature_flags as Record<string, boolean>) || {};
    
    await db.update(tenants)
      .set({ feature_flags: { ...currentFlags, ...flags } })
      .where(eq(tenants.id, tenantId));
  }
}
