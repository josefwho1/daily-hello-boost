-- Add column to track when weekly challenge was last completed (for 1 per week enforcement)
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS last_weekly_challenge_date date DEFAULT NULL;

-- Add column to track if save was offered/used for missed daily streak
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS save_offered_for_date date DEFAULT NULL;