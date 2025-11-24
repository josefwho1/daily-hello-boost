-- Update the handle_new_user function to work with email auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only insert if profile doesn't already exist
  INSERT INTO public.profiles (id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;