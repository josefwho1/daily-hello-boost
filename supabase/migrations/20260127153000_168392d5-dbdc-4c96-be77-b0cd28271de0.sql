-- Drop the old constraint and add a new one that includes 'active'
ALTER TABLE public.user_progress DROP CONSTRAINT IF EXISTS user_progress_current_phase_check;

ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_current_phase_check 
  CHECK (current_phase = ANY (ARRAY['onboarding'::text, 'daily_path'::text, 'chill_path'::text, 'active'::text, 'daily'::text]));