import BrandingForm from '@/components/admin/BrandingForm';
import { SiteBuilderService } from '@/lib/services/siteBuilderService';
import { getTenantContext } from '@/lib/auth/tenantContext';

export default async function BrandingPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);
  const service = new SiteBuilderService();
  const config = await service.getSiteConfig(tenant.id);

  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Branding Settings</h1>
        <BrandingForm tenantSlug={tenantSlug} branding={config.branding} logos={config.logos} />
    </div>
  );
}
