
'use client'

import { updateInstructorGoalStatus } from '@/actions/coaching'

export default function GoalList({ goals, instructorId }: { goals: any[], instructorId: string }) {
  
  const handleStatusChange = async (goalId: string, newStatus: string) => {
      await updateInstructorGoalStatus(goalId, newStatus, instructorId)
  }

  if (!goals || goals.length === 0) {
    return <p className="text-gray-500 italic">No active goals found.</p>
  }

  return (
    <ul className="space-y-3">
      {goals.map((goal) => (
        <li
          key={goal.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <span className={goal.status === 'completed' ? 'text-gray-400 line-through' : ''}>
            {goal.goal}
          </span>
          <select
            value={goal.status}
            onChange={(e) => handleStatusChange(goal.id, e.target.value)}
            className="rounded border border-gray-300 bg-white p-1 text-xs dark:border-gray-600 dark:bg-gray-700"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        </li>
      ))}
    </ul>
  )
}
