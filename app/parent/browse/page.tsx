
'use client'

import { useState } from 'react';
import Link from 'next/link';

const programs = [
  {
    id: '1',
    name: 'Kids Ski Adventure (Ages 6-8)',
    description: 'A fun-filled week of skiing for the little ones. No experience necessary!',
    price: 499,
    level: 'Beginner',
    ageGroup: '6-8',
    sport: 'Ski',
  },
  {
    id: '2',
    name: 'Teen Snowboard Camp (Ages 13-16)',
    description: 'Ride with our top instructors and master the terrain park.',
    price: 699,
    level: 'Intermediate',
    ageGroup: '13-16',
    sport: 'Snowboard',
  },
  {
    id: '3',
    name: 'Adult Race Clinic',
    description: 'Sharpen your racing skills with our elite coaching team.',
    price: 899,
    level: 'Advanced',
    ageGroup: '17+',
    sport: 'Ski',
  },
  // Add more programs...
];

export default function BrowsePrograms() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ sport: '', level: '', ageGroup: '' });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredPrograms = programs.filter((program) => {
    return (
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.sport ? program.sport === filters.sport : true) &&
      (filters.level ? program.level === filters.level : true) &&
      (filters.ageGroup ? program.ageGroup === filters.ageGroup : true)
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Browse Programs</h1>

        {/* Filters and Search */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input
              type="text"
              placeholder="Search for a program..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white col-span-1 md:col-span-2"
            />
            <select name="sport" value={filters.sport} onChange={handleFilterChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">All Sports</option>
              <option value="Ski">Ski</option>
              <option value="Snowboard">Snowboard</option>
            </select>
            <select name="level" value={filters.level} onChange={handleFilterChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select name="ageGroup" value={filters.ageGroup} onChange={handleFilterChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
              <option value="">All Ages</option>
              <option value="6-8">6-8</option>
              <option value="9-12">9-12</option>
              <option value="13-16">13-16</option>
              <option value="17+">17+</option>
            </select>
          </div>
        </div>

        {/* Program Listing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPrograms.map((program) => (
            <div key={program.id} className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <h2 className="text-2xl font-bold mb-2">{program.name}</h2>
                <p className="text-gray-400 mb-4">{program.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-600 text-xs font-bold rounded">{program.sport}</span>
                  <span className="px-2 py-1 bg-green-600 text-xs font-bold rounded">{program.level}</span>
                  <span className="px-2 py-1 bg-purple-600 text-xs font-bold rounded">Ages {program.ageGroup}</span>
                </div>
              </div>
              <div className="p-6 bg-gray-700 flex justify-between items-center">
                <p className="text-2xl font-bold">${program.price}</p>
                <Link href={`/parent/browse/${program.id}`} className="px-6 py-3 bg-indigo-600 rounded-lg font-bold hover:bg-indigo-700">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
