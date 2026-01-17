-- Ski School OS - Corrected RLS Policies
-- Version: 3.0.0 - SECURITY HARDENED
-- Aligned with schema_corrected.sql

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Get the current user's authenticated ID
CREATE OR REPLACE FUNCTION auth.get_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get the active tenant_id for the current user from their JWT claims
CREATE OR REPLACE FUNCTION auth.get_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Get the role of the current user within their active tenant
CREATE OR REPLACE FUNCTION auth.get_tenant_role()
RETURNS text AS $$
BEGIN
  RETURN (SELECT role 
          FROM public.tenant_memberships 
          WHERE user_id = auth.get_user_id() 
            AND tenant_id = auth.get_tenant_id());
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Check if the current user is a member of a specific tenant
CREATE OR REPLACE FUNCTION auth.is_tenant_member(p_tenant_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.tenant_memberships 
    WHERE user_id = auth.get_user_id() 
      AND tenant_id = p_tenant_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Reset all existing policies on tables to avoid conflicts
DROP POLICY IF EXISTS "Tenant isolation" ON public.families; -- From old schema
-- (Add more DROP POLICY statements here if resetting an existing DB)


-- 1. Tenants
-- Users can see tenants they are a member of.
CREATE POLICY "Allow read access to members" ON public.tenants
  FOR SELECT USING (auth.is_tenant_member(id));

-- 2. Users
-- Users can view/edit their own profile.
CREATE POLICY "Allow self read and update" ON public.users
  FOR ALL USING (id = auth.get_user_id())
  WITH CHECK (id = auth.get_user_id());

-- Allow admins of a tenant to see other members of that tenant.
CREATE POLICY "Allow tenant admins to view members" ON public.users
  FOR SELECT USING (
    auth.get_tenant_role() = 'tenant_admin' AND
    EXISTS (
      SELECT 1 FROM public.tenant_memberships
      WHERE tenant_memberships.tenant_id = auth.get_tenant_id()
        AND tenant_memberships.user_id = public.users.id
    )
  );

-- 3. Tenant Memberships
-- Users can see their own membership.
-- Tenant admins can see all memberships for their tenant.
CREATE POLICY "Allow read access to members and admins" ON public.tenant_memberships
  FOR SELECT USING (
    user_id = auth.get_user_id() OR
    (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin')
  );

-- Tenant admins can manage memberships for their tenant.
CREATE POLICY "Allow tenant admins to manage memberships" ON public.tenant_memberships
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin')
  WITH CHECK (tenant_id = auth.get_tenant_id());

-- 4. Families, 5. Parents, 6. Students
-- Core Principle: All data is isolated by tenant_id.
CREATE POLICY "Enable read access based on tenant membership" ON public.families
  FOR SELECT USING (tenant_id = auth.get_tenant_id());
CREATE POLICY "Enable full access based on tenant membership" ON public.families
  FOR ALL USING (tenant_id = auth.get_tenant_id())
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Enable read access based on tenant membership" ON public.parents
  FOR SELECT USING (tenant_id = auth.get_tenant_id());
CREATE POLICY "Enable full access based on tenant membership" ON public.parents
  FOR ALL USING (tenant_id = auth.get_tenant_id())
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Enable read access based on tenant membership" ON public.students
  FOR SELECT USING (tenant_id = auth.get_tenant_id());
CREATE POLICY "Enable full access based on tenant membership" ON public.students
  FOR ALL USING (tenant_id = auth.get_tenant_id())
  WITH CHECK (tenant_id = auth.get_tenant_id());

-- Additionally, parents can only see students in their own family.
-- (This requires a more complex check, adding as an example of ownership)
-- DROP POLICY "Enable read access based on tenant membership" ON public.students; -- remove generic one first
-- CREATE POLICY "Parents can view their own children" ON public.students
--   FOR SELECT USING (
--     tenant_id = auth.get_tenant_id() AND
--     (
--       auth.get_tenant_role() IN ('tenant_admin', 'staff', 'instructor') OR
--       (
--         auth.get_tenant_role() = 'parent' AND
--         family_id = (SELECT p.family_id FROM public.parents p WHERE p.user_id = auth.get_user_id() AND p.tenant_id = auth.get_tenant_id() LIMIT 1)
--       )
--     )
--   );


-- 7. Programs
-- Public programs are visible to all members of a tenant.
-- Private/archived programs only visible to admin/staff.
CREATE POLICY "Allow read access for public programs" ON public.programs
  FOR SELECT USING (
    tenant_id = auth.get_tenant_id() AND
    (
      visibility_status = 'public' OR
      auth.get_tenant_role() IN ('tenant_admin', 'staff')
    )
  );

-- Admins/staff can manage all programs.
CREATE POLICY "Allow full access for admins and staff" ON public.programs
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() IN ('tenant_admin', 'staff'))
  WITH CHECK (tenant_id = auth.get_tenant_id());

-- 8. Enrollments & 9. Payments
-- Users can see enrollments/payments for their own family.
-- Admins/staff can see all for the tenant.
CREATE POLICY "Allow access based on family and tenant role" ON public.enrollments
  FOR ALL USING (
    tenant_id = auth.get_tenant_id() AND
    (
      auth.get_tenant_role() IN ('tenant_admin', 'staff') OR
      (
        auth.get_tenant_role() = 'parent' AND
        family_id = (SELECT p.family_id FROM public.parents p WHERE p.user_id = auth.get_user_id() AND p.tenant_id = auth.get_tenant_id() LIMIT 1)
      )
    )
  )
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Allow access based on tenant role and enrollment" ON public.payments
  FOR ALL USING (
    tenant_id = auth.get_tenant_id() AND
    (
      auth.get_tenant_role() IN ('tenant_admin', 'staff') OR
      EXISTS (
        SELECT 1 FROM public.enrollments e
        JOIN public.parents p ON e.family_id = p.family_id
        WHERE e.id = public.payments.enrollment_id
          AND p.user_id = auth.get_user_id()
      )
    )
  )
  WITH CHECK (tenant_id = auth.get_tenant_id());

-- 10. Integration Configs, 11. Site Configs, 12. Tenant Domains, 26. Tenant API Keys
-- Only tenant admins can access these sensitive settings.
CREATE POLICY "Allow full access for tenant admins" ON public.integration_configs
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin')
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Allow full access for tenant admins" ON public.site_configs
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin')
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Allow full access for tenant admins" ON public.tenant_domains
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin')
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Allow full access for tenant admins" ON public.tenant_api_keys
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin')
  WITH CHECK (tenant_id = auth.get_tenant_id());


-- 13, 14, 15. Messaging (Threads, Participants, Messages)
-- Users can only see threads they are a participant in.
CREATE POLICY "Allow access to participants" ON public.message_threads
  FOR ALL USING (
    tenant_id = auth.get_tenant_id() AND
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = public.message_threads.id
        AND tp.user_id = auth.get_user_id()
    )
  )
  WITH CHECK (tenant_id = auth.get_tenant_id());

CREATE POLICY "Allow access to participants" ON public.thread_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = public.thread_participants.thread_id
        AND mt.tenant_id = auth.get_tenant_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.message_threads mt
      WHERE mt.id = public.thread_participants.thread_id
        AND mt.tenant_id = auth.get_tenant_id()
    )
  );
  
CREATE POLICY "Allow access to participants" ON public.messages
  FOR ALL USING (
    tenant_id = auth.get_tenant_id() AND
    EXISTS (
      SELECT 1 FROM public.thread_participants tp
      WHERE tp.thread_id = public.messages.thread_id
        AND tp.user_id = auth.get_user_id()
    )
  )
  WITH CHECK (tenant_id = auth.get_tenant_id() AND sender_id = auth.get_user_id());


-- 19-25. Student Portfolio & Coaching (Skills, Badges, Media, Goals, etc.)
-- Tenant-wide isolation + role-based access
CREATE POLICY "Allow tenant-wide access" ON public.student_skill_events FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());
CREATE POLICY "Allow tenant-wide access" ON public.student_badges FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());
CREATE POLICY "Allow tenant-wide access" ON public.student_media FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());
CREATE POLICY "Allow tenant-wide access" ON public.instructor_goals FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());
CREATE POLICY "Allow tenant-wide access" ON public.instructor_coaching_sessions FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());
CREATE POLICY "Allow tenant-wide access" ON public.class_status_events FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());
CREATE POLICY "Allow tenant-wide access" ON public.badges FOR ALL USING (tenant_id = auth.get_tenant_id()) WITH CHECK (tenant_id = auth.get_tenant_id());

-- Example of more granular control: Instructors can only modify their assigned students
-- CREATE POLICY "Instructors can manage their students' portfolios" ON public.student_skill_events
--   FOR ALL USING (
--     tenant_id = auth.get_tenant_id() AND
--     (
--       auth.get_tenant_role() IN ('tenant_admin', 'staff') OR
--       (
--         auth.get_tenant_role() = 'instructor' AND
--         instructor_id = auth.get_user_id()
--       )
--     )
--   )
--   WITH CHECK (tenant_id = auth.get_tenant_id() AND instructor_id = auth.get_user_id());


-- 27. Audit Logs
-- Only tenant admins can view audit logs for their tenant.
CREATE POLICY "Allow read access for tenant admins" ON public.audit_logs
  FOR SELECT USING (tenant_id = auth.get_tenant_id() AND auth.get_tenant_role() = 'tenant_admin');

-- 28. Registrations
-- Users can only manage their own registration session.
CREATE POLICY "Allow users to manage their own registration" ON public.registrations
  FOR ALL USING (tenant_id = auth.get_tenant_id() AND user_id = auth.get_user_id())
  WITH CHECK (tenant_id = auth.get_tenant_id() AND user_id = auth.get_user_id());

-- Grant usage on all functions in auth schema to postgres and anon roles
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Grant execute on all functions in auth schema to postgres and anon roles
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO postgres, anon, authenticated, service_role;

-- Done
