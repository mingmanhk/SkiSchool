export default async function AdminDashboard({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to the {tenantSlug} admin area.</p>
    </div>
  );
}
