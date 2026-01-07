-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Update the handle_new_user trigger to also capture email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    new.email
  )
  ON CONFLICT (id) DO UPDATE 
  SET username = COALESCE(new.raw_user_meta_data->>'name', 'User'),
      email = new.email
  WHERE profiles.id = new.id;
  
  RETURN new;
END;
$$;

-- Backfill existing profiles with emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Create a view for hello_logs with user email, sorted by created_at
CREATE OR REPLACE VIEW public.hello_logs_with_user AS
SELECT 
  hl.id,
  hl.user_id,
  p.email as user_email,
  p.username,
  hl.name,
  hl.hello_type,
  hl.notes,
  hl.rating,
  hl.difficulty_rating,
  hl.timezone_offset,
  hl.created_at as logged_at
FROM public.hello_logs hl
LEFT JOIN public.profiles p ON hl.user_id = p.id
ORDER BY hl.created_at DESC;