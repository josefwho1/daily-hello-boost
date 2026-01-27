-- Add challenge_tag column to track specific challenges
ALTER TABLE public.challenge_completions 
ADD COLUMN IF NOT EXISTS challenge_tag TEXT;

-- Create index for faster lookups by tag
CREATE INDEX IF NOT EXISTS idx_challenge_completions_tag ON public.challenge_completions(challenge_tag);