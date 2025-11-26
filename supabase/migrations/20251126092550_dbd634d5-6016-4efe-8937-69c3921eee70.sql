-- Add username column to challenge_completions table
ALTER TABLE public.challenge_completions 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Populate existing challenge_completions records with username from profiles
UPDATE public.challenge_completions cc
SET username = p.username
FROM public.profiles p
WHERE cc.user_id = p.id
AND cc.username IS NULL;

-- Create trigger function to automatically set username on new challenge completion
CREATE OR REPLACE FUNCTION public.set_username_on_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT username INTO NEW.username
  FROM public.profiles
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Create trigger on challenge_completions for inserts
DROP TRIGGER IF EXISTS set_username_on_completion_insert ON public.challenge_completions;
CREATE TRIGGER set_username_on_completion_insert
BEFORE INSERT ON public.challenge_completions
FOR EACH ROW
EXECUTE FUNCTION public.set_username_on_completion();

-- Update existing sync function to also update challenge_completions
CREATE OR REPLACE FUNCTION public.sync_username_to_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update user_progress
  UPDATE public.user_progress
  SET username = NEW.username
  WHERE user_id = NEW.id;
  
  -- Update challenge_completions
  UPDATE public.challenge_completions
  SET username = NEW.username
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;