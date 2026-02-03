-- Add milestone tracking columns to user_progress
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS milestones_seen TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS milestones_shared TEXT[] DEFAULT '{}';