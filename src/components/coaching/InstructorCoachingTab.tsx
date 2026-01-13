
import AddGoalForm from './AddGoalForm'
import GoalList from './GoalList'

export default function InstructorCoachingTab({ 
    instructorId, 
    goals 
}: { 
    instructorId: string, 
    goals: any[] 
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Current Goals</h3>
        <GoalList goals={goals} instructorId={instructorId} />
        <AddGoalForm instructorId={instructorId} />
      </div>

      {/* Placeholders for other sections */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Recent Sessions</h3>
            <p className="text-gray-500 italic">No recent coaching sessions.</p>
            <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500">
                + Log New Session
            </button>
        </div>
        
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Feedback Summary</h3>
            <p className="text-gray-500 italic">No feedback collected this month.</p>
        </div>
      </div>
    </div>
  )
}
