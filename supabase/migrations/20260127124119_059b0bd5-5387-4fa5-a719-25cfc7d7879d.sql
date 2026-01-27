-- Add pack_start_date to track when a user starts a challenge pack
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS pack_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.user_progress.pack_start_date IS 'Timestamp when user started the currently selected challenge pack';