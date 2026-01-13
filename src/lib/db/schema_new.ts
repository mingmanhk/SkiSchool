import { pgTable, uuid, text, boolean, jsonb, timestamp, index } from 'drizzle-orm/pg-core';

// We assume a 'schools' table and 'users' table exist in the base schema.
// If they are in a different file, we'd import or redefine references here.
// For the sake of this file being a "module" of the schema, we define the new tables.

// --- SCHOOLS (Reference) ---
export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// --- USERS (Reference) ---
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id),
  role: text('role'), // 'OWNER', 'ADMIN', 'INSTRUCTOR', 'PARENT'
  // ... other fields
});


// --- 1. TENANT INTEGRATION KEY VAULT ---

export const schoolIntegrations = pgTable('school_integrations', {
  schoolId: uuid('school_id').primaryKey().references(() => schools.id, { onDelete: 'cascade' }),
  
  // Payment
  stripeSecretKey: text('stripe_secret_key'),
  stripePublishableKey: text('stripe_publishable_key'),
  stripeWebhookSecret: text('stripe_webhook_secret'),
  paypalClientId: text('paypal_client_id'),
  paypalClientSecret: text('paypal_client_secret'),
  
  // Accounting
  quickbooksClientId: text('quickbooks_client_id'),
  quickbooksClientSecret: text('quickbooks_client_secret'),
  quickbooksRefreshToken: text('quickbooks_refresh_token'),
  quickbooksRealmId: text('quickbooks_realm_id'),
  
  // AI
  aiGeminiKey: text('ai_gemini_key'),
  aiOpenaiKey: text('ai_openai_key'),
  aiDeepseekKey: text('ai_deepseek_key'),
  aiDefaultProvider: text('ai_default_provider').default('openai'),
  aiDefaultModel: text('ai_default_model'),
  
  // Communication
  smsProviderKey: text('sms_provider_key'),
  smsSenderNumber: text('sms_sender_number'),
  
  // Feature Flags
  enableStripe: boolean('enable_stripe').default(false),
  enablePaypal: boolean('enable_paypal').default(false),
  enableQuickbooks: boolean('enable_quickbooks').default(false),
  enableAi: boolean('enable_ai').default(false),
  enableSms: boolean('enable_sms').default(false),
  enablePublicSite: boolean('enable_public_site').default(false),
  enableCustomPages: boolean('enable_custom_pages').default(false),
  
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const tenantApiKeys = pgTable('tenant_api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  keyHash: text('key_hash').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  label: text('label'),
  permissions: jsonb('permissions').default(['read']),
  lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => {
  return {
    schoolIdIdx: index('idx_tenant_api_keys_school_id').on(table.schoolId),
    keyHashIdx: index('idx_tenant_api_keys_key_hash').on(table.keyHash),
  };
});


// --- 2. PUBLIC SITE BUILDER ---

export const publicSiteConfig = pgTable('public_site_config', {
  schoolId: uuid('school_id').primaryKey().references(() => schools.id, { onDelete: 'cascade' }),
  
  logoUrl: text('logo_url'),
  primaryColor: text('primary_color').default('#2563EB'),
  secondaryColor: text('secondary_color').default('#1E40AF'),
  fontFamily: text('font_family').default('Inter'),
  
  navigation: jsonb('navigation').default([{ label: "Programs", href: "/programs" }, { label: "Register", href: "/register" }]),
  
  heroTitle: text('hero_title'),
  heroSubtitle: text('hero_subtitle'),
  heroBgImage: text('hero_bg_image'),
  heroDescription: text('hero_description'),
  heroCtaText: text('hero_cta_text').default('Register Now'),
  heroCtaLink: text('hero_cta_link').default('/register'),
  
  sections: jsonb('sections').default([]),
  
  aboutPageContent: jsonb('about_page_content'),
  donateUrl: text('donate_url'),
  
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});


// --- 3. COMMUNICATION SYSTEM ---

export const messageTemplates = pgTable('message_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  category: text('category'),
  body: text('body').notNull(),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const messageLogs = pgTable('message_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(),
  direction: text('direction').notNull(),
  recipient: text('recipient').notNull(),
  templateId: uuid('template_id').references(() => messageTemplates.id),
  contentSnapshot: text('content_snapshot'),
  status: text('status').default('pending'),
  providerId: text('provider_id'),
  errorMessage: text('error_message'),
  sentBy: uuid('sent_by').references(() => users.id),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    schoolIdIdx: index('idx_message_logs_school_id').on(table.schoolId),
    recipientIdx: index('idx_message_logs_recipient').on(table.recipient),
    sentAtIdx: index('idx_message_logs_sent_at').on(table.sentAt),
  };
});


// --- 4. REGISTRATION SYSTEM ---

export const registrations = pgTable('registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  status: text('status').default('draft'),
  step: text('step').default('start'),
  data: jsonb('data').default({}),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeClientSecret: text('stripe_client_secret'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});
