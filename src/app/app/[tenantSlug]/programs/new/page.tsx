import { createProgramAction } from '@/actions/tenant-program';

export default async function CreateProgramPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Create Program</h1>
      <form action={createProgramAction} className="space-y-4">
        <input type="hidden" name="tenantSlug" value={tenantSlug} />
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input name="name" type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Discipline</label>
            <input name="discipline" type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Min Age</label>
                <input name="ageMin" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Max Age</label>
                <input name="ageMax" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Skill Level</label>
            <select name="skillLevel" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                <option value="">Any</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input name="price" type="number" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
        </div>
        
        <div>
            <label className="block text-sm font-medium text-gray-700">Capacity</label>
            <input name="capacity" type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700">Visibility</label>
            <select name="visibilityStatus" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                <option value="public">Public</option>
                <option value="hidden">Hidden</option>
            </select>
        </div>

        <div className="pt-4">
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Create Program</button>
        </div>
      </form>
    </div>
  );
}
