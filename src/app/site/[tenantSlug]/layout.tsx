import { ReactNode } from 'react';
import { getTenantContext } from '@/lib/auth/tenantContext';
import { SiteBuilderService } from '@/lib/services/siteBuilderService';

export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);
  const siteService = new SiteBuilderService();
  const config = await siteService.getSiteConfig(tenant.id);
  const branding = config.branding;

  // Inject CSS variables for theming
  const styles = {
    '--primary-color': branding.primaryColor || '#000000',
    '--secondary-color': branding.secondaryColor || '#ffffff',
    '--accent-color': branding.accentColor || '#3b82f6',
  } as React.CSSProperties;

  return (
    <div className="min-h-screen flex flex-col" style={styles}>
       <header className="p-4 border-b" style={{ backgroundColor: branding.secondaryColor }}>
         <div className="container mx-auto flex justify-between items-center">
            {config.logos.headerLogoUrl ? (
                <img src={config.logos.headerLogoUrl} alt={tenant.name} className="h-10" />
            ) : (
                <h1 className="text-xl font-bold" style={{ color: branding.primaryColor }}>{tenant.name}</h1>
            )}
            <nav className="space-x-4">
                <a href={`/site/${tenant.slug}`} className="text-gray-600 hover:text-gray-900">Home</a>
                <a href={`/site/${tenant.slug}/programs`} className="text-gray-600 hover:text-gray-900">Programs</a>
                <a href={`/site/${tenant.slug}/about`} className="text-gray-600 hover:text-gray-900">About</a>
                <a href={`/site/${tenant.slug}/registration`} className="text-blue-600 font-semibold hover:text-blue-800">Register</a>
            </nav>
         </div>
       </header>
       <main className="flex-1 bg-white">
         {children}
       </main>
       <footer className="p-4 border-t text-sm text-gray-500" style={{ backgroundColor: branding.secondaryColor }}>
         <div className="container mx-auto text-center">
            &copy; {new Date().getFullYear()} {tenant.name}
         </div>
       </footer>
    </div>
  );
}
