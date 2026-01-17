import { pgTable, text, timestamp, uuid, varchar, jsonb, integer } from 'drizzle-orm/pg-core';

// --- Phase 0: Foundations (Multi-tenant) ---

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  status: text('status').$type<'active' | 'suspended' | 'trial'>().default('active').notNull(),
  feature_flags: jsonb('feature_flags').default({}),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  auth_user_id: text('auth_user_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const tenant_memberships = pgTable('tenant_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  role: text('role').$type<'tenant_admin' | 'staff' | 'parent' | 'student'>().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// --- Phase 1: Programs & Site Config ---

export const site_configs = pgTable('site_configs', {
  tenant_id: uuid('tenant_id').references(() => tenants.id).primaryKey(),
  navigation: jsonb('navigation').default([]),
  branding: jsonb('branding').default({}),
  logos: jsonb('logos').default({}),
  layout: jsonb('layout').default({}),
  hero: jsonb('hero').default({}),
  sections: jsonb('sections').default([]),
  about_sections: jsonb('about_sections').default([]),
  team_sections: jsonb('team_sections').default([]),
  custom_pages: jsonb('custom_pages').default([]),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const programs = pgTable('programs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  discipline: text('discipline'),
  age_min: integer('age_min'),
  age_max: integer('age_max'),
  skill_level: text('skill_level'),
  season_year: integer('season_year'),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  location: text('location'),
  price: integer('price'), // in cents
  capacity: integer('capacity'),
  description: text('description'),
  visibility_status: text('visibility_status').$type<'public' | 'hidden'>().default('public').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// --- Phase 2: Registration & Payments ---

export const families = pgTable('families', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  name: text('name').notNull(),
  primary_email: text('primary_email'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const parents = pgTable('parents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  family_id: uuid('family_id').references(() => families.id).notNull(),
  user_id: uuid('user_id').references(() => users.id),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  family_id: uuid('family_id').references(() => families.id).notNull(),
  first_name: text('first_name').notNull(),
  last_name: text('last_name').notNull(),
  date_of_birth: timestamp('date_of_birth'),
  skill_level: text('skill_level'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const enrollments = pgTable('enrollments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  family_id: uuid('family_id').references(() => families.id).notNull(),
  student_id: uuid('student_id').references(() => students.id).notNull(),
  program_id: uuid('program_id').references(() => programs.id).notNull(),
  status: text('status').$type<'pending' | 'confirmed' | 'cancelled'>().default('pending').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  family_id: uuid('family_id').references(() => families.id),
  amount: integer('amount').notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(),
  provider: text('provider'),
  provider_transaction_id: text('provider_transaction_id'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const integration_configs = pgTable('integration_configs', {
  tenant_id: uuid('tenant_id').references(() => tenants.id).primaryKey(),
  payments: jsonb('payments').default({}),
  accounting: jsonb('accounting').default({}),
  ai_settings: jsonb('ai_settings').default({}),
  sms_settings: jsonb('sms_settings').default({}),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// --- Phase 4: Custom Domains ---

export const tenant_domains = pgTable('tenant_domains', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenant_id: uuid('tenant_id').references(() => tenants.id).notNull(),
  domain: text('domain').notNull().unique(),
  status: text('status').$type<'pending' | 'active' | 'failed'>().default('pending').notNull(),
  verification_token: text('verification_token'),
  ssl_status: text('ssl_status').default('pending'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// --- Legacy / Other Tables (Refactoring in progress) ---

export const instructor_profiles = pgTable('instructor_profiles', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  first_name: text('first_name'),
  last_name: text('last_name'),
  bio: text('bio'),
  photo_url: text('photo_url'),
});

export const class_series = pgTable('class_series', {
  id: uuid('id').primaryKey(),
  program_id: uuid('program_id').references(() => programs.id),
  start_date: timestamp('start_date'),
  end_date: timestamp('end_date'),
  day_of_week: text('day_of_week'),
  start_time: text('start_time'),
  end_time: text('end_time'),
  max_students: text('max_students'),
});

export const class_occurrences = pgTable('class_occurrences', {
  id: uuid('id').primaryKey(),
  class_series_id: uuid('class_series_id').references(() => class_series.id),
  date: timestamp('date'),
});

export const class_instructors = pgTable('class_instructors', {
  id: uuid('id').primaryKey(),
  class_occurrence_id: uuid('class_occurrence_id').references(() => class_occurrences.id),
  instructor_id: uuid('instructor_id').references(() => instructor_profiles.id),
});

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey(),
  enrollment_id: uuid('enrollment_id').references(() => enrollments.id),
  class_occurrence_id: uuid('class_occurrence_id').references(() => class_occurrences.id),
  present: text('present'),
});

export const report_cards = pgTable('report_cards', {
  id: uuid('id').primaryKey(),
  enrollment_id: uuid('enrollment_id').references(() => enrollments.id),
  instructor_id: uuid('instructor_id').references(() => instructor_profiles.id),
  date: timestamp('date'),
  notes: text('notes'),
  skills: text('skills'),
});
