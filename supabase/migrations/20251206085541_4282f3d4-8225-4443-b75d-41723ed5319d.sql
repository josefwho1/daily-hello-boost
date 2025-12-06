-- Add new columns for weekly streak system to user_progress
ALTER TABLE public.user_progress
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS target_hellos_per_week integer DEFAULT 5,
ADD COLUMN IF NOT EXISTS hellos_this_week integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS weekly_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_onboarding_week boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS onboarding_week_start date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS week_start_date date DEFAULT (date_trunc('week', CURRENT_DATE) + interval '1 day')::date,
ADD COLUMN IF NOT EXISTS has_completed_onboarding boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS why_here text;

-- Create hello_logs table for tracking individual hellos
CREATE TABLE IF NOT EXISTS public.hello_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text,
  notes text,
  hello_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  timezone_offset text DEFAULT '+00:00'
);

-- Enable RLS on hello_logs
ALTER TABLE public.hello_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for hello_logs
CREATE POLICY "Users can view their own hello logs"
ON public.hello_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hello logs"
ON public.hello_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hello logs"
ON public.hello_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hello logs"
ON public.hello_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Create weekly_challenges table for storing the weekly challenge
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  week_number integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on weekly_challenges (public read)
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weekly challenges"
ON public.weekly_challenges
FOR SELECT
USING (true);

-- Insert some initial weekly challenges
INSERT INTO public.weekly_challenges (title, description, week_number) VALUES
('Compliment Week', 'This week, focus on giving genuine compliments to strangers. Notice something positive and share it!', 1),
('Question Week', 'Ask meaningful questions this week. Where are people from? What brings them here? Be curious!', 2),
('Observation Week', 'Make friendly observations about your surroundings. "Beautiful day, isn''t it?" or "This place is so busy today!"', 3),
('Helper Week', 'Look for opportunities to help. Hold doors, offer directions, or simply ask "Can I help you with that?"', 4);