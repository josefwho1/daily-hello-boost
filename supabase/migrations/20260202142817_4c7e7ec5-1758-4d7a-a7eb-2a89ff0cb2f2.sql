-- Add 30-day challenge progress fields to user_progress table
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS challenge_completed_days integer[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS challenge_started_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS challenge_completed_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS challenge_times_completed integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.user_progress.challenge_completed_days IS 'Array of completed day numbers (1-30) for the 30-Day Hello Challenge';
COMMENT ON COLUMN public.user_progress.challenge_started_at IS 'When the user started the 30-Day Hello Challenge';
COMMENT ON COLUMN public.user_progress.challenge_completed_at IS 'When the user completed all 30 days (null if not completed)';
COMMENT ON COLUMN public.user_progress.challenge_times_completed IS 'Number of times user has completed the full 30-day challenge';