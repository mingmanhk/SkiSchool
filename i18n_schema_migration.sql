
-- 1. Programs
ALTER TABLE programs 
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT,
ADD COLUMN IF NOT EXISTS requirements_en TEXT,
ADD COLUMN IF NOT EXISTS requirements_zh TEXT;

-- Backfill default data (assuming existing data is English)
UPDATE programs SET name_en = name, name_zh = name, description_en = description, description_zh = description WHERE name_en IS NULL;


-- 2. Class Series
ALTER TABLE class_series
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT;

UPDATE class_series SET name_en = name, name_zh = name WHERE name_en IS NULL;

-- 3. Class Occurrences
ALTER TABLE class_occurrences
ADD COLUMN IF NOT EXISTS notes_en TEXT,
ADD COLUMN IF NOT EXISTS notes_zh TEXT;

-- 4. Training Modules
ALTER TABLE training_modules
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT;

UPDATE training_modules SET name_en = name, name_zh = name, description_en = description, description_zh = description WHERE name_en IS NULL;

-- 5. Documents
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT;

UPDATE documents SET name_en = name, name_zh = name WHERE name_en IS NULL;

-- 6. Badges
ALTER TABLE badges
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS name_zh TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS description_zh TEXT;

UPDATE badges SET name_en = name, name_zh = name, description_en = description, description_zh = description WHERE name_en IS NULL;

-- 7. Skill Categories / Events
ALTER TABLE student_skill_events
ADD COLUMN IF NOT EXISTS skill_en TEXT,
ADD COLUMN IF NOT EXISTS skill_zh TEXT,
ADD COLUMN IF NOT EXISTS note_en TEXT,
ADD COLUMN IF NOT EXISTS note_zh TEXT;

UPDATE student_skill_events SET skill_en = skill, skill_zh = skill WHERE skill_en IS NULL;

-- 8. Add language preference to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'en';

-- 9. Add default language to schools/tenants (if schools table exists)
-- ALTER TABLE schools ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'en';
