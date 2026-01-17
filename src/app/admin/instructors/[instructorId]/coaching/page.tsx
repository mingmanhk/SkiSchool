
import { createAdminClient } from '@/lib/supabase/server'
import InstructorCoachingTab from '@/components/coaching/InstructorCoachingTab'
import { notFound } from 'next/navigation'

export default async function InstructorCoachingPage({ params }: { params: Promise<{ instructorId: string }> }) {
  const supabase = await createAdminClient()
  const { instructorId } = await params;
  
  const { data: instructor, error } = await supabase
    .from('instructors')
    .select(`
      id,
      name,
      goals:instructor_goals(*),
      feedback:instructor_feedback(*)
    `)
    .eq('id', instructorId)
    .single()

  if (error || !instructor) {
    notFound();
  }
  
  return <InstructorCoachingTab instructorId={instructor.id} goals={instructor.goals} />;
}
