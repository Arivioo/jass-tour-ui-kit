-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create players table (the 4 fixed Jass players)
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the 4 fixed players
INSERT INTO public.players (name) VALUES 
  ('Mötzi'),
  ('Poli'),
  ('Husi'),
  ('Rötschi');

-- Create sessions table for Jass evenings
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT NOT NULL,
  total_pot INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for individual games within a session
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  match_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create match_results table for player scores in each match
CREATE TABLE public.match_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  is_winner BOOLEAN NOT NULL DEFAULT false,
  fines INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, player_id)
);

-- Create session_rankings table for final rankings after tie-breaking
CREATE TABLE public.session_rankings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  final_rank INTEGER NOT NULL,
  total_wins INTEGER NOT NULL DEFAULT 0,
  total_fines INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, player_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_rankings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Players policies (read-only for all authenticated users)
CREATE POLICY "Players are viewable by authenticated users" 
ON public.players FOR SELECT TO authenticated USING (true);

-- Sessions policies
CREATE POLICY "Sessions are viewable by authenticated users" 
ON public.sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create sessions" 
ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Session creators can update their sessions" 
ON public.sessions FOR UPDATE TO authenticated USING (auth.uid() = created_by);

CREATE POLICY "Session creators can delete their sessions" 
ON public.sessions FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Matches policies
CREATE POLICY "Matches are viewable by authenticated users" 
ON public.matches FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create matches" 
ON public.matches FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND created_by = auth.uid())
);

CREATE POLICY "Session creators can update matches" 
ON public.matches FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND created_by = auth.uid())
);

CREATE POLICY "Session creators can delete matches" 
ON public.matches FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND created_by = auth.uid())
);

-- Match results policies
CREATE POLICY "Match results are viewable by authenticated users" 
ON public.match_results FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create match results" 
ON public.match_results FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.sessions s ON m.session_id = s.id 
    WHERE m.id = match_id AND s.created_by = auth.uid()
  )
);

CREATE POLICY "Session creators can update match results" 
ON public.match_results FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.sessions s ON m.session_id = s.id 
    WHERE m.id = match_id AND s.created_by = auth.uid()
  )
);

CREATE POLICY "Session creators can delete match results" 
ON public.match_results FOR DELETE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.matches m 
    JOIN public.sessions s ON m.session_id = s.id 
    WHERE m.id = match_id AND s.created_by = auth.uid()
  )
);

-- Session rankings policies
CREATE POLICY "Session rankings are viewable by authenticated users" 
ON public.session_rankings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create session rankings" 
ON public.session_rankings FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND created_by = auth.uid())
);

CREATE POLICY "Session creators can update rankings" 
ON public.session_rankings FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND created_by = auth.uid())
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();