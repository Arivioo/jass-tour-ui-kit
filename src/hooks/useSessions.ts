import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionData {
  id: string;
  date: string;
  location: string;
  total_pot: number;
  is_completed: boolean;
  losli_player_id: string | null;
  created_at: string;
}

export interface MatchData {
  id: string;
  session_id: string;
  match_number: number;
  created_at: string;
}

export interface MatchResultData {
  id: string;
  match_id: string;
  player_id: string;
  is_winner: boolean;
  fines: number;
  created_at: string;
}

export interface SessionRankingData {
  id: string;
  session_id: string;
  player_id: string;
  final_rank: number;
  total_wins: number;
  total_fines: number;
  created_at: string;
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_completed', true)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data as SessionData[];
    },
  });
}

export function useSessionWithDetails(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID');
      
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
      
      if (sessionError) throw sessionError;
      
      const { data: rankings, error: rankingsError } = await supabase
        .from('session_rankings')
        .select('*, players(name)')
        .eq('session_id', sessionId)
        .order('final_rank', { ascending: true });
      
      if (rankingsError) throw rankingsError;
      
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('session_id', sessionId)
        .order('match_number', { ascending: true });
      
      if (matchesError) throw matchesError;
      
      return { session, rankings, matches };
    },
    enabled: !!sessionId,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ date, location, totalPot }: { date: string; location: string; totalPot: number }) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert({ 
          date, 
          location, 
          total_pot: totalPot,
          is_completed: false 
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as SessionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCompleteSession() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      sessionId,
      rankings,
      totalPot,
      losliPlayerId,
    }: {
      sessionId: string;
      rankings: { playerId: string; finalRank: number; totalWins: number; totalFines: number }[];
      totalPot: number;
      losliPlayerId?: string;
    }) => {
      // Update session as completed
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({
          is_completed: true,
          total_pot: totalPot,
          ...(losliPlayerId ? { losli_player_id: losliPlayerId } : {}),
        })
        .eq('id', sessionId);
      
      if (sessionError) throw sessionError;
      
      // Insert rankings
      const rankingsData = rankings.map(r => ({
        session_id: sessionId,
        player_id: r.playerId,
        final_rank: r.finalRank,
        total_wins: r.totalWins,
        total_fines: r.totalFines,
      }));
      
      const { error: rankingsError } = await supabase
        .from('session_rankings')
        .insert(rankingsData);
      
      if (rankingsError) throw rankingsError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useCreateMatch() {
  return useMutation({
    mutationFn: async ({ sessionId, matchNumber }: { sessionId: string; matchNumber: number }) => {
      const { data, error } = await supabase
        .from('matches')
        .insert({ session_id: sessionId, match_number: matchNumber })
        .select()
        .single();
      
      if (error) throw error;
      return data as MatchData;
    },
  });
}

export function useCreateMatchResults() {
  return useMutation({
    mutationFn: async ({
      matchId,
      results
    }: {
      matchId: string;
      results: { playerId: string; isWinner: boolean; fines: number }[]
    }) => {
      const data = results.map(r => ({
        match_id: matchId,
        player_id: r.playerId,
        is_winner: r.isWinner,
        fines: r.fines,
      }));

      const { error } = await supabase
        .from('match_results')
        .insert(data);

      if (error) throw error;
    },
  });
}

export function useCreateMatchFines() {
  return useMutation({
    mutationFn: async ({
      matchId,
      fines,
    }: {
      matchId: string;
      fines: { playerId: string; fineType: string; amount: number; note?: string; roundNumber?: number }[];
    }) => {
      if (fines.length === 0) return;

      const data = fines.map(f => ({
        match_id: matchId,
        player_id: f.playerId,
        fine_type: f.fineType,
        amount: f.amount,
        note: f.note || null,
        round_number: f.roundNumber || null,
      }));

      const { error } = await supabase
        .from('match_fines')
        .insert(data);

      if (error) throw error;
    },
  });
}

export function useIncompleteSession() {
  return useQuery({
    queryKey: ['incomplete-session'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_completed', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) return null;

      const session = data[0];

      // Count completed matches
      const { count, error: matchError } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', session.id);

      if (matchError) throw matchError;

      return {
        ...session,
        completedMatches: count || 0,
      };
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['incomplete-session'] });
    },
  });
}

export function useResumeSessionData(sessionId: string | null) {
  return useQuery({
    queryKey: ['resume-session', sessionId],
    queryFn: async () => {
      if (!sessionId) throw new Error('No session ID');

      // Load matches with results
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*, match_results(player_id, is_winner)')
        .eq('session_id', sessionId)
        .order('match_number', { ascending: true });

      if (matchError) throw matchError;

      // Build player wins map from completed matches
      const playerWins: Record<string, number> = {};
      (matches || []).forEach((match: { match_results: { player_id: string; is_winner: boolean }[] }) => {
        match.match_results.forEach((r: { player_id: string; is_winner: boolean }) => {
          if (r.is_winner) {
            playerWins[r.player_id] = (playerWins[r.player_id] || 0) + 1;
          }
        });
      });

      return {
        completedMatches: matches?.length || 0,
        nextMatch: (matches?.length || 0) + 1,
        playerWins,
      };
    },
    enabled: !!sessionId,
  });
}

export function useSessionsWithRankings() {
  return useQuery({
    queryKey: ['sessions-with-rankings'],
    queryFn: async () => {
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('is_completed', true)
        .order('date', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Fetch all players for losli lookup
      const { data: allPlayers } = await supabase.from('players').select('id, name');
      const playerMap = new Map((allPlayers || []).map(p => [p.id, p.name]));

      const sessionsWithRankings = await Promise.all(
        (sessions || []).map(async (session) => {
          const { data: rankings, error: rankingsError } = await supabase
            .from('session_rankings')
            .select('*, players(name)')
            .eq('session_id', session.id)
            .order('final_rank', { ascending: true });

          if (rankingsError) throw rankingsError;

          return {
            ...session,
            losliPlayerName: session.losli_player_id
              ? playerMap.get(session.losli_player_id) || null
              : null,
            players: (rankings || []).map((r: { players: { name: string } | null; final_rank: number; total_wins: number; total_fines: number }) => ({
              name: r.players?.name || 'Unknown',
              rank: r.final_rank,
              wins: r.total_wins,
              totalFines: r.total_fines,
            })),
            matchCount: 5,
          };
        })
      );

      return sessionsWithRankings;
    },
  });
}
