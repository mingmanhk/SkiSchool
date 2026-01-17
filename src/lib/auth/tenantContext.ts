import { TenantService } from '../services/tenantService';
import { notFound } from 'next/navigation';

export async function getTenantContext(slug: string) {
  const service = new TenantService();
  const tenant = await service.getTenantBySlug(slug);
  
  if (!tenant) {
    notFound();
  }
  
  return tenant;
}
