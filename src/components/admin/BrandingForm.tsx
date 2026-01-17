'use client';

import { updateBrandingAction } from '@/actions/site-builder';
import { BrandingConfig, LogoConfig } from '@/types/site';

export default function BrandingForm({ 
    tenantSlug, 
    branding, 
    logos 
}: { 
    tenantSlug: string, 
    branding?: BrandingConfig, 
    logos?: LogoConfig 
}) {
  return (
    <form action={updateBrandingAction} className="space-y-6 bg-white p-6 rounded shadow">
       <input type="hidden" name="tenantSlug" value={tenantSlug} />
       
       <h2 className="text-xl font-semibold">Colors</h2>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div>
               <label className="block text-sm font-medium text-gray-700">Primary Color</label>
               <input name="primaryColor" type="color" defaultValue={branding?.primaryColor || '#000000'} className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm" />
           </div>
           <div>
               <label className="block text-sm font-medium text-gray-700">Secondary Color</label>
               <input name="secondaryColor" type="color" defaultValue={branding?.secondaryColor || '#ffffff'} className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm" />
           </div>
           <div>
               <label className="block text-sm font-medium text-gray-700">Accent Color</label>
               <input name="accentColor" type="color" defaultValue={branding?.accentColor || '#3b82f6'} className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm" />
           </div>
       </div>

       <h2 className="text-xl font-semibold">Logos</h2>
       <div>
           <label className="block text-sm font-medium text-gray-700">Header Logo URL</label>
           <input name="headerLogoUrl" type="url" defaultValue={logos?.headerLogoUrl} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" placeholder="https://..." />
       </div>

       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
           Save Branding
       </button>
    </form>
  );
}
