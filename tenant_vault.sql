-- Tenant Integration Key Vault Schema
-- Enforces isolation and secure storage for third-party keys

-- 1. Tenants table (Context)
-- Renamed from 'schools' to 'tenants' to match Master Design
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active', -- active, suspended, trial
    feature_flags JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Integration Configs (The Vault)
-- Merged distinct provider columns into JSONB blobs per Master Design for flexibility
-- But keeping key columns if preferred for strict schema. 
-- The Master Design suggests: "payments (JSONB), accounting (JSONB)".
-- However, strict columns are often safer for RLS. 
-- I will follow the SQL structure I defined in SPECIFICATION.md which matches the robust column approach + flags.

CREATE TABLE IF NOT EXISTS integration_configs (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Payment Providers (Encrypted values stored here)
    stripe_secret_key TEXT, 
    stripe_publishable_key TEXT,
    stripe_webhook_secret TEXT,
    paypal_client_id TEXT,
    paypal_client_secret TEXT,
    
    -- Accounting
    quickbooks_client_id TEXT,
    quickbooks_client_secret TEXT,
    quickbooks_refresh_token TEXT,
    quickbooks_realm_id TEXT,
    
    -- AI & SMS (Behavioral settings only - keys are Platform-owned)
    ai_settings JSONB DEFAULT '{}'::jsonb,
    sms_settings JSONB DEFAULT '{}'::jsonb,
    
    updated_by UUID, -- Audit
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tenant API Keys
CREATE TABLE IF NOT EXISTS tenant_api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    label TEXT,
    permissions JSONB DEFAULT '["read"]'::jsonb,
    status TEXT DEFAULT 'active',
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID -- Audit
);

-- 4. Enable RLS
ALTER TABLE integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_api_keys ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies

-- Policy: Only OWNER and ADMIN can view/edit integrations
CREATE POLICY "Admins manage integrations" ON integration_configs
    USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships 
            WHERE tenant_memberships.user_id = auth.uid() 
            AND tenant_memberships.tenant_id = integration_configs.tenant_id
            AND tenant_memberships.role IN ('tenant_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships 
            WHERE tenant_memberships.user_id = auth.uid() 
            AND tenant_memberships.tenant_id = integration_configs.tenant_id
            AND tenant_memberships.role IN ('tenant_admin')
        )
    );

-- Policy: Only OWNER and ADMIN can manage API keys
CREATE POLICY "Admins manage api keys" ON tenant_api_keys
    USING (
        EXISTS (
            SELECT 1 FROM tenant_memberships 
            WHERE tenant_memberships.user_id = auth.uid() 
            AND tenant_memberships.tenant_id = tenant_api_keys.tenant_id
            AND tenant_memberships.role IN ('tenant_admin')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM tenant_memberships 
            WHERE tenant_memberships.user_id = auth.uid() 
            AND tenant_memberships.tenant_id = tenant_api_keys.tenant_id
            AND tenant_memberships.role IN ('tenant_admin')
        )
    );

-- Indexing
CREATE INDEX idx_tenant_api_keys_tenant_id ON tenant_api_keys(tenant_id);
