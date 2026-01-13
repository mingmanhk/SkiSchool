-- Registration System Schema
-- Handles transient registration state and linking to core tables

-- 1. Registrations (Checkout Session State)
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    
    -- Link to user if logged in, or NULL if guest starting
    user_id UUID REFERENCES users(id),
    
    -- Status tracking
    status TEXT DEFAULT 'draft', -- 'draft', 'awaiting_payment', 'completed', 'abandoned'
    step TEXT DEFAULT 'start', -- 'family', 'students', 'programs', 'waivers', 'checkout'
    
    -- Data payload (JSONB for flexibility during wizard)
    -- Stores { parent: {...}, students: [...], cart: [...] }
    data JSONB DEFAULT '{}'::jsonb,
    
    -- Payment intent reference
    stripe_payment_intent_id TEXT,
    stripe_client_secret TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Users can see their own registrations
CREATE POLICY "Users manage own registrations" ON registrations
    USING (
        (auth.uid() = user_id) OR 
        (status = 'draft' AND user_id IS NULL) -- Allow guest creation (handled via session/cookie usually, but for DB we might rely on anon token)
    )
    WITH CHECK (
        (auth.uid() = user_id) OR
        (status = 'draft' AND user_id IS NULL)
    );

-- Admins can view all registrations for their school
CREATE POLICY "Admins view school registrations" ON registrations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = registrations.school_id
            AND users.role IN ('OWNER', 'ADMIN')
        )
    );
