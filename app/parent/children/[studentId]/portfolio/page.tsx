
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function StudentPortfolioPage({ params }: { params: { studentId: string } }) {
  const supabase = createServerSupabaseClient()

  // Fetch Student Basic Info
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('id', params.studentId)
    .single()

  if (studentError || !student) {
      return notFound();
  }

  // Fetch Portfolio Data
  // In a real app, we might use the API route we just created or fetch directly here server-side.
  // Direct fetching is better for Server Components.
  
  const { data: skills } = await supabase
    .from('student_skill_events')
    .select('*')
    .eq('student_id', params.studentId)
    .order('created_at', { ascending: false })

  const { data: badges } = await supabase
    .from('student_badges')
    .select('*, badges(*)')
    .eq('student_id', params.studentId)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8 flex items-center space-x-4">
        {/* Avatar Placeholder */}
        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
            {student.first_name[0]}
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{student.first_name}&apos;s Portfolio</h1>
            <p className="text-gray-500">Level 4 Skier • Enrolled in Weekend Warriors</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Badges Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold">Badges & Achievements</h2>
            <div className="grid grid-cols-3 gap-4">
                {badges && badges.length > 0 ? (
                    badges.map((b: any) => (
                        <div key={b.id} className="flex flex-col items-center text-center">
                            <div className="h-16 w-16 mb-2 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                {/* Icon placeholder if no image */}
                                🏆
                            </div>
                            <span className="text-sm font-medium">{b.badges.name}</span>
                            <span className="text-xs text-gray-400">{new Date(b.created_at).toLocaleDateString()}</span>
                        </div>
                    ))
                ) : (
                    <p className="col-span-3 text-center text-gray-500 italic">No badges earned yet.</p>
                )}
            </div>
        </div>

        {/* Skills Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-xl font-semibold">Skill Progression</h2>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-6">
                {skills && skills.length > 0 ? (
                    skills.map((skill: any) => (
                        <div key={skill.id} className="relative">
                            <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-green-100 ring-4 ring-white">
                                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                            </span>
                            <h3 className="text-base font-semibold text-gray-900">{skill.skill}</h3>
                            <time className="block text-sm font-normal leading-none text-gray-400 mb-1">
                                {new Date(skill.created_at).toLocaleDateString()}
                            </time>
                            {/* <p className="text-sm text-gray-500">{skill.note}</p> */}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No skills recorded yet.</p>
                )}
            </div>
        </div>
      </div>
      
      {/* Media Gallery Placeholder */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
         <h2 className="mb-4 text-xl font-semibold">Media Gallery</h2>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                     Photo {i}
                 </div>
             ))}
         </div>
      </div>

    </div>
  )
}
