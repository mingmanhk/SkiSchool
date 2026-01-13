
-- Class Registry Feature SQL
-- Version 1.1

-- 1. Create a function to fetch the registry data
CREATE OR REPLACE FUNCTION get_class_registry(
    p_date DATE,
    p_program_id UUID DEFAULT NULL,
    p_instructor_id UUID DEFAULT NULL
)
RETURNS TABLE (
    occurrence_id UUID,
    program_name TEXT,
    class_name TEXT,
    session_time TEXT, -- e.g. "09:00 - 12:00"
    instructor_first_name TEXT,
    instructor_last_name TEXT,
    student_first_name TEXT,
    student_last_name TEXT,
    student_age INT,
    student_level TEXT, -- Fetched from latest skill event or profile
    student_allergies TEXT, -- Fetched from profile or notes
    parent_phone TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        co.id AS occurrence_id,
        p.name AS program_name,
        cs.name AS class_name,
        TO_CHAR(co.start_time, 'HH24:MI') || ' - ' || TO_CHAR(co.end_time, 'HH24:MI') AS session_time,
        u_inst.first_name AS instructor_first_name,
        u_inst.last_name AS instructor_last_name,
        s.first_name AS student_first_name,
        s.last_name AS student_last_name,
        EXTRACT(YEAR FROM AGE(p_date, s.date_of_birth))::INT AS student_age,
        COALESCE((SELECT skill FROM student_skill_events sse WHERE sse.student_id = s.id ORDER BY sse.created_at DESC LIMIT 1), 'Unrated') AS student_level,
        s.allergies AS student_allergies,
        u_parent.phone_number AS parent_phone
    FROM
        class_occurrences co
    JOIN
        class_series cs ON co.class_series_id = cs.id
    JOIN
        programs p ON cs.program_id = p.id
    JOIN
        users u_inst ON co.instructor_id = u_inst.id
    JOIN
        enrollments e ON e.class_series_id = cs.id
    JOIN
        students s ON e.student_id = s.id
    JOIN
        parent_student_relationships psr ON s.id = psr.student_id
    JOIN
        users u_parent ON psr.parent_id = u_parent.id
    WHERE
        DATE(co.start_time) = p_date
        AND (p_program_id IS NULL OR p.id = p_program_id)
        AND (p_instructor_id IS NULL OR co.instructor_id = p_instructor_id)
    ORDER BY
        co.start_time, p.name, cs.name, s.last_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Add 'allergies' and 'date_of_birth' to students table if not exists
-- (Assuming they might be missing or in a different table, adding for robustness)
ALTER TABLE students ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 3. Mock Data (Optional, ensuring we have data to query)
-- Insert a dummy program if none
INSERT INTO programs (name, description)
VALUES ('Holiday Camp', 'Winter holiday ski camp')
ON CONFLICT DO NOTHING;

-- Note: In a real migration, we would check for existence before creating.
