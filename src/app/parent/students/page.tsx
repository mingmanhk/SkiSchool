
import Link from 'next/link';
import Image from 'next/image';

const students = [
  {
    id: '1',
    name: 'Alex',
    age: 10,
    level: 'Level 2',
    nextClass: 'Tomorrow at 10:00 AM',
    photoUrl: '/alex.jpg', // Replace with actual photo URL
  },
  {
    id: '2',
    name: 'Sarah',
    age: 8,
    level: 'Beginner',
    nextClass: 'Saturday at 1:00 PM',
    photoUrl: '/sarah.jpg', // Replace with actual photo URL
  },
];

export default function MyStudents() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Students</h1>
          <Link href="/parent/students/add" className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700">
            Add New Student
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {students.map((student) => (
            <div key={student.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <Image src={student.photoUrl} alt={student.name} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{student.name}</h2>
                <p className="text-gray-400">Age: {student.age}</p>
                <p className="text-gray-400">Level: {student.level}</p>
                <p className="text-gray-400">Next Class: {student.nextClass}</p>
                <div className="mt-6 flex space-x-4">
                  <Link href={`/parent/students/${student.id}`} className="px-4 py-2 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700">
                    View Details
                  </Link>
                  <Link href={`/parent/students/${student.id}/edit`} className="px-4 py-2 bg-gray-600 rounded-lg font-bold hover:bg-gray-700">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
