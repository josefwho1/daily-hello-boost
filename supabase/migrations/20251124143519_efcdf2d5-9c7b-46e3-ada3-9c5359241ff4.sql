-- Delete duplicate profiles, keeping only the most recent one for each username
DELETE FROM public.profiles
WHERE id NOT IN (
  SELECT DISTINCT ON (name) id
  FROM public.profiles
  ORDER BY name, created_at DESC
);

-- Add unique constraint to username in profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_name_unique UNIQUE (name);

-- Add index for faster username lookups
CREATE INDEX idx_profiles_name ON public.profiles(name);