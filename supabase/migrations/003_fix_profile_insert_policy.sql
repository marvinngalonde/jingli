-- Fix for Profile Creation During Signup
-- Run this SQL in your Supabase SQL Editor to fix the 403 error

-- Add INSERT policy for profiles table to allow users to create their own profile during signup
CREATE POLICY "Users can insert own profile during signup" ON profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);
