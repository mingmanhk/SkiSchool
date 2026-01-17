-- Ski School OS - Corrected Master Database Schema
-- Version: 3.0.0 - SECURITY HARDENED
-- Fixes: Schema consolidation, complete RLS policies, proper indexes

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE TABLES
-- =====================================================

-- 1. Tenants
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Users (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL CHECK (role IN ('tenant_admin', 'staff', 'parent', 'instructor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tenant Memberships
CREATE TABLE IF NOT EXISTS public.tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('tenant_admin', 'staff', 'parent', 'instructor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, role)
);

-- 4. Families
CREATE TABLE IF NOT EXISTS public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  primary_parent_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Parents
CREATE TABLE IF NOT EXISTS public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  phone text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.families ADD CONSTRAINT IF NOT EXISTS fk_families_primary_parent 
FOREIGN KEY (primary_parent_id) REFERENCES public.parents(id) ON DELETE SET NULL;

-- 6. Students
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  birthdate date,
  gender text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Programs
CREATE TABLE IF NOT EXISTS public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_zh text,
  discipline text,
  age_min int CHECK (age_min >= 0),
  age_max int CHECK (age_max >= age_min),
  skill_level text,
  season_year int,
  start_date date,
  end_date date CHECK (end_date >= start_date),
  location text,
  price numeric(10,2) CHECK (price >= 0),
  capacity int CHECK (capacity > 0),
  description text,
  description_zh text,
  visibility_status text NOT NULL DEFAULT 'public' CHECK (visibility_status IN ('public', 'private', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Enrollments
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  enrollment_id uuid REFERENCES public.enrollments(id) ON DELETE SET NULL,
  provider text NOT NULL CHECK (provider IN ('stripe', 'paypal', 'cash', 'check', 'other')),
  provider_payment_id text,
  amount numeric(10,2) NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Integration Configs (Encrypted Vault)
CREATE TABLE IF NOT EXISTS public.integration_configs (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  payments jsonb NOT NULL DEFAULT '{}'::jsonb,
  accounting jsonb NOT NULL DEFAULT '{}'::jsonb,
  ai_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  sms_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Site Configs
CREATE TABLE IF NOT EXISTS public.site_configs (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
  navigation jsonb NOT NULL DEFAULT '[]'::jsonb,
  branding jsonb NOT NULL DEFAULT '{}'::jsonb,
  logos jsonb NOT NULL DEFAULT '{}'::jsonb,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero jsonb NOT NULL DEFAULT '{}'::jsonb,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  about_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  team_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  custom_pages jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 12. Tenant Domains
CREATE TABLE IF NOT EXISTS public.tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'failed')),
  verification_token text NOT NULL,
  last_verified_at timestamptz,
  ssl_status text NOT NULL DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Message Threads
CREATE TABLE IF NOT EXISTS public.message_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  title text,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. Thread Participants
CREATE TABLE IF NOT EXISTS public.thread_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (thread_id, user_id)
);

-- 15. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL REFERENCES public.message_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 16. Message Templates (for bulk SMS)
CREATE TABLE IF NOT EXISTS public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_zh text,
  category text,
  channel text NOT NULL DEFAULT 'sms' CHECK (channel IN ('sms', 'email', 'push')),
  body text NOT NULL,
  body_zh text,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 17. Bulk Message Sends
CREATE TABLE IF NOT EXISTS public.bulk_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('sms', 'email', 'push')),
  template_id uuid REFERENCES public.message_templates(id) ON DELETE SET NULL,
  body_snapshot text NOT NULL,
  filters_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  audience_size_estimate int,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'completed', 'failed')),
  error_summary text,
  sent_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 18. Bulk Message Recipients
CREATE TABLE IF NOT EXISTS public.bulk_message_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.bulk_messages(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES public.parents(id) ON DELETE SET NULL,
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  phone text,
  email text,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed', 'bounced')),
  provider_message_id text,
  provider_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 19. Instructor Goals
CREATE TABLE IF NOT EXISTS public.instructor_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_date date,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 20. Instructor Coaching Sessions
CREATE TABLE IF NOT EXISTS public.instructor_coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.instructor_goals(id) ON DELETE SET NULL,
  coach_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  notes text,
  session_date date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 21. Class Status Events
CREATE TABLE IF NOT EXISTS public.class_status_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  instructor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'canceled')),
  message text,
  message_zh text,
  event_time timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 22. Student Skill Events
CREATE TABLE IF NOT EXISTS public.student_skill_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  skill text NOT NULL,
  skill_zh text,
  level text,
  note text,
  note_zh text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 23. Badges (Master List)
CREATE TABLE IF NOT EXISTS public.badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_zh text,
  description text,
  description_zh text,
  icon_url text,
  criteria jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 24. Student Badges
CREATE TABLE IF NOT EXISTS public.student_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, badge_id)
);

-- 25. Student Media
CREATE TABLE IF NOT EXISTS public.student_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video', 'document')),
  url text NOT NULL,
  caption text,
  caption_zh text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 26. Tenant API Keys
CREATE TABLE IF NOT EXISTS public.tenant_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  public_key text NOT NULL UNIQUE,
  secret_key_hash text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

-- 27. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 28. Registrations (Wizard State)
CREATE TABLE IF NOT EXISTS public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'completed', 'abandoned')),
  step text DEFAULT 'start',
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Tenant isolation indexes
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_tenant ON public.tenant_memberships(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_memberships_user ON public.tenant_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_families_tenant ON public.families(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parents_tenant ON public.parents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_parents_family ON public.parents(family_id);
CREATE INDEX IF NOT EXISTS idx_parents_user ON public.parents(user_id);
CREATE INDEX IF NOT EXISTS idx_parents_email ON public.parents(email);
CREATE INDEX IF NOT EXISTS idx_students_tenant ON public.students(tenant_id);
CREATE INDEX IF NOT EXISTS idx_students_family ON public.students(family_id);
CREATE INDEX IF NOT EXISTS idx_programs_tenant ON public.programs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_programs_visibility ON public.programs(tenant_id, visibility_status);
CREATE INDEX IF NOT EXISTS idx_enrollments_tenant ON public.enrollments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON public.enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_program ON public.enrollments(program_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_family ON public.enrollments(family_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment ON public.payments(enrollment_id);

-- Messaging indexes
CREATE INDEX IF NOT EXISTS idx_message_threads_tenant ON public.message_threads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_thread ON public.thread_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user ON public.thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant ON public.messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_bulk_messages_tenant ON public.bulk_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bulk_message_recipients_message ON public.bulk_message_recipients(message_id);

-- Instructor & coaching indexes
CREATE INDEX IF NOT EXISTS idx_instructor_goals_tenant ON public.instructor_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_instructor_goals_instructor ON public.instructor_goals(instructor_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_tenant ON public.instructor_coaching_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_instructor ON public.instructor_coaching_sessions(instructor_id);

-- Student portfolio indexes
CREATE INDEX IF NOT EXISTS idx_student_skills_tenant ON public.student_skill_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_student ON public.student_skill_events(student_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_tenant ON public.student_badges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_badges_student ON public.student_badges(student_id);
CREATE INDEX IF NOT EXISTS idx_student_media_tenant ON public.student_media(tenant_id);
CREATE INDEX IF NOT EXISTS idx_student_media_student ON public.student_media(student_id);
CREATE INDEX IF NOT EXISTS idx_class_status_tenant ON public.class_status_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_class_status_program ON public.class_status_events(program_id);

-- Audit & registration indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_tenant ON public.registrations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);

-- =====================================================
-- ROW LEVEL SECURITY SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_skill_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- NOTE: Comprehensive RLS policies are defined in policies_corrected.sql
-- This separation keeps the schema file focused on structure
