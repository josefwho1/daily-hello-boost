-- Add a field to track if weekly goal was achieved this week
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS weekly_goal_achieved_this_week boolean DEFAULT false;