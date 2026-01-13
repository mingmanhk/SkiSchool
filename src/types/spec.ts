// Core TypeScript Interfaces and Types
// Based on the Master Specification

// --- 1. TENANCY & IDENTITY ---

export type TenantStatus = 'active' | 'suspended' | 'trial';
export type TenantRole = 'tenant_admin' | 'staff' | 'parent' | 'student';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  featureFlags: {
    enableStripe: boolean;
    enablePaypal: boolean;
    enableQuickbooks: boolean;
    enableAi: boolean;
    enableSms: boolean;
    enablePublicSite: boolean;
    enableCustomPages: boolean;
    [key: string]: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  authUserId?: string; // Link to Supabase Auth
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
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
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
  medications?: string;
  abilityLevel?: string;
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
  enrollmentId?: string; // Or could be linked to an invoice/cart
  provider: 'stripe' | 'paypal';
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: string;
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
  order?: number;
}

export interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
}

export interface LogoConfig {
  headerLogoUrl?: string;
  footerLogoUrl?: string;
  faviconUrl?: string;
  appIconUrl?: string;
}

export interface HeroConfig {
  title?: string;
  subtitle?: string;
  bgImage?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface SiteConfig {
  tenantId: string;
  navigation: NavItem[];
  branding: BrandingConfig;
  logos: LogoConfig;
  hero: HeroConfig;
  sections: Record<string, unknown>[]; // JSON blobs for different section types
  aboutPageContent: Record<string, unknown>; // JSON blob
  customPages: Record<string, unknown>[]; // Meta info for custom pages
  updatedAt: string;
}

// --- 5. COMMUNICATION ---

export type MessageChannel = 'sms' | 'email';
export type MessageStatus = 'queued' | 'sending' | 'sent' | 'partially_failed' | 'failed';

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  category: 'weather' | 'payment' | 'general' | 'emergency';
  channel: MessageChannel;
  body: string;
  variables: string[]; // e.g. ['{{parentName}}']
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  channel: MessageChannel;
  templateId?: string;
  bodySnapshot: string;
  filtersSnapshot: Record<string, unknown>; // The audience filters used
  status: MessageStatus;
  sentBy?: string;
  createdAt: string;
}

export interface MessageRecipient {
  id: string;
  messageId: string;
  tenantId: string;
  recipientPhone: string; // or email
  status: 'queued' | 'sent' | 'failed';
  providerMessageId?: string;
  providerResponse?: Record<string, unknown>;
  createdAt: string;
}

// --- 6. REGISTRATION FLOW ---

export type EmailClassification = 'new' | 'returning_account' | 'returning_historical';

export interface RegistrationState {
  step: 'account' | 'family' | 'students' | 'programs' | 'payment' | 'confirmation';
  email: string;
  classification?: EmailClassification;
  familyData?: Partial<Family>;
  parentsData?: Partial<Parent>[];
  studentsData?: Partial<Student>[];
  selectedPrograms?: string[]; // Program IDs
}
