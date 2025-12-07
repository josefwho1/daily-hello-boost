-- Remove unique constraint on username since name doesn't need to be unique
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_name_unique;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;