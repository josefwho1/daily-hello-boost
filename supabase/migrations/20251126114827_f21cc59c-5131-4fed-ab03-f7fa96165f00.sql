-- Add pack tracking to user_progress
ALTER TABLE public.user_progress 
ADD COLUMN selected_pack_id text DEFAULT 'starter-pack' NOT NULL;