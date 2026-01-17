export default async function SiteHomePage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Welcome</h2>
      <p>This is the public site for {tenantSlug}.</p>
    </div>
  );
}
