import Link from 'next/link';
import { getTenantContext } from '@/lib/auth/tenantContext';

export default async function SettingsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href={`/app/${tenant.slug}/settings/branding`} className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
           <h2 className="text-xl font-semibold mb-2">Branding</h2>
           <p className="text-gray-600">Customize your site's colors, logos, and fonts.</p>
        </Link>
         <Link href={`/app/${tenant.slug}/settings/navigation`} className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
           <h2 className="text-xl font-semibold mb-2">Navigation</h2>
           <p className="text-gray-600">Manage your site's menu structure.</p>
        </Link>
         <Link href={`/app/${tenant.slug}/settings/pages`} className="block p-6 bg-white rounded-lg shadow hover:shadow-md">
           <h2 className="text-xl font-semibold mb-2">Pages</h2>
           <p className="text-gray-600">Edit content for About, Team, and other pages.</p>
        </Link>
      </div>
    </div>
  );
}
