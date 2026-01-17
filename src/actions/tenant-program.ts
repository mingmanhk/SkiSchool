'use server'

import { ProgramService } from '@/lib/services/programService';
import { getTenantContext } from '@/lib/auth/tenantContext';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createProgramAction(formData: FormData) {
  const tenantSlug = formData.get('tenantSlug') as string;
  const tenant = await getTenantContext(tenantSlug);
  
  const priceInput = formData.get('price') as string;
  const price = priceInput ? Math.round(parseFloat(priceInput) * 100) : undefined; // Convert dollars to cents

  const data = {
    name: formData.get('name') as string,
    discipline: formData.get('discipline') as string,
    ageMin: formData.get('ageMin') ? parseInt(formData.get('ageMin') as string) : undefined,
    ageMax: formData.get('ageMax') ? parseInt(formData.get('ageMax') as string) : undefined,
    skillLevel: formData.get('skillLevel') as string,
    price: price, 
    capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : undefined,
    description: formData.get('description') as string,
    visibilityStatus: (formData.get('visibilityStatus') as 'public' | 'hidden') || 'public',
  };

  const service = new ProgramService();
  await service.createProgram(tenant.id, data);

  revalidatePath(`/app/${tenantSlug}/programs`);
  redirect(`/app/${tenantSlug}/programs`);
}
