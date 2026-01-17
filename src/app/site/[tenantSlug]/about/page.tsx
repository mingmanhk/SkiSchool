import { SiteBuilderService } from '@/lib/services/siteBuilderService';
import { getTenantContext } from '@/lib/auth/tenantContext';

export default async function AboutPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);
  const siteService = new SiteBuilderService();
  const config = await siteService.getSiteConfig(tenant.id);

  // Simplified About Page
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">About Us</h2>
      {config.aboutSections && config.aboutSections.length > 0 ? (
          <div>
              {/* Render sections from config */}
              {config.aboutSections.map((section: any, idx: number) => (
                  <div key={idx} className="mb-8">
                      <h3 className="text-xl font-semibold mb-2">{section.title}</h3>
                      <div dangerouslySetInnerHTML={{ __html: section.content }} />
                  </div>
              ))}
          </div>
      ) : (
          <p>Learn more about {tenant.name}. (Content coming soon)</p>
      )}
    </div>
  );
}
