-- Add is_anonymous column to profiles to track anonymous/guest users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN NOT NULL DEFAULT false;

-- Add hide_from_leaderboard column for "deleted" accounts that still have data
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hide_from_leaderboard BOOLEAN NOT NULL DEFAULT false;

-- Update RLS policy for profiles to allow anonymous users to view their own profile
-- (existing policies already handle this via auth.uid() = id)