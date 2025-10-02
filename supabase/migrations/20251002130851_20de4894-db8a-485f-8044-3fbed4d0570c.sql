-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  is_premium boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create sessions table
CREATE TABLE public.sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date timestamp with time zone DEFAULT now() NOT NULL,
  duration integer NOT NULL,
  rounds integer NOT NULL,
  max_hold integer NOT NULL,
  avg_hold numeric(10,2) NOT NULL,
  notes text,
  session_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create streaks table
CREATE TABLE public.streaks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  streak_count integer DEFAULT 0 NOT NULL,
  last_session_date date,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Streaks policies
CREATE POLICY "Users can view their own streak"
  ON public.streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak"
  ON public.streaks FOR UPDATE
  USING (auth.uid() = user_id);

-- Create personal_bests table
CREATE TABLE public.personal_bests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_hold_time integer NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.personal_bests ENABLE ROW LEVEL SECURITY;

-- Personal bests policies
CREATE POLICY "Users can view their own personal best"
  ON public.personal_bests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personal best"
  ON public.personal_bests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal best"
  ON public.personal_bests FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, is_premium)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    false
  );
  
  -- Initialize streak
  INSERT INTO public.streaks (user_id, streak_count, last_session_date)
  VALUES (new.id, 0, NULL);
  
  -- Initialize personal best
  INSERT INTO public.personal_bests (user_id, max_hold_time)
  VALUES (new.id, 0);
  
  RETURN new;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_last_date date;
  v_current_streak integer;
BEGIN
  SELECT last_session_date, streak_count
  INTO v_last_date, v_current_streak
  FROM public.streaks
  WHERE user_id = p_user_id;
  
  IF v_last_date IS NULL THEN
    -- First session ever
    UPDATE public.streaks
    SET streak_count = 1,
        last_session_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSIF v_last_date = CURRENT_DATE THEN
    -- Already trained today, no change
    RETURN;
  ELSIF v_last_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day
    UPDATE public.streaks
    SET streak_count = streak_count + 1,
        last_session_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE public.streaks
    SET streak_count = 1,
        last_session_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Function to update personal best
CREATE OR REPLACE FUNCTION public.update_personal_best(p_user_id uuid, p_hold_time integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_best integer;
BEGIN
  SELECT max_hold_time INTO v_current_best
  FROM public.personal_bests
  WHERE user_id = p_user_id;
  
  IF p_hold_time > v_current_best THEN
    UPDATE public.personal_bests
    SET max_hold_time = p_hold_time,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;