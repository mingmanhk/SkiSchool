export type TenantStatus = 'active' | 'suspended' | 'trial';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  featureFlags: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export type TenantRole = 'tenant_admin' | 'staff' | 'parent' | 'student';

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  createdAt: string;
}
