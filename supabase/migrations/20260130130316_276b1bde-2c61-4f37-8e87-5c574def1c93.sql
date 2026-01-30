-- Add Daily Mode fields to user_progress table
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS daily_mode_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_mode_current_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_mode_best_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_mode_start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS daily_mode_last_hello_date date,
ADD COLUMN IF NOT EXISTS daily_mode_morning_reminder_shown_date date,
ADD COLUMN IF NOT EXISTS daily_mode_afternoon_reminder_shown_date date;

-- Create index for quick daily mode lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_daily_mode 
ON public.user_progress(user_id) 
WHERE daily_mode_active = true;