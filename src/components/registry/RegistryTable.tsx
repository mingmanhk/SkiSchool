
'use client'

interface RegistryEntry {
  occurrence_id: string
  program_name: string
  class_name: string
  session_time: string
  instructor_first_name: string
  instructor_last_name: string
  student_first_name: string
  student_last_name: string
  student_age: number
  student_level: string
  student_allergies: string
  parent_phone: string
}

export default function RegistryTable({ entries }: { entries: RegistryEntry[] }) {
  if (!entries || entries.length === 0) {
    return <p className="text-gray-500 text-center py-8">No classes found for the selected criteria.</p>
  }

  // Group by Class / Instructor
  const groupedClasses = entries.reduce((acc, entry) => {
    const key = `${entry.class_name} - ${entry.instructor_first_name} ${entry.instructor_last_name}`
    if (!acc[key]) acc[key] = []
    acc[key].push(entry)
    return acc
  }, {} as Record<string, RegistryEntry[]>)

  return (
    <div className="space-y-8 print:space-y-12">
      {Object.entries(groupedClasses).map(([className, students]) => (
        <div key={className} className="break-inside-avoid page-break-after-always">
          {/* Print Header */}
          <div className="mb-4 border-b pb-2">
            <h2 className="text-2xl font-bold">{students[0].program_name}</h2>
            <div className="flex justify-between text-sm mt-2">
              <div>
                 <span className="font-semibold">Class:</span> {students[0].class_name} <br/>
                 <span className="font-semibold">Time:</span> {students[0].session_time}
              </div>
              <div className="text-right">
                 <span className="font-semibold">Instructor:</span> {students[0].instructor_first_name} {students[0].instructor_last_name} <br/>
                 <span className="font-semibold">Count:</span> {students.length} Students
              </div>
            </div>
          </div>

          {/* Table */}
          <table className="min-w-full divide-y divide-gray-300 border border-gray-200">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">#</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Student Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Age</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Level</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Allergies/Notes</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Parent Phone</th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 dark:text-white w-16">✔</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-800">
              {students.map((student, idx) => (
                <tr key={idx}>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {student.student_first_name} {student.student_last_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{student.student_age}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{student.student_level}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-red-600 font-medium">{student.student_allergies}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">{student.parent_phone}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm border border-gray-200"></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer for Signature */}
          <div className="mt-8 pt-8 border-t border-gray-300 flex justify-between text-sm text-gray-500 print:flex hidden">
             <div>
                <p>Instructor Signature: __________________________</p>
             </div>
             <div>
                <p>Time Out: ___________  Time In: ___________</p>
             </div>
          </div>
          
          {/* Safety Reminder */}
          <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 text-center print:block hidden">
             ⚠️ SAFETY REMINDER: Count heads before loading lift and at every junction.
          </div>
        </div>
      ))}
    </div>
  )
}
