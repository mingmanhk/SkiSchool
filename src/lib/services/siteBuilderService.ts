// SiteBuilderService: CMS for public site
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { siteConfigs } from '@/lib/db/schema_multi_tenant';
import { SiteConfig, NavItem, BrandingConfig, LogoConfig, HeroConfig } from '@/types/spec';
import { TenantService } from './tenantService';

export class SiteBuilderService {
  private tenantService = new TenantService();

  async getSiteConfig(tenantId: string): Promise<SiteConfig> {
    const results = await db
      .select()
      .from(siteConfigs)
      .where(eq(siteConfigs.tenantId, tenantId))
      .limit(1);

    if (results.length === 0) {
      // Return default config if not found
      return this.getDefaultSiteConfig(tenantId);
    }

    const row = results[0];
    return this.mapRowToSiteConfig(row);
  }

  async updateSiteConfig(
    tenantId: string,
    partial: Partial<SiteConfig>,
    userId: string,
  ): Promise<SiteConfig> {
    // Get existing config or create default
    const existing = await this.getSiteConfig(tenantId);

    // Merge partial into existing
    const fields = {
      navigation: partial.navigation ?? existing.navigation,
      branding: partial.branding ?? existing.branding,
      logos: partial.logos ?? existing.logos,
      layout: partial.layout ?? existing.layout,
      hero: partial.hero ?? existing.hero,
      sections: partial.sections ?? existing.sections,
      aboutSections: partial.aboutSections ?? existing.aboutSections,
      teamSections: partial.teamSections ?? existing.teamSections,
      customPages: partial.customPages ?? existing.customPages,
      updatedAt: new Date(),
    };

    // Upsert — tenantId is the PK so conflict = existing row
    const result = await db
      .insert(siteConfigs)
      .values({ tenantId, ...fields })
      .onConflictDoUpdate({ target: siteConfigs.tenantId, set: fields })
      .returning();

    return this.mapRowToSiteConfig(result[0]);
  }

  async getPublicSiteConfigBySlug(tenantSlug: string): Promise<SiteConfig> {
    // Resolve tenant by slug
    const tenant = await this.tenantService.getTenantBySlug(tenantSlug);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    return this.getSiteConfig(tenant.id);
  }

  private mapRowToSiteConfig(row: typeof siteConfigs.$inferSelect): SiteConfig {
    return {
      tenantId: row.tenantId,
      navigation: (row.navigation as NavItem[]) ?? [],
      branding: (row.branding as BrandingConfig) ?? {},
      logos: (row.logos as LogoConfig) ?? {},
      layout: (row.layout as Record<string, unknown>) ?? {},
      hero: (row.hero as HeroConfig) ?? {},
      sections: (row.sections as Record<string, unknown>[]) ?? [],
      aboutSections: (row.aboutSections as Record<string, unknown>[]) ?? [],
      teamSections: (row.teamSections as Record<string, unknown>[]) ?? [],
      customPages: (row.customPages as Record<string, unknown>[]) ?? [],
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  private getDefaultSiteConfig(tenantId: string): SiteConfig {
    return {
      tenantId,
      navigation: [],
      branding: {},
      logos: {},
      layout: {},
      hero: {},
      sections: [],
      aboutSections: [],
      teamSections: [],
      customPages: [],
      updatedAt: new Date().toISOString(),
    };
  }
}
