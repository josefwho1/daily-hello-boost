-- Remove any remaining unique constraint on username
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_unique;