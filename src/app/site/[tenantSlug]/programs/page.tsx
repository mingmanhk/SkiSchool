import { ProgramService } from '@/lib/services/programService';
import { getTenantContext } from '@/lib/auth/tenantContext';

export default async function ProgramsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);
  const programService = new ProgramService();
  const programs = await programService.listPrograms(tenant.id);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6">Programs</h2>
      {programs.length === 0 ? (
        <p className="text-gray-500">No programs available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <div key={program.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold mb-2">{program.name}</h3>
              {program.description && <p className="text-gray-600 mb-4">{program.description}</p>}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{program.ageMin && program.ageMax ? `${program.ageMin}-${program.ageMax} yrs` : 'All Ages'}</span>
                <span>{program.skillLevel || 'All Levels'}</span>
              </div>
              {program.price && (
                  <div className="mt-4 font-bold text-lg">
                      ${(program.price / 100).toFixed(2)}
                  </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
