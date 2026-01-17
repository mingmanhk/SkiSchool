-- Multi-tenant RLS Policies

-- Tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Public can read basic tenant info (for site resolution)
CREATE POLICY "Public read tenants" ON tenants
  FOR SELECT USING (true);

-- Only platform admins can insert/update tenants (TODO: Define platform admin role)
-- For now, maybe disable insert/update via RLS for public

-- Tenant Memberships
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

-- Users can view their own memberships
CREATE POLICY "Users view own memberships" ON tenant_memberships
  FOR SELECT USING (auth.uid() = user_id);

-- Tenant Admins can view memberships for their tenant
CREATE POLICY "Tenant Admins view tenant memberships" ON tenant_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_memberships admin_membership
      WHERE admin_membership.user_id = auth.uid()
      AND admin_membership.tenant_id = tenant_memberships.tenant_id
      AND admin_membership.role = 'tenant_admin'
    )
  );

-- Application Function for current_tenant_id (if we use a session variable)
-- OR we rely on the application to enforce tenant_id in queries.
-- For RLS, we often set a session variable 'app.current_tenant_id'
-- set_config('app.current_tenant_id', '...', false)

-- Example RLS for tenant-scoped tables (to be applied to Programs, etc.)
-- CREATE POLICY "Tenant Isolation" ON some_table
--   USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
