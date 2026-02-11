-- Phase 5: Kasse transactions table for running balance tracking

CREATE TABLE public.kasse_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.sessions(id),
  player_id UUID REFERENCES public.players(id),
  transaction_type TEXT NOT NULL, -- 'session_pot', 'payout', 'adjustment'
  amount INTEGER NOT NULL,       -- positive = money in, negative = payout
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_kasse_transactions_session ON kasse_transactions(session_id);
CREATE INDEX idx_kasse_transactions_player ON kasse_transactions(player_id);

-- Enable RLS (public access — app uses password gate)
ALTER TABLE public.kasse_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kasse transactions are viewable by everyone"
ON public.kasse_transactions FOR SELECT USING (true);

CREATE POLICY "Kasse transactions can be created by everyone"
ON public.kasse_transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Kasse transactions can be updated by everyone"
ON public.kasse_transactions FOR UPDATE USING (true);

CREATE POLICY "Kasse transactions can be deleted by everyone"
ON public.kasse_transactions FOR DELETE USING (true);
