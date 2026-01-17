import { db } from '@/lib/db/client';
import { enrollments, students, families, programs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getTenantContext } from '@/lib/auth/tenantContext';

export default async function AdminRegistrationsPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const tenant = await getTenantContext(tenantSlug);
  
  const results = await db.select({
      id: enrollments.id,
      studentFirstName: students.first_name,
      studentLastName: students.last_name,
      familyName: families.name,
      programName: programs.name,
      status: enrollments.status,
      date: enrollments.created_at,
  })
  .from(enrollments)
  .innerJoin(students, eq(enrollments.student_id, students.id))
  .innerJoin(families, eq(enrollments.family_id, families.id))
  .innerJoin(programs, eq(enrollments.program_id, programs.id))
  .where(eq(enrollments.tenant_id, tenant.id));

  return (
    <div>
       <h1 className="text-2xl font-bold mb-6">Registrations</h1>
       {results.length === 0 ? (
           <p className="text-gray-500">No registrations found.</p>
       ) : (
       <div className="bg-white shadow overflow-hidden sm:rounded-md">
         <ul className="divide-y divide-gray-200">
           {results.map((row) => (
             <li key={row.id}>
               <div className="px-4 py-4 sm:px-6">
                 <div className="flex items-center justify-between">
                   <p className="text-sm font-medium text-indigo-600 truncate">{row.familyName} - {row.studentFirstName} {row.studentLastName}</p>
                   <div className="ml-2 flex-shrink-0 flex">
                     <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        row.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                     }`}>
                       {row.status}
                     </p>
                   </div>
                 </div>
                 <div className="mt-2 sm:flex sm:justify-between">
                   <div className="sm:flex">
                     <p className="flex items-center text-sm text-gray-500">
                       {row.programName}
                     </p>
                   </div>
                   <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                     <p>
                       Applied on <time dateTime={row.date.toISOString()}>{row.date.toLocaleDateString()}</time>
                     </p>
                   </div>
                 </div>
               </div>
             </li>
           ))}
         </ul>
       </div>
       )}
    </div>
  );
}
