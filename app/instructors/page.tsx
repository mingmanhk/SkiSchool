
'use client'

import Link from 'next/link';
import Image from 'next/image';

const instructors = [
  {
    id: '1',
    name: 'John Doe',
    specialty: 'Expert Skiing, Racing',
    bio: 'Former Olympic skier with 20 years of coaching experience.',
    photoUrl: '/john-doe.jpg',
  },
  {
    id: '2',
    name: 'Jane Smith',
    specialty: 'Freestyle Snowboarding',
    bio: 'X Games medalist and a passionate teacher of all things freestyle.',
    photoUrl: '/jane-smith.jpg',
  },
  {
    id: '3',
    name: 'Emily White',
    specialty: 'Kids & Beginners',
    bio: 'Loves introducing new skiers to the mountain in a fun and safe way.',
    photoUrl: '/emily-white.jpg',
  },
  // Add more instructors
];

export default function InstructorsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Meet Our Instructors</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((instructor) => (
            <Link key={instructor.id} href={`/instructors/${instructor.id}`}>
              <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer">
                <div className="relative h-64">
                  <Image src={instructor.photoUrl} alt={instructor.name} fill className="object-cover" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <h2 className="text-2xl font-bold">{instructor.name}</h2>
                    <p className="text-gray-300">{instructor.specialty}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
