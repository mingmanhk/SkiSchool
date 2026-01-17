export default async function EditProgramPage({ params }: { params: Promise<{ tenantSlug: string, id: string }> }) {
  const { id } = await params;
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Program</h1>
      <p>Editing program {id} is coming soon.</p>
    </div>
  );
}
