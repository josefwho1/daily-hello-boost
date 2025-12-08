-- Add difficulty_rating column to hello_logs table
ALTER TABLE public.hello_logs 
ADD COLUMN IF NOT EXISTS difficulty_rating integer CHECK (difficulty_rating >= 1 AND difficulty_rating <= 3);