'use server'

import { SiteBuilderService } from '@/lib/services/siteBuilderService';
import { getTenantContext } from '@/lib/auth/tenantContext';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function updateBrandingAction(formData: FormData) {
  const tenantSlug = formData.get('tenantSlug') as string;
  const tenant = await getTenantContext(tenantSlug);
  
  const branding = {
    primaryColor: formData.get('primaryColor') as string,
    secondaryColor: formData.get('secondaryColor') as string,
    accentColor: formData.get('accentColor') as string,
    backgroundMode: (formData.get('backgroundMode') as 'light' | 'dark') || 'light',
    headingFont: formData.get('headingFont') as string,
    bodyFont: formData.get('bodyFont') as string,
  };

  const logos = {
      headerLogoUrl: formData.get('headerLogoUrl') as string,
  };

  const service = new SiteBuilderService();
  await service.updateSiteConfig(tenant.id, { branding, logos }, 'system'); 

  revalidatePath(`/site/${tenantSlug}`);
  revalidatePath(`/app/${tenantSlug}/settings/branding`);
}
