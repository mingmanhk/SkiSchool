
-- Performance Optimization Indexes
-- Version 2.0

-- 1. Programs Filter
-- Frequent filtering by school_id and active status
CREATE INDEX IF NOT EXISTS idx_programs_school_active ON programs(school_id, active);

-- 2. Class Occurrences
-- Frequent lookups by series and instructor
CREATE INDEX IF NOT EXISTS idx_class_occurrences_series ON class_occurrences(class_series_id);
CREATE INDEX IF NOT EXISTS idx_class_occurrences_instructor ON class_occurrences(instructor_id);

-- 3. Students
-- Frequent lookups by parent_id (for ownership checks)
CREATE INDEX IF NOT EXISTS idx_students_parent_id ON students(parent_id);

-- 4. Enrollments
-- Frequent lookups by student and payment status
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(payment_status);

-- 5. Carts
-- Critical for checkout flow performance
CREATE INDEX IF NOT EXISTS idx_carts_parent_status ON carts(parent_id, status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

-- 6. RLS Policy Helper
-- If not exists, ensure tenant_id/school_id is indexed on users for fast RLS checks
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
