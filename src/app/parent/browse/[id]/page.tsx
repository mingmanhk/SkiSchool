
'use client'

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';

const program = {
  id: '1',
  name: 'Kids Ski Adventure (Ages 6-8)',
  description: 'A fun-filled week of skiing for the little ones. No experience necessary! Our certified instructors will teach them the basics of turning, stopping, and riding the chairlift safely.',
  price: 499,
  level: 'Beginner',
  ageGroup: '6-8',
  sport: 'Ski',
  schedule: 'Mon-Fri, 9:00 AM - 12:00 PM',
  startDate: '2024-07-15',
  endDate: '2024-07-19',
};

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [selectedStudent, setSelectedStudent] = useState('');

  const handleEnroll = () => {
    if (!selectedStudent) {
      alert('Please select a student to enroll.');
      return;
    }
    // Logic to enroll the selected student in the program
    console.log(`Enrolling student ${selectedStudent} in program ${id}`);
    router.push('/parent/enrollments');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{program.name}</h1>
            <p className="text-gray-400 mb-6">{program.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-lg">
              <div><span className="font-bold text-gray-300">Sport:</span> {program.sport}</div>
              <div><span className="font-bold text-gray-300">Level:</span> {program.level}</div>
              <div><span className="font-bold text-gray-300">Ages:</span> {program.ageGroup}</div>
              <div><span className="font-bold text-gray-300">Schedule:</span> {program.schedule}</div>
              <div><span className="font-bold text-gray-300">Dates:</span> {program.startDate} - {program.endDate}</div>
            </div>

            <div className="bg-gray-700 p-6 rounded-lg">
              <h2 className="text-2xl font-bold mb-4">Enroll a Student</h2>
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full sm:w-1/2 p-3 bg-gray-600 border border-gray-500 rounded-lg text-white"
                >
                  <option value="">Select a student...</option>
                  <option value="alex">Alex</option>
                  <option value="sarah">Sarah</option>
                </select>
                <button
                  onClick={handleEnroll}
                  className="w-full sm:w-auto px-8 py-3 bg-blue-600 rounded-lg font-bold text-white hover:bg-blue-700 disabled:bg-gray-500"
                  disabled={!selectedStudent}
                >
                  Enroll Now (${program.price})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
