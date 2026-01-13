
import Link from 'next/link';

export default function ParentDashboard() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Parent Dashboard</h1>
          <div className="flex space-x-4">
            <Link href="/parent/students/add" className="px-4 py-2 bg-blue-600 rounded-lg font-bold hover:bg-blue-700">
              Add Student
            </Link>
            <Link href="/parent/browse" className="px-4 py-2 bg-green-600 rounded-lg font-bold hover:bg-green-700">
              Browse Programs
            </Link>
            <Link href="/parent/enrollments" className="px-4 py-2 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700">
              View Schedule
            </Link>
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Alerts</h2>
          <div className="bg-yellow-500 text-black p-4 rounded-lg">
            <p><strong>Weather Alert:</strong> Heavy snow expected this weekend. Check for class cancellations.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Upcoming Classes */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Classes</h2>
            <div className="space-y-4">
              {/* Placeholder for upcoming classes */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold">Ski Level 2</h3>
                <p className="text-gray-400">Tomorrow at 10:00 AM</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold">Snowboard Basics</h3>
                <p className="text-gray-400">Saturday at 1:00 PM</p>
              </div>
            </div>
          </div>

          {/* New Report Cards */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">New Report Cards</h2>
            <div className="space-y-4">
              {/* Placeholder for new report cards */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold">Alex&apos;s Report Card</h3>
                <p className="text-gray-400">Received today</p>
                <Link href="/parent/reports/alex" className="text-blue-500 hover:underline">
                  View Report
                </Link>
              </div>
            </div>
          </div>

          {/* My Students */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">My Students</h2>
            <div className="space-y-4">
              {/* Placeholder for student list */}
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold">Alex</h3>
                <p className="text-gray-400">Age 10, Level 2</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-bold">Sarah</h3>
                <p className="text-gray-400">Age 8, Beginner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
