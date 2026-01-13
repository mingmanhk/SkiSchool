-- Public Site Builder Schema
-- Stores configuration for the tenant's public facing site

CREATE TABLE IF NOT EXISTS public_site_config (
    school_id UUID PRIMARY KEY REFERENCES schools(id) ON DELETE CASCADE,
    
    -- Branding
    logo_url TEXT,
    primary_color TEXT DEFAULT '#2563EB',
    secondary_color TEXT DEFAULT '#1E40AF',
    font_family TEXT DEFAULT 'Inter',
    
    -- Navigation
    -- Stored as JSONB: [{"label":"Programs","href":"/programs", "order": 1}, ...]
    navigation JSONB DEFAULT '[{"label":"Programs","href":"/programs"},{"label":"Register","href":"/register"}]'::jsonb,
    
    -- Hero Section
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_bg_image TEXT,
    hero_description TEXT,
    hero_cta_text TEXT DEFAULT 'Register Now',
    hero_cta_link TEXT DEFAULT '/register',
    
    -- Content Sections
    -- Stored as JSONB array of objects
    -- Example: 
    -- [
    --   { "id": "1", "type": "highlight", "title": "Race Team", "image": "...", "description": "..." },
    --   { "id": "2", "type": "text", "content": "<h1>About Us</h1>..." }
    -- ]
    sections JSONB DEFAULT '[]'::jsonb,
    
    -- Pages Config
    -- specific configs for standard pages
    about_page_content JSONB,
    donate_url TEXT,
    
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public_site_config ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view the public site config)
-- Ideally this is cached at the edge, but for DB access:
CREATE POLICY "Public read site config" ON public_site_config
    FOR SELECT
    USING (true);

-- Admins write access
CREATE POLICY "Admins manage site config" ON public_site_config
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = public_site_config.school_id
            AND users.role IN ('OWNER', 'ADMIN')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.school_id = public_site_config.school_id
            AND users.role IN ('OWNER', 'ADMIN')
        )
    );
