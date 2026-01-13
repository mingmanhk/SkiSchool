
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

// Mock Data for filters
const PROGRAMS = [
  { id: '1', name: 'Weekend Warriors' },
  { id: '2', name: 'Holiday Camp' },
  { id: '3', name: 'Private Lessons' }
]

const INSTRUCTORS = [
  { id: 'inst1', name: 'John Doe' },
  { id: 'inst2', name: 'Jane Smith' }
]

export default function RegistryFilter({ onGenerate }: { onGenerate: (filters: any) => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [programId, setProgramId] = useState('')
  const [instructorId, setInstructorId] = useState('')
  
  const handleGenerate = () => {
    onGenerate({ date, programId, instructorId })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4 dark:bg-gray-800">
      <h2 className="text-lg font-semibold">Filter Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Program</label>
          <select 
            value={programId} 
            onChange={(e) => setProgramId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Programs</option>
            {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instructor</label>
          <select 
            value={instructorId} 
            onChange={(e) => setInstructorId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="">All Instructors</option>
            {INSTRUCTORS.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
         <button 
           onClick={handleGenerate}
           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
         >
           Generate Registry
         </button>
      </div>
    </div>
  )
}
