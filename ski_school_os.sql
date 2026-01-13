-- Ski School OS Database Schema
-- Version 1.0

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Enum
CREATE TYPE user_role AS ENUM (
    'OWNER',
    'ADMIN',
    'PROGRAM_DIRECTOR',
    'FRONT_DESK',
    'SUPPORT',
    'INSTRUCTOR',
    'ACCOUNTING',
    'PARENT',
    'STUDENT',
    'HR'
);

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messaging Hub
CREATE TABLE message_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE thread_participants (
    thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    PRIMARY KEY (thread_id, user_id)
);

CREATE VIEW message_threads_view AS
SELECT
    t.id,
    t.subject,
    t.created_at,
    t.updated_at,
    (SELECT json_agg(p.user_id) FROM thread_participants p WHERE p.thread_id = t.id) as participants
FROM message_threads t;

CREATE VIEW messages_view AS
SELECT
    m.id,
    m.thread_id,
    m.sender_id,
    m.body,
    m.created_at,
    u.first_name as sender_first_name,
    u.last_name as sender_last_name
FROM messages m
JOIN users u ON m.sender_id = u.id;

CREATE OR REPLACE FUNCTION get_my_message_threads(user_id_param UUID)
RETURNS SETOF message_threads_view AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM message_threads_view
    WHERE user_id_param = ANY(participants);
END;
$$ LANGUAGE plpgsql;


-- Instructor Coaching
CREATE TABLE instructor_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT,
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE instructor_coaching_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    coach_id UUID REFERENCES users(id),
    session_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE instructor_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES instructor_coaching_sessions(id) ON DELETE CASCADE,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE instructor_monthly_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT,
    month DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION get_instructor_coaching_view(instructor_id_param UUID)
RETURNS json AS $$
DECLARE
    goals json;
    sessions json;
BEGIN
    SELECT json_agg(g) INTO goals FROM instructor_goals g WHERE g.instructor_id = instructor_id_param;
    SELECT json_agg(s) INTO sessions FROM instructor_coaching_sessions s WHERE s.instructor_id = instructor_id_param;

    RETURN json_build_object(
        'goals', goals,
        'sessions', sessions
    );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_instructor_month_data(instructor_id_param UUID, month_param DATE)
RETURNS json AS $$
DECLARE
    summary json;
    sessions json;
BEGIN
    SELECT to_json(s) INTO summary FROM instructor_monthly_summaries s WHERE s.instructor_id = instructor_id_param AND s.month = month_param;
    SELECT json_agg(cs) INTO sessions FROM instructor_coaching_sessions cs WHERE cs.instructor_id = instructor_id_param AND date_trunc('month', cs.session_date) = month_param;

    RETURN json_build_object(
        'summary', summary,
        'sessions', sessions
    );
END;
$$ LANGUAGE plpgsql;

-- Credentials
CREATE TABLE credential_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE instructor_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_type_id UUID REFERENCES credential_types(id) ON DELETE CASCADE,
    issue_date DATE,
    expiry_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE credential_training_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credential_type_id UUID REFERENCES credential_types(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Portfolio
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    icon_url TEXT,
    description TEXT
);

CREATE TABLE student_skill_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    skill TEXT,
    instructor_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    awarded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE student_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_url TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Real-Time Class Tracking
CREATE TABLE class_status_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_occurrence_id UUID, -- Assuming a classes table exists
    status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Library + LMS
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    storage_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE document_shares (
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    role user_role,
    PRIMARY KEY (document_id, user_id, role)
);

CREATE TABLE training_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_module_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES training_modules(id) ON DELETE CASCADE,
    item_type TEXT, -- e.g., 'document', 'quiz'
    document_id UUID REFERENCES documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    module_id UUID REFERENCES training_modules(id),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES training_assignments(id) ON DELETE CASCADE,
    status TEXT, -- e.g., 'not-started', 'in-progress', 'completed'
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE training_item_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    progress_id UUID REFERENCES training_progress(id) ON DELETE CASCADE,
    item_id UUID REFERENCES training_module_items(id) ON DELETE CASCADE,
    completed BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Search
CREATE TABLE search_index (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    embedding VECTOR(1536),
    tsv TSVECTOR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX search_index_tsv ON search_index USING GIN(tsv);

-- Accounting
CREATE TABLE payroll_summary (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instructor_id UUID REFERENCES users(id),
    pay_period_start DATE,
    pay_period_end DATE,
    amount NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID,
    amount NUMERIC(10, 2),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    amount NUMERIC(10, 2),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    rule JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pricing_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES pricing_rules(id),
    override_amount NUMERIC(10, 2),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for Messaging Hub

-- message_threads
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see their own message threads"
ON message_threads FOR SELECT
USING (
  id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow users to create message threads"
ON message_threads FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow users to update their own message threads"
ON message_threads FOR UPDATE
USING (
  id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow users to delete their own message threads"
ON message_threads FOR DELETE
USING (
  id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);


-- thread_participants
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see participants of their own threads"
ON thread_participants FOR SELECT
USING (
  thread_id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow users to add participants to their own threads"
ON thread_participants FOR INSERT
WITH CHECK (
  thread_id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow users to remove participants from their own threads"
ON thread_participants FOR DELETE
USING (
  thread_id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);


-- messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to see messages in their own threads"
ON messages FOR SELECT
USING (
  thread_id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow users to send messages in their own threads"
ON messages FOR INSERT
WITH CHECK (
  (sender_id = auth.uid()) AND
  (thread_id IN (
    SELECT thread_id
    FROM thread_participants
    WHERE user_id = auth.uid()
  ))
);
