-- Ski School OS - Master Database Schema
-- Version: 2.0.0
-- Aligned 100% with Master Design

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants
CREATE TABLE public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active, suspended, trial
  feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Users
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid, -- linked to Supabase Auth auth.users.id
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Tenant Memberships
CREATE TABLE public.tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  user_id uuid NOT NULL REFERENCES public.users(id),
  role text NOT NULL, -- tenant_admin, staff, parent
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, role)
);

-- 4. Families
CREATE TABLE public.families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  primary_parent_id uuid, -- Circular reference, handled carefully or alter table later
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Parents
CREATE TABLE public.parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  family_id uuid NOT NULL REFERENCES public.families(id),
  user_id uuid REFERENCES public.users(id), -- Optional link to login
  email text NOT NULL,
  phone text,
  first_name text,
  last_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add foreign key for primary_parent_id now that parents exists
ALTER TABLE public.families ADD CONSTRAINT fk_families_primary_parent 
FOREIGN KEY (primary_parent_id) REFERENCES public.parents(id);

-- 6. Students
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  family_id uuid NOT NULL REFERENCES public.families(id),
  first_name text NOT NULL,
  last_name text NOT NULL,
  birthdate date,
  gender text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Programs
CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL,
  discipline text,
  age_min int,
  age_max int,
  skill_level text,
  season_year int,
  start_date date,
  end_date date,
  location text,
  price numeric(10,2),
  capacity int,
  description text,
  visibility_status text NOT NULL DEFAULT 'public',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. Enrollments
CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  family_id uuid NOT NULL REFERENCES public.families(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  program_id uuid NOT NULL REFERENCES public.programs(id),
  status text NOT NULL DEFAULT 'pending', -- pending, confirmed, canceled
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  enrollment_id uuid REFERENCES public.enrollments(id),
  provider text NOT NULL, -- stripe, paypal
  provider_payment_id text,
  amount numeric(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Integration Configs (The Vault)
CREATE TABLE public.integration_configs (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id),
  payments jsonb NOT NULL DEFAULT '{}'::jsonb,     -- Stripe/PayPal keys (Encrypted)
  accounting jsonb NOT NULL DEFAULT '{}'::jsonb,   -- QuickBooks keys (Encrypted)
  ai_settings jsonb NOT NULL DEFAULT '{}'::jsonb,  -- Behavioral settings
  sms_settings jsonb NOT NULL DEFAULT '{}'::jsonb, -- SMS behavior
  updated_by uuid REFERENCES public.users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 11. Site Configs
CREATE TABLE public.site_configs (
  tenant_id uuid PRIMARY KEY REFERENCES public.tenants(id),
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
CREATE TABLE public.tenant_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  domain text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending_verification',
  verification_token text NOT NULL,
  last_verified_at timestamptz,
  ssl_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 13. Message Templates
CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  name text NOT NULL,
  category text,
  channel text NOT NULL DEFAULT 'sms',
  body text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid REFERENCES public.users(id),
  updated_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 14. Messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  channel text NOT NULL,
  template_id uuid REFERENCES public.message_templates(id),
  body_snapshot text NOT NULL,
  filters_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  audience_size_estimate int,
  status text NOT NULL DEFAULT 'queued',
  error_summary text,
  sent_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 15. Message Recipients
CREATE TABLE public.message_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  parent_id uuid REFERENCES public.parents(id),
  student_id uuid REFERENCES public.students(id),
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  provider_message_id text,
  provider_response jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 16. Tenant API Keys
CREATE TABLE public.tenant_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  public_key text NOT NULL UNIQUE,
  secret_key text NOT NULL, -- Encrypted
  status text NOT NULL DEFAULT 'active',
  created_by uuid REFERENCES public.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);

-- 17. Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES public.tenants(id),
  user_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 18. Registrations (Transient State for Wizard)
-- Not in master seed, but required for implementation of complex flows
CREATE TABLE public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id),
    user_id UUID REFERENCES public.users(id),
    status TEXT DEFAULT 'draft', 
    step TEXT DEFAULT 'start',
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- --- RLS POLICIES (Security Best Practice) ---
-- All tables with tenant_id must have RLS.

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Basic Policy Example (Tenant Isolation)
-- A real implementation needs a 'current_tenant_id()' function or claim.
-- For now, we define the structure.

CREATE POLICY "Tenant isolation" ON families
    USING (tenant_id = (SELECT (auth.jwt() ->> 'tenant_id')::uuid));

-- (Repeat similar policies for all tenant-scoped tables)

-- Indexes (Performance Best Practice)
CREATE INDEX idx_parents_tenant ON parents(tenant_id);
CREATE INDEX idx_students_tenant ON students(tenant_id);
CREATE INDEX idx_enrollments_tenant ON enrollments(tenant_id);
CREATE INDEX idx_messages_tenant ON messages(tenant_id);
