
'use client'

import { useState } from 'react';
import Image from 'next/image';

const instructor = {
  id: '1',
  name: 'John Doe',
  specialty: 'Expert Skiing, Racing',
  bio: 'John is a former Olympic skier with a passion for teaching. With over 20 years of experience, he has coached national champions and helped countless skiers achieve their personal best. His teaching philosophy is centered on building a strong foundation and pushing students to their limits in a safe and supportive environment.',
  photoUrl: '/john-doe.jpg',
  schedule: {
    Monday: '9 AM - 4 PM',
    Tuesday: '9 AM - 1 PM',
    Wednesday: 'Off',
    Thursday: '12 PM - 6 PM',
    Friday: '9 AM - 4 PM',
    Saturday: '9 AM - 12 PM',
    Sunday: 'Off',
  },
};

export default function InstructorDetailPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sending message:', { name, email, message });
    alert('Your message has been sent!');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Image src={instructor.photoUrl} alt={instructor.name} width={400} height={400} className="w-full h-auto rounded-lg shadow-lg mb-4" />
            <h1 className="text-4xl font-bold">{instructor.name}</h1>
            <p className="text-xl text-gray-400 mb-6">{instructor.specialty}</p>

            <h2 className="text-2xl font-bold mb-4">Weekly Schedule</h2>
            <ul className="space-y-2 text-gray-300 bg-gray-800 p-4 rounded-lg">
              {Object.entries(instructor.schedule).map(([day, time]) => (
                <li key={day} className="flex justify-between">
                  <span className="font-semibold">{day}</span>
                  <span>{time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-3xl font-bold mb-4">About Me</h2>
              <p className="text-lg text-gray-300 leading-relaxed">{instructor.bio}</p>
            </div>

            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <h2 className="text-3xl font-bold mb-6">Contact Me</h2>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" />
                  <input type="email" placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg" />
                </div>
                <textarea placeholder="Your Message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"></textarea>
                <div className="text-right">
                  <button type="submit" className="px-8 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
