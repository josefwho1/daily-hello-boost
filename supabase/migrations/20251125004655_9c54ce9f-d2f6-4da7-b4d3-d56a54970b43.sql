-- First, create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the function to handle username conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile, handling conflicts on both id and name
  INSERT INTO public.profiles (id, name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO UPDATE 
  SET name = COALESCE(new.raw_user_meta_data->>'name', 'User')
  WHERE profiles.id = new.id;
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, append user id suffix
    INSERT INTO public.profiles (id, name)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', 'User') || '_' || substring(new.id::text, 1, 8)
    )
    ON CONFLICT (id) DO UPDATE 
    SET name = COALESCE(new.raw_user_meta_data->>'name', 'User') || '_' || substring(new.id::text, 1, 8);
    
    RETURN new;
END;
$function$;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();