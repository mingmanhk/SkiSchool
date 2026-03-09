// Core TypeScript Interfaces and Types
// Based on the Master Design Document

// --- 1. TENANCY & IDENTITY ---

export type TenantStatus = 'active' | 'suspended' | 'trial';
export type TenantRole = 'tenant_admin' | 'staff' | 'parent' | 'student';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  featureFlags: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  authUserId?: string; // Link to Supabase Auth auth.users.id
  email: string;
  name?: string;
  createdAt: string;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantRole;
  createdAt: string;
}

// --- 2. BUSINESS ENTITIES ---

export interface Family {
  id: string;
  tenantId: string;
  primaryParentId?: string;
  createdAt: string;
}

export interface Parent {
  id: string;
  tenantId: string;
  familyId: string;
  userId?: string; // Optional link to user account
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  tenantId: string;
  familyId: string;
  firstName: string;
  lastName: string;
  birthdate?: string;
  gender?: string;
  notes?: string;
  createdAt: string;
}

export type ProgramVisibility = 'public' | 'hidden';

export interface Program {
  id: string;
  tenantId: string;
  name: string;
  discipline?: string;
  ageMin?: number;
  ageMax?: number;
  skillLevel?: string;
  seasonYear?: number;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: number;
  capacity?: number;
  description?: string;
  visibilityStatus: ProgramVisibility;
  createdAt: string;
  updatedAt: string;
}

export type EnrollmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Enrollment {
  id: string;
  tenantId: string;
  familyId: string;
  studentId: string;
  programId: string;
  status: EnrollmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  enrollmentId?: string;
  provider: 'stripe' | 'paypal';
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: string;
  rawPayload?: Record<string, unknown>;
  createdAt: string;
}

// --- 3. INTEGRATIONS (VAULT) ---

export interface StripeConfig {
  publishableKey?: string;
  secretKeyEncrypted?: string;
  webhookSecretEncrypted?: string;
}

export interface PayPalConfig {
  clientIdEncrypted?: string;
  clientSecretEncrypted?: string;
}

export interface QuickBooksConfig {
  clientIdEncrypted?: string;
  clientSecretEncrypted?: string;
  refreshTokenEncrypted?: string;
  realmId?: string;
}

export interface IntegrationConfigs {
  tenantId: string;
  payments: {
    stripe?: StripeConfig;
    paypal?: PayPalConfig;
  };
  accounting: {
    quickbooks?: QuickBooksConfig;
  };
  aiSettings: Record<string, unknown>; // Behavioral settings
  smsSettings: Record<string, unknown>; // Behavioral settings
  updatedBy?: string;
  updatedAt: string;
}

// --- 4. PUBLIC SITE CONFIG ---

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundMode?: 'light' | 'dark';
  headingFont?: string;
  bodyFont?: string;
}

export interface LogoConfig {
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
}

export interface HeroConfig {
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}

export interface SiteConfig {
  tenantId: string;
  navigation: NavItem[];
  branding: BrandingConfig;
  logos: LogoConfig;
  layout: Record<string, unknown>;
  hero: HeroConfig;
  sections: any[]; // Can be refined
  aboutSections: any[];
  teamSections: any[];
  customPages: any[];
  updatedAt: string;
}

export interface TenantDomain {
  id: string;
  tenantId: string;
  domain: string;
  status: 'pending_verification' | 'verified' | 'active' | 'suspended';
  verificationToken: string;
  lastVerifiedAt?: string;
  sslStatus: 'pending' | 'active' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// --- 5. COMMUNICATION ---

export type MessageChannel = 'sms' | 'email';

export type MessageStatus =
  | 'queued'
  | 'sending'
  | 'sent'
  | 'partially_failed'
  | 'failed';

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  category?: string;
  channel: MessageChannel;
  body: string;
  variables: string[];
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  channel: MessageChannel;
  templateId?: string;
  bodySnapshot: string;
  filtersSnapshot: Record<string, unknown>;
  audienceSizeEstimate?: number;
  status: MessageStatus;
  errorSummary?: string;
  sentBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type RecipientStatus = 'queued' | 'sent' | 'failed';

export interface MessageRecipient {
  id: string;
  messageId: string;
  tenantId: string;
  parentId?: string;
  studentId?: string;
  phone: string;
  status: RecipientStatus;
  providerMessageId?: string;
  providerResponse?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// --- 6. REGISTRATION FLOW ---

export type EmailClassification =
  | 'new'
  | 'returning_account'
  | 'returning_historical';

// --- 7. TENANT API KEYS ---

export interface TenantApiKey {
  id: string;
  tenantId: string;
  publicKey: string;
  secretKey: string; // Encrypted
  status: 'active' | 'revoked';
  createdBy?: string;
  createdAt: string;
  revokedAt?: string;
}

// --- 8. AUDIT LOGS ---

export interface AuditLog {
  id: string;
  tenantId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
