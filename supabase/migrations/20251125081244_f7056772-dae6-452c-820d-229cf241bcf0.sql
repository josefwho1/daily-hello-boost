-- Add field to track if user has seen welcome messages
ALTER TABLE public.user_progress 
ADD COLUMN has_seen_welcome_messages BOOLEAN DEFAULT false;