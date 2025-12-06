-- Add streak_savers column to user_progress
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS streak_savers integer DEFAULT 0;

-- Clear existing weekly challenges and add the new ones
DELETE FROM public.weekly_challenges;

INSERT INTO public.weekly_challenges (week_number, title, description) VALUES
(1, 'Fit Checkkkk', 'Ask for an opinion on your outfit'),
(2, 'Learn & Repeat', 'Get someone''s name and use it during your interaction'),
(3, 'Shameless Plug', 'Name drop One Hello and use it as an excuse to meet someone. "Hey I''m doing this challenge where I''m trying to meet new people, it''s called One Hello"'),
(4, 'Jokester', 'Make someone laugh by telling them a joke'),
(5, 'Aliens', 'Ask someone whether they believe in aliens?'),
(6, 'Opposites Attract', 'Get the name of someone from the opposite gender'),
(7, 'Old Timer', 'Get the name of someone older than you'),
(8, 'Forget & Forgive', 'Ask for someone''s name that you should already know'),
(9, 'Name to the Face', 'Get the name of someone you''ve seen before but never met, maybe at your coffee spot, gym or work place'),
(10, 'Photo Please', 'Ask someone to take a photo of you. Tag #onehello'),
(11, 'High Five', 'Get a high five from a stranger');