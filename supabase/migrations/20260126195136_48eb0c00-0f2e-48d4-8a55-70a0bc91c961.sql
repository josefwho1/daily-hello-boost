-- Add location field to hello_logs table
ALTER TABLE public.hello_logs 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add flag for "didn't get name" checkbox
ALTER TABLE public.hello_logs 
ADD COLUMN IF NOT EXISTS no_name_flag BOOLEAN DEFAULT FALSE;