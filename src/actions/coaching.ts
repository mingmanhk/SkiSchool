
'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createInstructorGoal(instructorId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const goal = formData.get('goal')
  if (!goal || typeof goal !== 'string') {
      return { error: 'Goal is required' }
  }

  const { error } = await supabase.from('instructor_goals').insert([
    {
      instructor_id: instructorId,
      goal: goal,
      status: 'active'
    },
  ])

  if (error) {
    console.error('Error creating goal:', error)
    return { error: 'Failed to create goal' }
  }

  revalidatePath(`/admin/instructors/${instructorId}/coaching`)
  return { success: true }
}

export async function updateInstructorGoalStatus(goalId: string, status: string, instructorId: string) {
    const supabase = await createServerSupabaseClient()

    const { error } = await supabase
        .from('instructor_goals')
        .update({ status })
        .eq('id', goalId)

    if (error) {
        console.error('Error updating goal status:', error)
        return { error: 'Failed to update goal status' }
    }

    revalidatePath(`/admin/instructors/${instructorId}/coaching`)
    return { success: true }
}
