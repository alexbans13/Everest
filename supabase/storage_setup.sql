-- Setup script for Supabase Storage
-- Run this in your Supabase SQL Editor after running the main migration

-- Create the avatars storage bucket (if it doesn't exist)
-- Note: This needs to be done via the Supabase Dashboard or Storage API
-- Go to Storage > Create Bucket > Name: "avatars" > Public: true

-- Set up storage policies for the avatars bucket
-- These policies allow users to upload and read their own avatars

-- Policy: Anyone can read avatars (public bucket)
-- Note: This is set via the Supabase Dashboard under Storage > avatars > Policies
-- Or you can use the Storage API to create policies

-- Recommended policies for avatars bucket:
-- 1. SELECT policy: Allow public read access
-- 2. INSERT policy: Allow authenticated users to upload
-- 3. UPDATE policy: Allow users to update their own files
-- 4. DELETE policy: Allow users to delete their own files

-- Example policy creation (run in SQL Editor):
-- Note: Replace 'avatars' with your actual bucket name

-- Allow public read access
CREATE POLICY "Public Avatar Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Allow authenticated users to upload
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated'
  );

-- Allow users to update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

