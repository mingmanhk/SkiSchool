
'use client'

import { useState } from 'react';

const enrollments = [
  {
    id: '1',
    studentName: 'Alex',
    programName: 'Kids Ski Adventure',
    date: '2024-07-15',
    time: '10:00 AM',
    status: 'Confirmed',
  },
  {
    id: '2',
    studentName: 'Sarah',
    programName: 'Teen Snowboard Camp',
    date: '2024-07-22',
    time: '1:00 PM',
    status: 'Confirmed',
  },
  // Add more enrollments
];

export default function MyEnrollmentsPage() {
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Enrollments</h1>
          <div className="flex space-x-2 p-1 bg-gray-800 rounded-lg">
            <button onClick={() => setView('list')} className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'list' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>List</button>
            <button onClick={() => setView('calendar')} className={`px-4 py-2 rounded-md text-sm font-medium ${view === 'calendar' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>Calendar</button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-4 font-semibold">Student</th>
                  <th className="p-4 font-semibold">Program</th>
                  <th className="p-4 font-semibold">Date & Time</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-600">
                    <td className="p-4">{item.studentName}</td>
                    <td className="p-4">{item.programName}</td>
                    <td className="p-4">{item.date} at {item.time}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-600 text-xs font-bold rounded">{item.status}</span></td>
                    <td className="p-4 flex space-x-2">
                      <button className="px-3 py-1 bg-red-600 rounded-lg text-xs font-bold hover:bg-red-700">Cancel</button>
                      <button className="px-3 py-1 bg-gray-600 rounded-lg text-xs font-bold hover:bg-gray-700">Reschedule</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center">Calendar View Coming Soon!</h2>
            {/* Placeholder for calendar component */}
          </div>
        )}
      </div>
    </div>
  );
}
