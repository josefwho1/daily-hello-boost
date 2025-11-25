-- Add difficulty_rating column to challenge_completions table
ALTER TABLE challenge_completions
ADD COLUMN difficulty_rating integer CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5);