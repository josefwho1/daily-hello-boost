-- Create daily_challenges table for "Today's Hello" rotation
CREATE TABLE public.daily_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  day_of_year integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

-- Anyone can view daily challenges
CREATE POLICY "Anyone can view daily challenges"
ON public.daily_challenges
FOR SELECT
USING (true);

-- Rename streak_savers to orbs in user_progress
ALTER TABLE public.user_progress RENAME COLUMN streak_savers TO orbs;

-- Add has_received_first_orb column to track first hello gift
ALTER TABLE public.user_progress ADD COLUMN has_received_first_orb boolean DEFAULT false;

-- Add total_hellos column for lifetime tracking
ALTER TABLE public.user_progress ADD COLUMN total_hellos integer DEFAULT 0;

-- Seed the daily_challenges table with rotating challenges
INSERT INTO public.daily_challenges (title, description, day_of_year) VALUES
('Morning Spark', 'Start someone''s day with a genuine smile and greeting', 1),
('Coffee Connection', 'Strike up a conversation while waiting in line', 2),
('Compliment Quest', 'Give someone a sincere, specific compliment', 3),
('Curiosity Call', 'Ask someone about their day or what they''re working on', 4),
('Help Wanted', 'Offer to help someone with something small', 5),
('Weather Chat', 'Use the weather as an icebreaker to start a conversation', 6),
('Book Club', 'Ask someone what they''re reading or watching lately', 7),
('Local Expert', 'Ask a stranger for a recommendation (coffee, restaurant, etc.)', 8),
('Elevator Pitch', 'Say hello to someone in an elevator or waiting area', 9),
('Pet Talk', 'Compliment someone''s pet and ask about them', 10),
('Sports Fan', 'Ask someone about their favorite team or recent game', 11),
('Music Moment', 'Ask someone about the music they''re listening to', 12),
('Tech Talk', 'Ask someone about their phone case, headphones, or gadget', 13),
('Fashion Forward', 'Compliment someone''s style or outfit', 14),
('Foodie Friend', 'Ask someone what they''re eating or recommend a dish', 15),
('Workout Buddy', 'Start a conversation at the gym or park', 16),
('Neighbor Wave', 'Introduce yourself to a neighbor you haven''t met', 17),
('Checkout Chat', 'Have a friendly conversation with a cashier or clerk', 18),
('Bus Buddy', 'Talk to someone on public transport', 19),
('Park Pal', 'Strike up a conversation with someone at a park or outdoor space', 20),
('Waiting Game', 'Chat with someone in a waiting room', 21),
('Shared Interest', 'Connect with someone over something you both notice', 22),
('Question Quest', 'Ask a thoughtful question to learn about someone', 23),
('Gratitude Greeting', 'Thank someone and start a conversation from there', 24),
('Random Act', 'Do something kind and say hello in the process', 25),
('Name Game', 'Learn and remember someone''s name today', 26),
('Story Time', 'Ask someone to tell you about themselves', 27),
('Humor Hello', 'Make someone laugh with a friendly joke or observation', 28),
('Deep Dive', 'Ask a follow-up question to go deeper in conversation', 29),
('Farewell Friend', 'End a conversation on a positive note with well wishes', 30),
('Repeat Hello', 'Say hi to someone you''ve met before but don''t know well', 31);