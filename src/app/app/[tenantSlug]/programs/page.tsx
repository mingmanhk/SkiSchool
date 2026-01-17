import { ProgramService } from '@/lib/services/programService';
import { getTenantContext } from '@/lib/auth/tenantContext';
import Link from 'next/link';

export default async function AdminProgramsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);
  const programService = new ProgramService();
  const programs = await programService.listPrograms(tenant.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Programs</h1>
        <Link 
          href={`/app/${tenant.slug}/programs/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Program
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {programs.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No programs found.</td>
               </tr>
            ) : (
              programs.map((program) => (
                <tr key={program.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{program.name}</div>
                    <div className="text-sm text-gray-500">{program.discipline}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${program.visibilityStatus === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {program.visibilityStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {program.capacity || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {program.price ? `$${(program.price / 100).toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/app/${tenant.slug}/programs/${program.id}`} className="text-indigo-600 hover:text-indigo-900">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
