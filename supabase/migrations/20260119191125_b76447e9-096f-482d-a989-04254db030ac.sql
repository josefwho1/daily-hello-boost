-- Add user-controlled timezone mode (auto-detect vs manual)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS timezone_auto_detect boolean NOT NULL DEFAULT true;