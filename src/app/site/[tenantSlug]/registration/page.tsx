import { checkEmailAction } from '@/actions/registration';

export default async function RegistrationPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
      <p className="mb-6 text-gray-600 text-center">Enter your email to get started.</p>
      
      <form action={checkEmailAction} className="space-y-4">
        <input type="hidden" name="tenantSlug" value={tenantSlug} />
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
          <input 
            type="email" 
            name="email" 
            id="email" 
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2" 
            placeholder="you@example.com"
          />
        </div>
        <button 
          type="submit" 
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
