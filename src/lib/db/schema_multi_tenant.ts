// Drizzle ORM Schema - Multi-Tenant Ski School OS
// Matches schema.sql structure
import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  numeric,
  date,
  integer,
  index,
  unique,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Tenants
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    status: text('status').notNull().default('active'), // active, suspended, trial
    featureFlags: jsonb('feature_flags').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    slugIdx: index('idx_tenants_slug').on(table.slug),
  }),
);

// 2. Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authUserId: uuid('auth_user_id'), // linked to Supabase Auth
  email: text('email').notNull().unique(),
  name: text('name'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 3. Tenant Memberships
export const tenantMemberships = pgTable(
  'tenant_memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    role: text('role').notNull(), // tenant_admin, staff, parent, student
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantUserRoleUnique: unique('tenant_user_role_unique').on(
      table.tenantId,
      table.userId,
      table.role,
    ),
    tenantIdx: index('idx_tenant_memberships_tenant').on(table.tenantId),
    userIdx: index('idx_tenant_memberships_user').on(table.userId),
  }),
);

// 4. Families
export const families = pgTable(
  'families',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    primaryParentId: uuid('primary_parent_id'), // Circular reference, set after parents table
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_families_tenant').on(table.tenantId),
  }),
);

// 5. Parents
export const parents = pgTable(
  'parents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    familyId: uuid('family_id')
      .notNull()
      .references(() => families.id),
    userId: uuid('user_id').references(() => users.id), // Optional link to login
    email: text('email').notNull(),
    phone: text('phone'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_parents_tenant').on(table.tenantId),
    familyIdx: index('idx_parents_family').on(table.familyId),
    emailIdx: index('idx_parents_email').on(table.email),
  }),
);

// Add foreign key constraint for primary_parent_id (circular reference)
// This would be done via migration: ALTER TABLE families ADD CONSTRAINT...

// 6. Students
export const students = pgTable(
  'students',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    familyId: uuid('family_id')
      .notNull()
      .references(() => families.id),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    birthdate: date('birthdate'),
    gender: text('gender'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_students_tenant').on(table.tenantId),
    familyIdx: index('idx_students_family').on(table.familyId),
  }),
);

// 7. Programs
export const programs = pgTable(
  'programs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    discipline: text('discipline'),
    ageMin: integer('age_min'),
    ageMax: integer('age_max'),
    skillLevel: text('skill_level'),
    seasonYear: integer('season_year'),
    startDate: date('start_date'),
    endDate: date('end_date'),
    location: text('location'),
    price: numeric('price', { precision: 10, scale: 2 }),
    capacity: integer('capacity'),
    description: text('description'),
    visibilityStatus: text('visibility_status').notNull().default('public'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_programs_tenant').on(table.tenantId),
    visibilityIdx: index('idx_programs_visibility').on(table.visibilityStatus),
  }),
);

// 8. Enrollments
export const enrollments = pgTable(
  'enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    familyId: uuid('family_id')
      .notNull()
      .references(() => families.id),
    studentId: uuid('student_id')
      .notNull()
      .references(() => students.id),
    programId: uuid('program_id')
      .notNull()
      .references(() => programs.id),
    status: text('status').notNull().default('pending'), // pending, confirmed, canceled
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_enrollments_tenant').on(table.tenantId),
    studentIdx: index('idx_enrollments_student').on(table.studentId),
    programIdx: index('idx_enrollments_program').on(table.programId),
  }),
);

// 9. Payments
export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    enrollmentId: uuid('enrollment_id').references(() => enrollments.id),
    provider: text('provider').notNull(), // stripe, paypal
    providerPaymentId: text('provider_payment_id'),
    amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').notNull().default('USD'),
    status: text('status').notNull(),
    rawPayload: jsonb('raw_payload'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_payments_tenant').on(table.tenantId),
    enrollmentIdx: index('idx_payments_enrollment').on(table.enrollmentId),
  }),
);

// 10. Integration Configs (The Vault)
export const integrationConfigs = pgTable('integration_configs', {
  tenantId: uuid('tenant_id')
    .primaryKey()
    .references(() => tenants.id),
  payments: jsonb('payments').notNull().default({}), // Stripe/PayPal keys (Encrypted)
  accounting: jsonb('accounting').notNull().default({}), // QuickBooks keys (Encrypted)
  aiSettings: jsonb('ai_settings').notNull().default({}), // Behavioral settings
  smsSettings: jsonb('sms_settings').notNull().default({}), // SMS behavior
  updatedBy: uuid('updated_by').references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 11. Site Configs
export const siteConfigs = pgTable('site_configs', {
  tenantId: uuid('tenant_id')
    .primaryKey()
    .references(() => tenants.id),
  navigation: jsonb('navigation').notNull().default([]),
  branding: jsonb('branding').notNull().default({}),
  logos: jsonb('logos').notNull().default({}),
  layout: jsonb('layout').notNull().default({}),
  hero: jsonb('hero').notNull().default({}),
  sections: jsonb('sections').notNull().default([]),
  aboutSections: jsonb('about_sections').notNull().default([]),
  teamSections: jsonb('team_sections').notNull().default([]),
  customPages: jsonb('custom_pages').notNull().default([]),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 12. Tenant Domains
export const tenantDomains = pgTable(
  'tenant_domains',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    domain: text('domain').notNull().unique(),
    status: text('status').notNull().default('pending_verification'),
    verificationToken: text('verification_token').notNull(),
    lastVerifiedAt: timestamp('last_verified_at', { withTimezone: true }),
    sslStatus: text('ssl_status').notNull().default('pending'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_tenant_domains_tenant').on(table.tenantId),
    domainIdx: index('idx_tenant_domains_domain').on(table.domain),
  }),
);

// 13. Message Templates
export const messageTemplates = pgTable(
  'message_templates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    name: text('name').notNull(),
    category: text('category'),
    channel: text('channel').notNull().default('sms'),
    body: text('body').notNull(),
    variables: jsonb('variables').notNull().default([]),
    createdBy: uuid('created_by').references(() => users.id),
    updatedBy: uuid('updated_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_message_templates_tenant').on(table.tenantId),
  }),
);

// 14. Messages
export const messages = pgTable(
  'messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    channel: text('channel').notNull(),
    templateId: uuid('template_id').references(() => messageTemplates.id),
    bodySnapshot: text('body_snapshot').notNull(),
    filtersSnapshot: jsonb('filters_snapshot').notNull().default({}),
    audienceSizeEstimate: integer('audience_size_estimate'),
    status: text('status').notNull().default('queued'),
    errorSummary: text('error_summary'),
    sentBy: uuid('sent_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_messages_tenant').on(table.tenantId),
    statusIdx: index('idx_messages_status').on(table.status),
  }),
);

// 15. Message Recipients
export const messageRecipients = pgTable(
  'message_recipients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    messageId: uuid('message_id')
      .notNull()
      .references(() => messages.id),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    parentId: uuid('parent_id').references(() => parents.id),
    studentId: uuid('student_id').references(() => students.id),
    phone: text('phone').notNull(),
    status: text('status').notNull().default('queued'),
    providerMessageId: text('provider_message_id'),
    providerResponse: jsonb('provider_response'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    messageIdx: index('idx_message_recipients_message').on(table.messageId),
    tenantIdx: index('idx_message_recipients_tenant').on(table.tenantId),
  }),
);

// 16. Tenant API Keys
export const tenantApiKeys = pgTable(
  'tenant_api_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id),
    publicKey: text('public_key').notNull().unique(),
    secretKey: text('secret_key').notNull(), // Encrypted
    status: text('status').notNull().default('active'),
    createdBy: uuid('created_by').references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => ({
    tenantIdx: index('idx_tenant_api_keys_tenant').on(table.tenantId),
    publicKeyIdx: index('idx_tenant_api_keys_public_key').on(table.publicKey),
  }),
);

// 17. Audit Logs
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').references(() => tenants.id),
    userId: uuid('user_id').references(() => users.id),
    action: text('action').notNull(),
    entityType: text('entity_type'),
    entityId: uuid('entity_id'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    tenantIdx: index('idx_audit_logs_tenant').on(table.tenantId),
    userIdx: index('idx_audit_logs_user').on(table.userId),
    actionIdx: index('idx_audit_logs_action').on(table.action),
    createdAtIdx: index('idx_audit_logs_created_at').on(table.createdAt),
  }),
);

// 18. Registrations (Transient State for Wizard)
export const registrations = pgTable('registrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').references(() => tenants.id),
  userId: uuid('user_id').references(() => users.id),
  status: text('status').default('draft'),
  step: text('step').default('start'),
  data: jsonb('data').default({}),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// Relations (optional, for easier queries)
export const tenantsRelations = relations(tenants, ({ many }) => ({
  memberships: many(tenantMemberships),
  families: many(families),
  programs: many(programs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(tenantMemberships),
}));

export const familiesRelations = relations(families, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [families.tenantId],
    references: [tenants.id],
  }),
  parents: many(parents),
  students: many(students),
  enrollments: many(enrollments),
}));

export const parentsRelations = relations(parents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [parents.tenantId],
    references: [tenants.id],
  }),
  family: one(families, {
    fields: [parents.familyId],
    references: [families.id],
  }),
  user: one(users, {
    fields: [parents.userId],
    references: [users.id],
  }),
}));
