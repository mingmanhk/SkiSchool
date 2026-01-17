'use server'

import { RegistrationService } from '@/lib/services/registrationService';
import { getTenantContext } from '@/lib/auth/tenantContext';
import { redirect } from 'next/navigation';

export async function createFamilyRegistrationAction(formData: FormData) {
  const tenantSlug = formData.get('tenantSlug') as string;
  const tenant = await getTenantContext(tenantSlug);
  
  const parentData = {
    firstName: formData.get('parentFirstName') as string,
    lastName: formData.get('parentLastName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
  };

  const studentData = {
    firstName: formData.get('studentFirstName') as string,
    lastName: formData.get('studentLastName') as string,
    dob: formData.get('studentDob') as string,
    skillLevel: formData.get('studentSkill') as string,
  };

  const service = new RegistrationService();
  await service.createNewFamilyRegistration(tenant.id, parentData, studentData);

  redirect(`/site/${tenantSlug}/registration/program-select`);
}
