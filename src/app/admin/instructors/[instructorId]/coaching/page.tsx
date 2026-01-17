
import { createServerSupabaseClient } from '@/lib/supabase/server'
import InstructorCoachingTab from '@/components/coaching/InstructorCoachingTab'
import { notFound } from 'next/navigation'

export default async function InstructorCoachingPage({ params }: { params: Promise<{ instructorId: string }> }) {
  const supabase = await createServerSupabaseClient()
  const { instructorId } = await params;

  // Fetch instructor details to confirm existence (and display name if needed)
  const { data: instructor, error: instructorError } = await supabase
    .from('users')
    .select('first_name, last_name')
    .eq('id', instructorId)
    .single()

  if (instructorError || !instructor) {
      // In a real app, handle this gracefully. For now, 404.
      return notFound() 
  }

  // Fetch goals
  const { data: goals } = await supabase
    .from('instructor_goals')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto max-w-5xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Coaching: {instructor.first_name} {instructor.last_name}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage goals, track sessions, and review performance.
        </p>
      </div>

      <InstructorCoachingTab instructorId={instructorId} goals={goals || []} />
    </div>
  )
}
