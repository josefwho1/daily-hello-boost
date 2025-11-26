CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: interaction_rating; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.interaction_rating AS ENUM (
    'positive',
    'neutral',
    'negative'
);


--
-- Name: handle_new_profile(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_profile() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, current_streak, current_day, last_completed_date)
  VALUES (NEW.id, 0, 1, NULL);
  RETURN NEW;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Insert profile, handling conflicts on both id and username
  INSERT INTO public.profiles (id, username)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'User')
  )
  ON CONFLICT (id) DO UPDATE 
  SET username = COALESCE(new.raw_user_meta_data->>'name', 'User')
  WHERE profiles.id = new.id;
  
  RETURN new;
EXCEPTION
  WHEN unique_violation THEN
    -- If username already exists, append user id suffix
    INSERT INTO public.profiles (id, username)
    VALUES (
      new.id,
      COALESCE(new.raw_user_meta_data->>'name', 'User') || '_' || substring(new.id::text, 1, 8)
    )
    ON CONFLICT (id) DO UPDATE 
    SET username = COALESCE(new.raw_user_meta_data->>'name', 'User') || '_' || substring(new.id::text, 1, 8);
    
    RETURN new;
END;
$$;


--
-- Name: set_username_on_completion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_username_on_completion() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  SELECT username INTO NEW.username
  FROM public.profiles
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;


--
-- Name: sync_username_to_progress(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_username_to_progress() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  -- Update user_progress
  UPDATE public.user_progress
  SET username = NEW.username
  WHERE user_id = NEW.id;
  
  -- Update challenge_completions
  UPDATE public.challenge_completions
  SET username = NEW.username
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: challenge_completions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_completions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_day integer NOT NULL,
    interaction_name text,
    notes text,
    rating public.interaction_rating NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    difficulty_rating integer,
    username text,
    CONSTRAINT challenge_completions_difficulty_rating_check CHECK (((difficulty_rating >= 1) AND (difficulty_rating <= 5)))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    username text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    current_streak integer DEFAULT 0 NOT NULL,
    current_day integer DEFAULT 1 NOT NULL,
    last_completed_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    has_seen_welcome_messages boolean DEFAULT false,
    username text
);


--
-- Name: challenge_completions challenge_completions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_name_unique UNIQUE (username);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_username_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_username_unique UNIQUE (username);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_key UNIQUE (user_id);


--
-- Name: idx_challenge_completions_completed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_completed_at ON public.challenge_completions USING btree (completed_at);


--
-- Name: idx_challenge_completions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_completions_user_id ON public.challenge_completions USING btree (user_id);


--
-- Name: idx_profiles_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_name ON public.profiles USING btree (username);


--
-- Name: idx_profiles_username; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);


--
-- Name: idx_user_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_user_id ON public.user_progress USING btree (user_id);


--
-- Name: profiles on_profile_created; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER on_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();


--
-- Name: challenge_completions set_username_on_completion_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_username_on_completion_insert BEFORE INSERT ON public.challenge_completions FOR EACH ROW EXECUTE FUNCTION public.set_username_on_completion();


--
-- Name: profiles sync_username_on_profile_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER sync_username_on_profile_update AFTER UPDATE OF username ON public.profiles FOR EACH ROW WHEN ((old.username IS DISTINCT FROM new.username)) EXECUTE FUNCTION public.sync_username_to_progress();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_progress update_user_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: challenge_completions challenge_completions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_completions
    ADD CONSTRAINT challenge_completions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: challenge_completions Users can delete their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own completions" ON public.challenge_completions FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: challenge_completions Users can insert their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own completions" ON public.challenge_completions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: user_progress Users can insert their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own progress" ON public.user_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: challenge_completions Users can update their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own completions" ON public.challenge_completions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id));


--
-- Name: user_progress Users can update their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own progress" ON public.user_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: challenge_completions Users can view their own completions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own completions" ON public.challenge_completions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: user_progress Users can view their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: challenge_completions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


