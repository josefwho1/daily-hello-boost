-- Add email notification fields to user_progress table
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS current_phase TEXT DEFAULT 'onboarding' CHECK (current_phase IN ('onboarding', 'daily_path', 'chill_path')),
ADD COLUMN IF NOT EXISTS onboarding_email_opt_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS daily_email_opt_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS chill_email_opt_in BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_hello_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS daily_path_selected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS chill_path_selected_at TIMESTAMP WITH TIME ZONE;

-- Create email_logs table to track sent emails (if not exists)
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('onboarding', 'daily_path', 'chill_path')),
  template_key TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on email_logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist (using DO block to handle existence check)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_logs' AND policyname = 'Users can view their own email logs') THEN
    CREATE POLICY "Users can view their own email logs"
    ON public.email_logs
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'email_logs' AND policyname = 'Service role can insert email logs') THEN
    CREATE POLICY "Service role can insert email logs"
    ON public.email_logs
    FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_email_logs_user_sent ON public.email_logs (user_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON public.email_logs (template_key, sent_at);

-- Update existing users: set current_phase based on existing data
UPDATE public.user_progress
SET current_phase = CASE
  WHEN has_completed_onboarding = true AND mode = 'daily' THEN 'daily_path'
  WHEN has_completed_onboarding = true AND mode = 'chill' THEN 'chill_path'
  ELSE 'onboarding'
END
WHERE current_phase IS NULL;