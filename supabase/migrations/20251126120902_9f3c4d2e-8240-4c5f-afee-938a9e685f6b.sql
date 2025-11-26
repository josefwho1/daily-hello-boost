-- Create person_logs table for logging new people met
CREATE TABLE public.person_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  timezone_offset TEXT NOT NULL DEFAULT '+00:00',
  CONSTRAINT person_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.person_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for person_logs
CREATE POLICY "Users can view their own person logs"
ON public.person_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own person logs"
ON public.person_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own person logs"
ON public.person_logs
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own person logs"
ON public.person_logs
FOR DELETE
USING (auth.uid() = user_id);

-- Add timezone_preference to profiles table
ALTER TABLE public.profiles
ADD COLUMN timezone_preference TEXT DEFAULT '+00:00';

-- Add timezone_offset to challenge_completions for existing entries
ALTER TABLE public.challenge_completions
ADD COLUMN timezone_offset TEXT DEFAULT '+00:00';