-- Add email column to challenge_completions
ALTER TABLE public.challenge_completions ADD COLUMN email text;

-- Add email column to person_logs
ALTER TABLE public.person_logs ADD COLUMN email text;

-- Add email column to user_progress
ALTER TABLE public.user_progress ADD COLUMN email text;

-- Add comfort_rating column to user_progress to store the onboarding comfort level
ALTER TABLE public.user_progress ADD COLUMN comfort_rating integer;

-- Create trigger for challenge_completions email
CREATE OR REPLACE FUNCTION public.set_email_on_challenge_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_challenge_completion_email
  BEFORE INSERT ON public.challenge_completions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_on_challenge_completion();

-- Create trigger for person_logs email
CREATE OR REPLACE FUNCTION public.set_email_on_person_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_person_log_email
  BEFORE INSERT ON public.person_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_on_person_log();

-- Create trigger for user_progress email
CREATE OR REPLACE FUNCTION public.set_email_on_user_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_user_progress_email
  BEFORE INSERT ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_on_user_progress();

-- Backfill existing records with emails
UPDATE public.challenge_completions
SET email = auth.users.email
FROM auth.users
WHERE challenge_completions.user_id = auth.users.id;

UPDATE public.person_logs
SET email = auth.users.email
FROM auth.users
WHERE person_logs.user_id = auth.users.id;

UPDATE public.user_progress
SET email = auth.users.email
FROM auth.users
WHERE user_progress.user_id = auth.users.id;