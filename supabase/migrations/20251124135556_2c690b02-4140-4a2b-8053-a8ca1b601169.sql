-- Create enum for interaction ratings
CREATE TYPE public.interaction_rating AS ENUM ('positive', 'neutral', 'negative');

-- Create user_progress table to track streak and current challenge day
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  current_day INTEGER NOT NULL DEFAULT 1,
  last_completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create challenge_completions table to store completed challenges with notes and ratings
CREATE TABLE public.challenge_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  challenge_day INTEGER NOT NULL,
  interaction_name TEXT,
  notes TEXT,
  rating interaction_rating NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_progress
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_progress
CREATE POLICY "Users can view their own progress"
ON public.user_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
ON public.user_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
ON public.user_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Enable RLS on challenge_completions
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

-- RLS policies for challenge_completions
CREATE POLICY "Users can view their own completions"
ON public.challenge_completions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own completions"
ON public.challenge_completions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own completions"
ON public.challenge_completions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own completions"
ON public.challenge_completions
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on user_progress
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_challenge_completions_user_id ON public.challenge_completions(user_id);
CREATE INDEX idx_challenge_completions_completed_at ON public.challenge_completions(completed_at);