-- Add email_unsubscribed column to user_progress for global unsubscribe
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS email_unsubscribed boolean DEFAULT false;

-- Add re-engagement tracking columns
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS reengagement_email_index integer DEFAULT 0;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS last_reengagement_email_at timestamp with time zone DEFAULT NULL;

-- Add streak_email_sent columns to track which streak emails have been sent
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS streak_1day_email_sent_for_date date DEFAULT NULL;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS streak_2day_email_sent_for_date date DEFAULT NULL;

-- Add welcome_email_sent to track if welcome email was sent
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false;