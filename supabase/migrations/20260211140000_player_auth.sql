-- Phase 6: Per-player authentication

-- Link players to Supabase auth users
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id);

-- Session ownership and join code for collaborative sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- Track who joined a session
CREATE TABLE IF NOT EXISTS public.session_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, player_id)
);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_participants' AND policyname = 'Session participants viewable by everyone') THEN
    CREATE POLICY "Session participants viewable by everyone" ON public.session_participants FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_participants' AND policyname = 'Session participants can be created by everyone') THEN
    CREATE POLICY "Session participants can be created by everyone" ON public.session_participants FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'session_participants' AND policyname = 'Session participants can be deleted by everyone') THEN
    CREATE POLICY "Session participants can be deleted by everyone" ON public.session_participants FOR DELETE USING (true);
  END IF;
END $$;
