
'use client'

import { useState } from 'react';

export default function StudentProfilePage() {
  const [student, setStudent] = useState({
    name: 'Alex',
    dob: '2014-01-15',
    skillLevel: 'Level 2',
    notes: 'Allergic to peanuts. Loves going fast!',
    photoUrl: '/alex.jpg',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Updated student profile:', student);
    setIsEditing(false);
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Student Profile</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 rounded-lg font-bold ${isEditing ? 'bg-gray-600 hover:bg-gray-700' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={student.name}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={student.dob}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label htmlFor="skillLevel" className="block text-sm font-medium text-gray-300 mb-2">Skill Level</label>
            <select
              id="skillLevel"
              name="skillLevel"
              value={student.skillLevel}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option>Beginner</option>
              <option>Level 1</option>
              <option>Level 2</option>
              <option>Level 3</option>
              <option>Advanced</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-300 mb-2">Private Notes</label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              value={student.notes}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700">Save Changes</button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-400">Full Name</h3>
            <p>{student.name}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-400">Date of Birth</h3>
            <p>{student.dob}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-400">Skill Level</h3>
            <p>{student.skillLevel}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-400">Private Notes</h3>
            <p className="whitespace-pre-wrap">{student.notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
