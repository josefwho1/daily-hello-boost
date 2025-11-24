-- Function to create initial user progress
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, current_streak, current_day, last_completed_date)
  VALUES (NEW.id, 0, 1, NULL);
  RETURN NEW;
END;
$$;

-- Trigger to create user progress when profile is created
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();