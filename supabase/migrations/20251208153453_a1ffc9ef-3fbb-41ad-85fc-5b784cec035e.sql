-- Add XP and leveling columns to user_progress
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS hellos_today_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS names_today_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes_today_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_xp_reset_date date DEFAULT CURRENT_DATE;