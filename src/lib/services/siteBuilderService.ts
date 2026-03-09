// SiteBuilderService: CMS for public site
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { siteConfigs, tenants } from '@/lib/db/schema_multi_tenant';
import { SiteConfig } from '@/types/spec';
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
    const merged: SiteConfig = {
      tenantId,
      navigation: partial.navigation ?? existing.navigation,
      branding: partial.branding ?? existing.branding,
      logos: partial.logos ?? existing.logos,
      layout: partial.layout ?? existing.layout,
      hero: partial.hero ?? existing.hero,
      sections: partial.sections ?? existing.sections,
      aboutSections: partial.aboutSections ?? existing.aboutSections,
      teamSections: partial.teamSections ?? existing.teamSections,
      customPages: partial.customPages ?? existing.customPages,
      updatedAt: new Date().toISOString(),
    };

    // Check if config exists
    const existingResults = await db
      .select()
      .from(siteConfigs)
      .where(eq(siteConfigs.tenantId, tenantId))
      .limit(1);

    if (existingResults.length > 0) {
      // Update existing
      const result = await db
        .update(siteConfigs)
        .set({
          navigation: merged.navigation,
          branding: merged.branding,
          logos: merged.logos,
          layout: merged.layout,
          hero: merged.hero,
          sections: merged.sections,
          aboutSections: merged.aboutSections,
          teamSections: merged.teamSections,
          customPages: merged.customPages,
          updatedAt: new Date(),
        })
        .where(eq(siteConfigs.tenantId, tenantId))
        .returning();

      return this.mapRowToSiteConfig(result[0]);
    } else {
      // Insert new
      const result = await db
        .insert(siteConfigs)
        .values({
          tenantId,
          navigation: merged.navigation,
          branding: merged.branding,
          logos: merged.logos,
          layout: merged.layout,
          hero: merged.hero,
          sections: merged.sections,
          aboutSections: merged.aboutSections,
          teamSections: merged.teamSections,
          customPages: merged.customPages,
          updatedAt: new Date(),
        })
        .returning();

      return this.mapRowToSiteConfig(result[0]);
    }
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
      navigation: (row.navigation as any) || [],
      branding: (row.branding as any) || {},
      logos: (row.logos as any) || {},
      layout: (row.layout as any) || {},
      hero: (row.hero as any) || {},
      sections: (row.sections as any) || [],
      aboutSections: (row.aboutSections as any) || [],
      teamSections: (row.teamSections as any) || [],
      customPages: (row.customPages as any) || [],
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
