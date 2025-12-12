-- Add profile_picture column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profile_picture text DEFAULT 'remi-waving.webp';