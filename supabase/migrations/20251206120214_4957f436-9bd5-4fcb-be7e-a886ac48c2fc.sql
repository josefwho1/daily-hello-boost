-- Add rating column to hello_logs table
ALTER TABLE public.hello_logs 
ADD COLUMN rating text CHECK (rating IN ('positive', 'neutral', 'negative'));