'use server'

import { RegistrationService } from '@/lib/services/registrationService';
import { getTenantContext } from '@/lib/auth/tenantContext';
import { redirect } from 'next/navigation';

export async function checkEmailAction(formData: FormData) {
  const tenantSlug = formData.get('tenantSlug') as string;
  const email = formData.get('email') as string;
  const tenant = await getTenantContext(tenantSlug);
  
  const service = new RegistrationService();
  const classification = await service.classifyEmail(tenant.id, email);
  
  // Redirect based on classification
  if (classification === 'new') {
      redirect(`/site/${tenantSlug}/registration/new?email=${encodeURIComponent(email)}`);
  } else if (classification === 'returning_account') {
      redirect(`/site/${tenantSlug}/login?email=${encodeURIComponent(email)}&next=/registration/continue`);
  } else {
      // returning_historical
      redirect(`/site/${tenantSlug}/registration/verify?email=${encodeURIComponent(email)}`);
  }
}
