// Tenant context resolution helpers
import { headers } from 'next/headers'
import { Tenant } from '@/types/spec'
import { TenantService } from '@/lib/services/tenantService'

export interface TenantContext {
  tenant: Tenant
  userId?: string
  role?: string
}

const tenantService = new TenantService()

// Header name used by middleware to pass resolved tenant ID downstream
export const TENANT_ID_HEADER = 'x-tenant-id'
export const TENANT_SLUG_HEADER = 'x-tenant-slug'

/**
 * Resolve tenant context from slug.
 * Used in /site/{tenantSlug} and /app/{tenantSlug} routes.
 */
export async function getTenantContext(
  tenantSlug: string,
): Promise<TenantContext | null> {
  const tenant = await tenantService.getTenantBySlug(tenantSlug)
  if (!tenant) return null
  return { tenant }
}

/**
 * Resolve tenant context from custom domain.
 * Used for custom domain routing.
 */
export async function getTenantContextByDomain(
  domain: string,
): Promise<TenantContext | null> {
  const tenant = await tenantService.getTenantByDomain(domain)
  if (!tenant) return null
  return { tenant }
}

/**
 * Get current tenant ID injected by middleware via request header.
 * Must be called from a Server Component or Route Handler.
 */
export async function getCurrentTenantId(): Promise<string | null> {
  try {
    const headerStore = await headers()
    return headerStore.get(TENANT_ID_HEADER)
  } catch {
    return null
  }
}

/**
 * Get current tenant slug injected by middleware via request header.
 */
export async function getCurrentTenantSlug(): Promise<string | null> {
  try {
    const headerStore = await headers()
    return headerStore.get(TENANT_SLUG_HEADER)
  } catch {
    return null
  }
}

/**
 * Resolve the full tenant context from the current request's injected headers.
 */
export async function getCurrentTenantContext(): Promise<TenantContext | null> {
  const tenantId = await getCurrentTenantId()
  if (!tenantId) return null

  const tenant = await tenantService.getTenantById(tenantId)
  if (!tenant) return null

  return { tenant }
}

/**
 * Assert that the tenant is active and not suspended.
 * Throws if the tenant cannot be used.
 */
export function assertTenantActive(tenant: Tenant): void {
  if (tenant.status === 'suspended') {
    throw new Error(`Tenant "${tenant.slug}" is suspended`)
  }
}
