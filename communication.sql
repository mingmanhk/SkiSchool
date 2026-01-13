-- Communication System Schema
-- Messaging, Templates, and Logs

-- 1. Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT, -- 'weather', 'payment', 'general', 'emergency'
    body TEXT NOT NULL, -- Supports {{variables}}
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Message Logs
CREATE TABLE IF NOT EXISTS message_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    
    -- Message Details
    channel TEXT NOT NULL, -- 'sms', 'email', 'app'
    direction TEXT NOT NULL, -- 'outbound', 'inbound'
    recipient TEXT NOT NULL, -- Phone number or Email
    
    -- Content
    template_id UUID REFERENCES message_templates(id),
    content_snapshot TEXT, -- The actual text sent
    
    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
    provider_id TEXT, -- External ID from Twilio/SendGrid
    error_message TEXT,
    
    -- Metadata
    sent_by UUID REFERENCES users(id), -- NULL if system automated
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_logs ENABLE ROW LEVEL SECURITY;

-- Policies for Templates
CREATE POLICY "Admins manage templates" ON message_templates
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = message_templates.school_id
            AND users.role IN ('OWNER', 'ADMIN', 'INSTRUCTOR')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = message_templates.school_id
            AND users.role IN ('OWNER', 'ADMIN')
        )
    );

-- Policies for Logs
CREATE POLICY "Admins view logs" ON message_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = message_logs.school_id
            AND users.role IN ('OWNER', 'ADMIN')
        )
    );

-- Only system or admins can insert logs (usually done via API)
CREATE POLICY "Admins create logs" ON message_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = message_logs.school_id
            AND users.role IN ('OWNER', 'ADMIN')
        )
    );

-- Indexes
CREATE INDEX idx_message_logs_school_id ON message_logs(school_id);
CREATE INDEX idx_message_logs_recipient ON message_logs(recipient);
CREATE INDEX idx_message_logs_created_at ON message_logs(sent_at);
