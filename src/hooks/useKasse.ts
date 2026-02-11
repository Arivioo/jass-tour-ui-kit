import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KasseTransaction {
  id: string;
  session_id: string | null;
  player_id: string | null;
  transaction_type: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export function useKasseTransactions() {
  return useQuery({
    queryKey: ['kasse-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kasse_transactions')
        .select('*, players(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (KasseTransaction & { players: { name: string } | null })[];
    },
  });
}

export function useKasseBalance() {
  return useQuery({
    queryKey: ['kasse-balance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kasse_transactions')
        .select('amount');

      if (error) throw error;
      return (data || []).reduce((sum, t) => sum + t.amount, 0);
    },
  });
}

export function useCreateKasseTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      playerId,
      transactionType,
      amount,
      note,
    }: {
      sessionId?: string;
      playerId?: string;
      transactionType: string;
      amount: number;
      note?: string;
    }) => {
      const { error } = await supabase
        .from('kasse_transactions')
        .insert({
          session_id: sessionId || null,
          player_id: playerId || null,
          transaction_type: transactionType,
          amount,
          note: note || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kasse-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['kasse-balance'] });
    },
  });
}
