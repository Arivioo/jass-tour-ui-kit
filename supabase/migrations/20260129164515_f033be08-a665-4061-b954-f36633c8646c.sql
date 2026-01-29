-- Create app_settings table for storing next appointment and other settings
CREATE TABLE public.app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  next_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.app_settings (id) VALUES ('default');

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone with password access can read/write settings
CREATE POLICY "Settings are viewable by everyone" 
ON public.app_settings FOR SELECT USING (true);

CREATE POLICY "Settings can be updated by everyone" 
ON public.app_settings FOR UPDATE USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_app_settings_updated_at
BEFORE UPDATE ON public.app_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update players RLS to allow public read (app uses password gate, not auth)
DROP POLICY IF EXISTS "Players are viewable by authenticated users" ON public.players;
CREATE POLICY "Players are viewable by everyone" 
ON public.players FOR SELECT USING (true);

CREATE POLICY "Players can be updated by everyone" 
ON public.players FOR UPDATE USING (true);

CREATE POLICY "Players can be inserted by everyone" 
ON public.players FOR INSERT WITH CHECK (true);

CREATE POLICY "Players can be deleted by everyone" 
ON public.players FOR DELETE USING (true);

-- Update sessions RLS for public access (app uses password gate)
DROP POLICY IF EXISTS "Sessions are viewable by authenticated users" ON public.sessions;
DROP POLICY IF EXISTS "Authenticated users can create sessions" ON public.sessions;
DROP POLICY IF EXISTS "Session creators can update their sessions" ON public.sessions;
DROP POLICY IF EXISTS "Session creators can delete their sessions" ON public.sessions;

CREATE POLICY "Sessions are viewable by everyone" 
ON public.sessions FOR SELECT USING (true);

CREATE POLICY "Sessions can be created by everyone" 
ON public.sessions FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions can be updated by everyone" 
ON public.sessions FOR UPDATE USING (true);

CREATE POLICY "Sessions can be deleted by everyone" 
ON public.sessions FOR DELETE USING (true);

-- Update matches RLS for public access
DROP POLICY IF EXISTS "Matches are viewable by authenticated users" ON public.matches;
DROP POLICY IF EXISTS "Authenticated users can create matches" ON public.matches;
DROP POLICY IF EXISTS "Session creators can update matches" ON public.matches;
DROP POLICY IF EXISTS "Session creators can delete matches" ON public.matches;

CREATE POLICY "Matches are viewable by everyone" 
ON public.matches FOR SELECT USING (true);

CREATE POLICY "Matches can be created by everyone" 
ON public.matches FOR INSERT WITH CHECK (true);

CREATE POLICY "Matches can be updated by everyone" 
ON public.matches FOR UPDATE USING (true);

CREATE POLICY "Matches can be deleted by everyone" 
ON public.matches FOR DELETE USING (true);

-- Update match_results RLS for public access
DROP POLICY IF EXISTS "Match results are viewable by authenticated users" ON public.match_results;
DROP POLICY IF EXISTS "Authenticated users can create match results" ON public.match_results;
DROP POLICY IF EXISTS "Session creators can update match results" ON public.match_results;
DROP POLICY IF EXISTS "Session creators can delete match results" ON public.match_results;

CREATE POLICY "Match results are viewable by everyone" 
ON public.match_results FOR SELECT USING (true);

CREATE POLICY "Match results can be created by everyone" 
ON public.match_results FOR INSERT WITH CHECK (true);

CREATE POLICY "Match results can be updated by everyone" 
ON public.match_results FOR UPDATE USING (true);

CREATE POLICY "Match results can be deleted by everyone" 
ON public.match_results FOR DELETE USING (true);

-- Update session_rankings RLS for public access
DROP POLICY IF EXISTS "Session rankings are viewable by authenticated users" ON public.session_rankings;
DROP POLICY IF EXISTS "Authenticated users can create session rankings" ON public.session_rankings;
DROP POLICY IF EXISTS "Session creators can update rankings" ON public.session_rankings;

CREATE POLICY "Session rankings are viewable by everyone" 
ON public.session_rankings FOR SELECT USING (true);

CREATE POLICY "Session rankings can be created by everyone" 
ON public.session_rankings FOR INSERT WITH CHECK (true);

CREATE POLICY "Session rankings can be updated by everyone" 
ON public.session_rankings FOR UPDATE USING (true);

CREATE POLICY "Session rankings can be deleted by everyone" 
ON public.session_rankings FOR DELETE USING (true);