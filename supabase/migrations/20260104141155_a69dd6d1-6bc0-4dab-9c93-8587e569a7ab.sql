-- Drop triggers that auto-populate email from auth.users
DROP TRIGGER IF EXISTS set_user_progress_email ON public.user_progress;
DROP TRIGGER IF EXISTS set_hello_log_email ON public.hello_logs;
DROP TRIGGER IF EXISTS set_challenge_completion_email ON public.challenge_completions;
DROP TRIGGER IF EXISTS set_person_log_email ON public.person_logs;

-- Drop the SECURITY DEFINER functions that copy emails
DROP FUNCTION IF EXISTS public.set_email_on_user_progress();
DROP FUNCTION IF EXISTS public.set_email_on_hello_log();
DROP FUNCTION IF EXISTS public.set_email_on_challenge_completion();
DROP FUNCTION IF EXISTS public.set_email_on_person_log();

-- Remove email columns from all affected tables
ALTER TABLE public.user_progress DROP COLUMN IF EXISTS email;
ALTER TABLE public.hello_logs DROP COLUMN IF EXISTS email;
ALTER TABLE public.challenge_completions DROP COLUMN IF EXISTS email;
ALTER TABLE public.person_logs DROP COLUMN IF EXISTS email;