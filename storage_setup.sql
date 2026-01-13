
-- Storage Bucket Setup & Policies
-- Version 1.0

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('reports', 'reports', false),
  ('documents', 'documents', false),
  ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Reports
-- Instructors can read their own reports
CREATE POLICY "Instructors can read own reports" ON storage.objects
FOR SELECT
USING ( bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Directors/Admins can read all reports
CREATE POLICY "Admins can read all reports" ON storage.objects
FOR SELECT
USING ( bucket_id = 'reports' AND EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role IN ('ADMIN', 'PROGRAM_DIRECTOR', 'OWNER')
));

-- Policy: Documents
-- Shared documents based on role (simplified for MVP: authenticated users can read)
CREATE POLICY "Authenticated users can read documents" ON storage.objects
FOR SELECT
USING ( bucket_id = 'documents' AND auth.role() = 'authenticated' );

-- Policy: Media
-- Parents can read media for their linked students (Requires complex join, simplified for MVP: public read, restricted write)
-- Ideally: Join storage.objects -> student_media -> parent_student_relationships
CREATE POLICY "Public read media" ON storage.objects
FOR SELECT
USING ( bucket_id = 'media' );

-- Instructors can upload media
CREATE POLICY "Instructors can upload media" ON storage.objects
FOR INSERT
WITH CHECK ( bucket_id = 'media' AND EXISTS (
  SELECT 1 FROM public.users 
  WHERE id = auth.uid() AND role = 'INSTRUCTOR'
));
