
-- 1. LOCALIZATION & AGE LIMITS FOR PROGRAMS
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT,
ADD COLUMN IF NOT EXISTS min_age INTEGER NOT NULL DEFAULT 3,
ADD COLUMN IF NOT EXISTS max_age INTEGER NOT NULL DEFAULT 99;

-- Backfill default language if needed
UPDATE programs SET name_en = name, description_en = description WHERE name_en IS NULL;

-- 2. STUDENT BIRTHDATE & AGE
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS birthdate DATE NOT NULL DEFAULT '2010-01-01', -- Default for migration
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES users(id); -- Owner linkage

-- Function to calculate age based on current season (Assuming season starts Nov 1)
CREATE OR REPLACE FUNCTION get_season_age(birthdate DATE) RETURNS INTEGER AS $$
DECLARE
    season_start DATE;
BEGIN
    -- If current month > 6 (July), season is this year, else last year
    IF EXTRACT(MONTH FROM CURRENT_DATE) > 6 THEN
        season_start := MAKE_DATE(CAST(EXTRACT(YEAR FROM CURRENT_DATE) AS INTEGER), 11, 1);
    ELSE
        season_start := MAKE_DATE(CAST(EXTRACT(YEAR FROM CURRENT_DATE) - 1 AS INTEGER), 11, 1);
    END IF;
    RETURN EXTRACT(YEAR FROM age(season_start, birthdate));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. CLASS CAPACITY & SPOTS
ALTER TABLE class_occurrences 
ADD COLUMN IF NOT EXISTS capacity INTEGER NOT NULL DEFAULT 8,
ADD COLUMN IF NOT EXISTS spots_taken INTEGER NOT NULL DEFAULT 0;

-- 4. ENROLLMENT UPDATES
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'UNPAID';

-- 5. CART SYSTEM
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID, -- Assuming schools table exists
    parent_id UUID REFERENCES users(id), -- Optional for guest carts, mandatory for checkout
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CHECKED_OUT, ABANDONED
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    class_occurrence_id UUID, -- REFERENCES class_occurrences(id),
    student_id UUID REFERENCES students(id), -- Validates student eligibility
    unit_price_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RLS POLICIES FOR CARTS
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their own carts" ON carts
FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "Parents can view their own cart items" ON cart_items
FOR ALL USING (cart_id IN (SELECT id FROM carts WHERE parent_id = auth.uid()));
