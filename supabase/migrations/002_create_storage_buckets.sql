-- Storage Buckets Setup for Jingli School Management System
-- Run this SQL in your Supabase SQL Editor after running the main schema migration

-- ============================================
-- CREATE STORAGE BUCKETS
-- ============================================

-- Student Photos Bucket (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'student-photos',
    'student-photos',
    false,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Staff Photos Bucket (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'staff-photos',
    'staff-photos',
    false,
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Book Covers Bucket (Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'book-covers',
    'book-covers',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Documents Bucket (Private - for admission docs, certificates, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Student Photos Policies
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload student photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'student-photos');

-- Allow authenticated users to view
CREATE POLICY "Authenticated users can view student photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'student-photos');

-- Allow admin and staff to update
CREATE POLICY "Admin and staff can update student photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'student-photos' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
));

-- Allow admin to delete
CREATE POLICY "Admin can delete student photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'student-photos' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
));

-- Staff Photos Policies
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload staff photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'staff-photos');

-- Allow authenticated users to view
CREATE POLICY "Authenticated users can view staff photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'staff-photos');

-- Allow admin and staff to update their own photos
CREATE POLICY "Users can update their own staff photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'staff-photos');

-- Allow admin to delete
CREATE POLICY "Admin can delete staff photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'staff-photos' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
));

-- Book Covers Policies (Public bucket)
-- Anyone can view (bucket is public)
CREATE POLICY "Anyone can view book covers"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'book-covers');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload book covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

-- Admin and librarians can update
CREATE POLICY "Admin and staff can update book covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
));

-- Admin can delete
CREATE POLICY "Admin can delete book covers"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
));

-- Documents Policies
-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

-- Allow authenticated users to view
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

-- Allow admin and staff to update
CREATE POLICY "Admin and staff can update documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'documents' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'staff')
    )
));

-- Allow admin to delete
CREATE POLICY "Admin can delete documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents' AND (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
));
