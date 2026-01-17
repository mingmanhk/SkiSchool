import { db } from '../db/client';
import { site_configs, tenants } from '../db/schema';
import { eq } from 'drizzle-orm';
import { SiteConfig } from '../../types/site';

export class SiteBuilderService {
  async getSiteConfig(tenantId: string): Promise<SiteConfig> {
    const results = await db.select().from(site_configs).where(eq(site_configs.tenant_id, tenantId));
    
    if (results.length === 0) {
      // Return defaults if no config exists
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

    const row = results[0];
    return {
      tenantId: row.tenant_id,
      navigation: row.navigation as any,
      branding: row.branding as any,
      logos: row.logos as any,
      layout: row.layout as any,
      hero: row.hero as any,
      sections: row.sections as any,
      aboutSections: row.about_sections as any,
      teamSections: row.team_sections as any,
      customPages: row.custom_pages as any,
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async updateSiteConfig(
    tenantId: string,
    partial: Partial<SiteConfig>,
    userId: string, // For audit logging (later)
  ): Promise<SiteConfig> {
    // Check if config exists
    const existing = await db.select().from(site_configs).where(eq(site_configs.tenant_id, tenantId));
    
    const updateValues: any = {
       updated_at: new Date(),
    };
    if (partial.navigation) updateValues.navigation = partial.navigation;
    if (partial.branding) updateValues.branding = partial.branding;
    if (partial.logos) updateValues.logos = partial.logos;
    if (partial.layout) updateValues.layout = partial.layout;
    if (partial.hero) updateValues.hero = partial.hero;
    if (partial.sections) updateValues.sections = partial.sections;
    if (partial.aboutSections) updateValues.about_sections = partial.aboutSections;
    if (partial.teamSections) updateValues.team_sections = partial.teamSections;
    if (partial.customPages) updateValues.custom_pages = partial.customPages;

    let row;
    if (existing.length === 0) {
       [row] = await db.insert(site_configs).values({
          tenant_id: tenantId,
          ...updateValues
       }).returning();
    } else {
       [row] = await db.update(site_configs)
          .set(updateValues)
          .where(eq(site_configs.tenant_id, tenantId))
          .returning();
    }
    
    return {
      tenantId: row.tenant_id,
      navigation: row.navigation as any,
      branding: row.branding as any,
      logos: row.logos as any,
      layout: row.layout as any,
      hero: row.hero as any,
      sections: row.sections as any,
      aboutSections: row.about_sections as any,
      teamSections: row.team_sections as any,
      customPages: row.custom_pages as any,
      updatedAt: row.updated_at.toISOString(),
    };
  }

  async getPublicSiteConfigBySlug(tenantSlug: string): Promise<SiteConfig | null> {
    // Resolve tenant by slug
    const tenantResult = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug));
    if (tenantResult.length === 0) return null;
    
    const tenantId = tenantResult[0].id;
    return this.getSiteConfig(tenantId);
  }
}
