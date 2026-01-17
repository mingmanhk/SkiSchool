
'use server'

import { createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInstructorGoal(instructorId: string, formData: FormData) {
  const supabase = await createAdminClient()
  const goal = formData.get('goal')

  if (!goal) return

  const { error } = await supabase.from('instructor_goals').insert({
    instructor_id: instructorId,
    goal: goal.toString(),
  })

  if (error) {
    console.error('Error creating goal:', error)
    return
  }
  
  revalidatePath(`/admin/instructors/${instructorId}/coaching`)
}

export async function updateInstructorGoalStatus(goalId: string, status: string, instructorId: string) {
    if (!['active', 'completed', 'archived'].includes(status)) {
        console.error('Invalid status update for goal')
        return
    }

    const supabase = await createAdminClient()

    const { error } = await supabase
        .from('instructor_goals')
        .update({ status })
        .eq('id', goalId)

    if (error) {
        console.error('Error updating goal status:', error)
        return
    }

    revalidatePath(`/admin/instructors/${instructorId}/coaching`)
}
