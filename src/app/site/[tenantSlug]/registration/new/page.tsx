'use client'; 

import { createFamilyRegistrationAction } from '@/actions/registration-new';
import { useParams, useSearchParams } from 'next/navigation';

export default function NewRegistrationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantSlug = params.tenantSlug as string;
  const email = searchParams.get('email');

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">New Family Registration</h1>
      
      <form action={createFamilyRegistrationAction} className="space-y-6">
        <input type="hidden" name="tenantSlug" value={tenantSlug} />
        
        {/* Parent / Family Info */}
        <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-4">Parent Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input name="parentFirstName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input name="parentLastName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input name="email" type="email" defaultValue={email || ''} required readOnly className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm border p-2" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input name="phone" type="tel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
            </div>
        </div>

        {/* Student Info */}
        <div className="bg-gray-50 p-4 rounded">
            <h2 className="text-lg font-semibold mb-4">Student Information</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input name="studentFirstName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input name="studentLastName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                    <input name="studentDob" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Skill Level</label>
                    <select name="studentSkill" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2">
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
            </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
            Create Account & Continue
        </button>
      </form>
    </div>
  );
}
