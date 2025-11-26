-- Add index on profiles.username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Add username column to user_progress table
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Populate existing user_progress records with username from profiles
UPDATE public.user_progress up
SET username = p.username
FROM public.profiles p
WHERE up.user_id = p.id
AND up.username IS NULL;

-- Create trigger function to keep username in sync when profile username changes
CREATE OR REPLACE FUNCTION public.sync_username_to_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_progress
  SET username = NEW.username
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table to sync username changes
DROP TRIGGER IF EXISTS sync_username_on_profile_update ON public.profiles;
CREATE TRIGGER sync_username_on_profile_update
AFTER UPDATE OF username ON public.profiles
FOR EACH ROW
WHEN (OLD.username IS DISTINCT FROM NEW.username)
EXECUTE FUNCTION public.sync_username_to_progress();