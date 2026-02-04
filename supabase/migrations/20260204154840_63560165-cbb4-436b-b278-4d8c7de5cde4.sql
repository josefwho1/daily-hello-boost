-- Fix auth_codes table RLS - currently allows service role full access but also has SELECT
-- We need to ensure only service role can access auth_codes, not anon users

-- First, drop the existing permissive policy that uses 'true' for all operations
DROP POLICY IF EXISTS "Service role can manage auth codes" ON public.auth_codes;

-- Create restrictive policies that only allow service role access
-- Service role bypasses RLS entirely, so we need policies that deny anon/authenticated access
-- By having RLS enabled with no permissive policies for anon/authenticated, they can't access

-- This policy ensures that even if someone queries as authenticated user, they get nothing
-- The service role will bypass RLS entirely and still have full access
CREATE POLICY "Deny all access to auth codes"
ON public.auth_codes
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);

-- Also fix the hello_logs_with_user view by recreating it with proper security
-- The view already has security_invoker=true which inherits RLS from base tables
-- But we should verify it's properly configured

-- Add constraint checks for input validation at database level
-- These provide defense-in-depth even if client-side validation is bypassed

-- hello_logs constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'hello_logs_name_length' AND conrelid = 'public.hello_logs'::regclass
    ) THEN
        ALTER TABLE public.hello_logs 
        ADD CONSTRAINT hello_logs_name_length CHECK (name IS NULL OR char_length(name) <= 100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'hello_logs_notes_length' AND conrelid = 'public.hello_logs'::regclass
    ) THEN
        ALTER TABLE public.hello_logs 
        ADD CONSTRAINT hello_logs_notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'hello_logs_location_length' AND conrelid = 'public.hello_logs'::regclass
    ) THEN
        ALTER TABLE public.hello_logs 
        ADD CONSTRAINT hello_logs_location_length CHECK (location IS NULL OR char_length(location) <= 200);
    END IF;
END $$;

-- person_logs constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'person_logs_name_length' AND conrelid = 'public.person_logs'::regclass
    ) THEN
        ALTER TABLE public.person_logs 
        ADD CONSTRAINT person_logs_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'person_logs_description_length' AND conrelid = 'public.person_logs'::regclass
    ) THEN
        ALTER TABLE public.person_logs 
        ADD CONSTRAINT person_logs_description_length CHECK (description IS NULL OR char_length(description) <= 500);
    END IF;
END $$;

-- challenge_completions constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'challenge_completions_name_length' AND conrelid = 'public.challenge_completions'::regclass
    ) THEN
        ALTER TABLE public.challenge_completions 
        ADD CONSTRAINT challenge_completions_name_length CHECK (interaction_name IS NULL OR char_length(interaction_name) <= 100);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'challenge_completions_notes_length' AND conrelid = 'public.challenge_completions'::regclass
    ) THEN
        ALTER TABLE public.challenge_completions 
        ADD CONSTRAINT challenge_completions_notes_length CHECK (notes IS NULL OR char_length(notes) <= 1000);
    END IF;
END $$;

-- profiles constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_username_length' AND conrelid = 'public.profiles'::regclass
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_username_length CHECK (char_length(username) >= 1 AND char_length(username) <= 50);
    END IF;
END $$;

-- user_progress constraints
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_progress_why_here_length' AND conrelid = 'public.user_progress'::regclass
    ) THEN
        ALTER TABLE public.user_progress 
        ADD CONSTRAINT user_progress_why_here_length CHECK (why_here IS NULL OR char_length(why_here) <= 500);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'user_progress_username_length' AND conrelid = 'public.user_progress'::regclass
    ) THEN
        ALTER TABLE public.user_progress 
        ADD CONSTRAINT user_progress_username_length CHECK (username IS NULL OR char_length(username) <= 50);
    END IF;
END $$;