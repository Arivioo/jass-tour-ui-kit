import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SessionData {
  id: string;
  date: string;
  location: string;
  total_pot: number;
  is_completed: boolean;
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
      totalPot 
    }: { 
      sessionId: string; 
      rankings: { playerId: string; finalRank: number; totalWins: number; totalFines: number }[];
      totalPot: number;
    }) => {
      // Update session as completed
      const { error: sessionError } = await supabase
        .from('sessions')
        .update({ is_completed: true, total_pot: totalPot })
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
