-- Rename the 'name' column to 'username' for clarity
ALTER TABLE public.profiles 
RENAME COLUMN name TO username;

-- Add unique constraint on username
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_username_unique UNIQUE (username);

-- Create an index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- Update the handle_new_user function to use the new column name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile, handling conflicts on both id and username
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO UPDATE 
  SET username = COALESCE(new.raw_user_meta_data->>'name', 'User')
  WHERE profiles.id = new.id;
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, append user id suffix
    INSERT INTO public.profiles (id, username)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', 'User') || '_' || substring(new.id::text, 1, 8)
    )
    ON CONFLICT (id) DO UPDATE 
    SET username = COALESCE(new.raw_user_meta_data->>'name', 'User') || '_' || substring(new.id::text, 1, 8);
    
    RETURN new;
END;
$$;