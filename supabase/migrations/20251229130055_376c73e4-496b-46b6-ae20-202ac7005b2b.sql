-- Add email column to hello_logs table
ALTER TABLE public.hello_logs ADD COLUMN email text;

-- Create a trigger to automatically set email from auth.users when inserting
CREATE OR REPLACE FUNCTION public.set_email_on_hello_log()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  SELECT email INTO NEW.email
  FROM auth.users
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_hello_log_email
  BEFORE INSERT ON public.hello_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_email_on_hello_log();

-- Backfill existing records with emails
UPDATE public.hello_logs
SET email = auth.users.email
FROM auth.users
WHERE hello_logs.user_id = auth.users.id;