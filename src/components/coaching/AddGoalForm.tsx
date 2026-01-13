
'use client'

import { createInstructorGoal } from '@/actions/coaching'
import { useState } from 'react'

export default function AddGoalForm({ instructorId }: { instructorId: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    await createInstructorGoal(instructorId, formData)
    setIsPending(false)
    // Ideally, we'd reset the form here
    const form = document.getElementById('add-goal-form') as HTMLFormElement
    form?.reset()
  }

  return (
    <form id="add-goal-form" action={handleSubmit} className="mt-4 flex gap-2">
      <input
        type="text"
        name="goal"
        placeholder="Add a new goal..."
        required
        className="flex-1 rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? 'Adding...' : 'Add Goal'}
      </button>
    </form>
  )
}
