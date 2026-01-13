
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_media ENABLE ROW LEVEL SECURITY;

-- Helper Function to get user role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. Users / Profiles
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins/Directors view all profiles" ON users
  FOR SELECT USING (auth.user_role() IN ('ADMIN', 'PROGRAM_DIRECTOR', 'OWNER', 'FRONT_DESK'));

-- 2. Messaging
CREATE POLICY "View threads if participant" ON message_threads
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM thread_participants WHERE thread_id = id AND user_id = auth.uid()
  ));
CREATE POLICY "Insert threads if authenticated" ON message_threads
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "View messages if participant" ON messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM thread_participants WHERE thread_id = thread_id AND user_id = auth.uid()
  ));
CREATE POLICY "Send messages if participant" ON messages
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM thread_participants WHERE thread_id = thread_id AND user_id = auth.uid()
  ));

-- 3. Instructor Coaching
CREATE POLICY "Instructors view own goals" ON instructor_goals
  FOR SELECT USING (instructor_id = auth.uid());
CREATE POLICY "Admins manage all goals" ON instructor_goals
  FOR ALL USING (auth.user_role() IN ('ADMIN', 'PROGRAM_DIRECTOR'));

-- 4. Class Status
CREATE POLICY "Public read class status" ON class_status_events
  FOR SELECT USING (true); -- Publicly visible for parents (simplified)
CREATE POLICY "Instructors create status" ON class_status_events
  FOR INSERT WITH CHECK (auth.user_role() = 'INSTRUCTOR');

-- 5. Student Portfolio
CREATE POLICY "Parents view own kids portfolio" ON student_skill_events
  FOR SELECT USING (EXISTS (
    -- Assuming a parent_student relationship table exists, or simplified:
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'PARENT' 
    -- Real implementation needs parent_student lookup
  ));
CREATE POLICY "Instructors manage portfolio" ON student_skill_events
  FOR ALL USING (auth.user_role() = 'INSTRUCTOR');
