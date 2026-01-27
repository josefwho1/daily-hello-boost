-- Add is_favorite column to hello_logs
ALTER TABLE public.hello_logs 
ADD COLUMN is_favorite boolean DEFAULT false;