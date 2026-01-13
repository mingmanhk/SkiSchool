
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function StudentTodayPage({ params }: { params: { studentId: string } }) {
  const supabase = createServerSupabaseClient()
  
  // 1. Fetch student to verify access and get name
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('first_name, last_name')
    .eq('id', params.studentId)
    .single()

  if (studentError || !student) {
      return notFound();
  }

  // 2. Find today's class occurrence for this student
  // This is a simplified query. In a real app, we'd join enrollments -> class_series -> class_occurrences
  // For now, let's assume we can find an active occurrence.
  // We'll mock this for the MVP structure since the full enrollment schema might be complex to mock entirely here without data.
  
  // MOCK: Let's assume there is a class occurrence ID if the student is enrolled.
  // In production, query: 
  // enrollments (student_id) -> class_series (id) -> class_occurrences (series_id, date = today)
  
  // For UI demonstration, we'll fetch the latest status event directly if we know the occurrence ID, 
  // but since we don't have it easily without the join, we will render a placeholder state or 
  // fetch *any* recent status event linked to a class this student is in.
  
  // Let's pretend we found an occurrence ID:
  // const mockOccurrenceId = "00000000-0000-0000-0000-000000000000"; // Replace with real logic

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Today&apos;s Class</h1>
      <p className="text-gray-600 mb-6">Student: {student.first_name} {student.last_name}</p>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Live Status</h2>
            
            {/* Timeline Component */}
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pl-6 pb-2">
                
                {/* Latest Event (Active) */}
                <div className="relative">
                    <span className="absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white">
                        <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    </span>
                    <h3 className="flex items-center text-lg font-semibold text-gray-900">Skiing / Practice</h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">10:30 AM</time>
                    <p className="text-base font-normal text-gray-500">The class is currently practicing parallel turns on the Blue run.</p>
                </div>

                {/* Past Event */}
                <div className="relative">
                    <span className="absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                    </span>
                    <h3 className="text-base font-semibold text-gray-600">On Lift</h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">10:15 AM</time>
                </div>

                {/* Start Event */}
                <div className="relative">
                    <span className="absolute -left-[33px] flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 ring-4 ring-white">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                    </span>
                    <h3 className="text-base font-semibold text-gray-600">At Meeting Point</h3>
                    <time className="block mb-2 text-sm font-normal leading-none text-gray-400">09:55 AM</time>
                </div>
            </div>

        </div>
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
             <p className="text-xs text-center text-gray-500">
                Status updates are provided by the instructor in real-time.
             </p>
        </div>
      </div>
    </div>
  )
}
