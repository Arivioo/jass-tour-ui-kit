-- Phase 1A: Add match_fines table for detailed fine records + losli tracking

-- Detailed fine records (currently only INTEGER totals stored in match_results.fines)
CREATE TABLE IF NOT EXISTS public.match_fines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  fine_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  round_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_match_fines_match ON match_fines(match_id);

-- Enable RLS (public access — app uses password gate, not auth)
ALTER TABLE public.match_fines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_fines' AND policyname = 'Match fines are viewable by everyone') THEN
    CREATE POLICY "Match fines are viewable by everyone" ON public.match_fines FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_fines' AND policyname = 'Match fines can be created by everyone') THEN
    CREATE POLICY "Match fines can be created by everyone" ON public.match_fines FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_fines' AND policyname = 'Match fines can be updated by everyone') THEN
    CREATE POLICY "Match fines can be updated by everyone" ON public.match_fines FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'match_fines' AND policyname = 'Match fines can be deleted by everyone') THEN
    CREATE POLICY "Match fines can be deleted by everyone" ON public.match_fines FOR DELETE USING (true);
  END IF;
END $$;

-- Lösli tracking on sessions
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS losli_player_id UUID REFERENCES public.players(id);
