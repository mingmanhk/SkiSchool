import { ReactNode } from 'react';
import { getTenantContext } from '@/lib/auth/tenantContext';

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">{tenant.name} Admin</h2>
        <nav className="space-y-2">
            <a href={`/app/${tenant.slug}/programs`} className="block hover:text-gray-300">Programs</a>
            <a href={`/app/${tenant.slug}/registrations`} className="block hover:text-gray-300">Registrations</a>
            <a href={`/app/${tenant.slug}/settings`} className="block hover:text-gray-300">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
