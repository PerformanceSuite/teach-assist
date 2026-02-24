-- Supabase Database Setup for TeachAssist Profiles
-- Run this script in your Supabase SQL Editor

-- 1. Create the teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE,
  name TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  philosophy TEXT,
  photo_url TEXT,
  schedule JSONB DEFAULT '[]'::jsonb,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create the contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES teacher_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS (Row Level Security) on the tables
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Create wide-open RLS policies for local prototyping and easy uploads
-- (Note: In a true production app, you would restrict INSERT/UPDATE to auth.uid() = user_id)
DROP POLICY IF EXISTS "Public view profiles" ON teacher_profiles;
CREATE POLICY "Public view profiles" ON teacher_profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert profiles" ON teacher_profiles;
CREATE POLICY "Anyone can insert profiles" ON teacher_profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update profiles" ON teacher_profiles;
CREATE POLICY "Anyone can update profiles" ON teacher_profiles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Anyone can insert contact form" ON contact_submissions;
CREATE POLICY "Anyone can insert contact form" ON contact_submissions FOR INSERT WITH CHECK (true);

-- 5. Create the Storage Bucket for Teacher Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('teacher-photos', 'teacher-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Setup open storage RLS for the bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'teacher-photos');

DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;
CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teacher-photos');

DROP POLICY IF EXISTS "Anyone can update photos" ON storage.objects;
CREATE POLICY "Anyone can update photos" ON storage.objects FOR UPDATE USING (bucket_id = 'teacher-photos');
