import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Info, Loader2, TrendingUp, Calendar, Medal } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlayerStats {
  playerId: string;
  name: string;
  totalWins: number;
  totalSessions: number;
  rank1: number;
  rank2: number;
  rank3: number;
  rank4: number;
}

interface SessionDetail {
  id: string;
  date: string;
  location: string;
  totalPot: number;
  rankings: {
    playerId: string;
    playerName: string;
    rank: number;
  }[];
}

export default function Rangliste() {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  
  // Fetch all-time rankings with rank distribution
  const { data: rankings = [], isLoading: rankingsLoading } = useQuery({
    queryKey: ['all-time-rankings-detailed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_rankings')
        .select('player_id, final_rank, total_wins, players(name)');
      
      if (error) throw error;
      
      // Aggregate stats per player
      const statsMap: { [key: string]: PlayerStats } = {};
      
      (data || []).forEach((ranking: any) => {
        const playerId = ranking.player_id;
        if (!statsMap[playerId]) {
          statsMap[playerId] = {
            playerId,
            name: ranking.players?.name || 'Unknown',
            totalWins: 0,
            totalSessions: 0,
            rank1: 0,
            rank2: 0,
            rank3: 0,
            rank4: 0,
          };
        }
        statsMap[playerId].totalWins += ranking.total_wins || 0;
        statsMap[playerId].totalSessions += 1;
        
        // Count rank occurrences
        if (ranking.final_rank === 1) statsMap[playerId].rank1 += 1;
        else if (ranking.final_rank === 2) statsMap[playerId].rank2 += 1;
        else if (ranking.final_rank === 3) statsMap[playerId].rank3 += 1;
        else if (ranking.final_rank === 4) statsMap[playerId].rank4 += 1;
      });
      
      return Object.values(statsMap).sort((a, b) => b.totalWins - a.totalWins);
    },
  });

  // Fetch individual sessions since 2021 (exclude "Historisch" entries)
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['session-details-since-2021'],
    queryFn: async () => {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, date, location, total_pot')
        .gte('date', '2021-01-01')
        .neq('location', 'Historisch')
        .eq('is_completed', true)
        .order('date', { ascending: false });
      
      if (sessionsError) throw sessionsError;
      
      // Get all rankings for these sessions
      const sessionIds = sessionsData?.map(s => s.id) || [];
      const { data: rankingsData, error: rankingsError } = await supabase
        .from('session_rankings')
        .select('session_id, player_id, final_rank, players(name)')
        .in('session_id', sessionIds);
      
      if (rankingsError) throw rankingsError;
      
      // Combine sessions with their rankings
      const result: SessionDetail[] = (sessionsData || []).map(session => ({
        id: session.id,
        date: session.date,
        location: session.location,
        totalPot: session.total_pot,
        rankings: (rankingsData || [])
          .filter((r: any) => r.session_id === session.id)
          .map((r: any) => ({
            playerId: r.player_id,
            playerName: r.players?.name || 'Unknown',
            rank: r.final_rank,
          }))
          .sort((a, b) => a.rank - b.rank),
      }));
      
      return result;
    },
  });

  const isLoading = playersLoading || rankingsLoading || sessionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate additional statistics
  const totalSessionsCount = sessions.length;
  const currentPot = sessions.length > 0 ? sessions[0].totalPot : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Ewige Rangliste</h1>
        <p className="text-muted-foreground">2015–2026 • Alle Siege und Statistiken</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalSessionsCount}</div>
            <div className="text-xs text-muted-foreground">Abende seit 2021</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">CHF {currentPot.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Aktueller Pot</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{rankings[0]?.name || '-'}</div>
            <div className="text-xs text-muted-foreground">Leader</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{rankings[0]?.totalWins || 0}</div>
            <div className="text-xs text-muted-foreground">Siege (Leader)</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="rangliste" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rangliste" className="gap-1.5">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Rangliste</span>
          </TabsTrigger>
          <TabsTrigger value="statistiken" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Statistiken</span>
          </TabsTrigger>
          <TabsTrigger value="einzelabende" className="gap-1.5">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Einzelabende</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Rangliste */}
        <TabsContent value="rangliste" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Ewige Rangliste 2015–2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rankings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Noch keine Daten vorhanden.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rang</TableHead>
                      <TableHead>Spieler</TableHead>
                      <TableHead className="text-right">1. Platz</TableHead>
                      <TableHead className="text-right">2. Platz</TableHead>
                      <TableHead className="text-right">3. Platz</TableHead>
                      <TableHead className="text-right">4. Platz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankings.map((player, index) => (
                      <TableRow key={player.playerId}>
                        <TableCell>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                            index === 0 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : index === 1
                              ? 'bg-gray-100 text-gray-600'
                              : index === 2
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {index + 1}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          {player.rank1}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {player.rank2}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {player.rank3}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {player.rank4}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Info Note */}
          <Card className="border-dashed">
            <CardContent className="flex items-start gap-3 p-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h4 className="font-medium">Datenqualität</h4>
                <p className="text-sm text-muted-foreground">
                  2015–2020 vollständig übernommen. Ab 2021 basierend auf Einzelabend-Daten. Jassreisen nicht enthalten.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Statistiken */}
        <TabsContent value="statistiken" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Spieler-Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {rankings.map((player, index) => {
                const total = player.rank1 + player.rank2 + player.rank3 + player.rank4;
                const winRate = total > 0 ? ((player.rank1 / total) * 100).toFixed(1) : '0';
                const podiumRate = total > 0 ? (((player.rank1 + player.rank2 + player.rank3) / total) * 100).toFixed(1) : '0';
                
                return (
                  <div key={player.playerId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                          index === 0 
                            ? 'bg-yellow-100 text-yellow-700' 
                            : index === 1
                            ? 'bg-gray-100 text-gray-600'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-primary font-semibold">{winRate}%</span>
                        <span className="text-muted-foreground"> Siegquote</span>
                      </div>
                    </div>
                    
                    {/* Visual bar chart */}
                    <div className="flex h-6 overflow-hidden rounded-md">
                      {player.rank1 > 0 && (
                        <div 
                          className="bg-yellow-400 flex items-center justify-center text-xs font-medium text-yellow-900"
                          style={{ width: `${(player.rank1 / total) * 100}%` }}
                        >
                          {player.rank1}
                        </div>
                      )}
                      {player.rank2 > 0 && (
                        <div 
                          className="bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-700"
                          style={{ width: `${(player.rank2 / total) * 100}%` }}
                        >
                          {player.rank2}
                        </div>
                      )}
                      {player.rank3 > 0 && (
                        <div 
                          className="bg-orange-300 flex items-center justify-center text-xs font-medium text-orange-800"
                          style={{ width: `${(player.rank3 / total) * 100}%` }}
                        >
                          {player.rank3}
                        </div>
                      )}
                      {player.rank4 > 0 && (
                        <div 
                          className="bg-red-200 flex items-center justify-center text-xs font-medium text-red-700"
                          style={{ width: `${(player.rank4 / total) * 100}%` }}
                        >
                          {player.rank4}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{total} Abende</span>
                      <span>Podium: {podiumRate}%</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Interpretation */}
          <Card className="border-dashed">
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Medal className="h-4 w-4 text-primary" />
                Kurzinterpretation
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><strong>Rötschi:</strong> Klar die meisten Siege</li>
                <li><strong>Husi:</strong> Extrem konstant, häufig im Mittelfeld</li>
                <li><strong>Poli:</strong> Höchste Anzahl 4. Plätze</li>
                <li><strong>Michi:</strong> Nur 2015–2020 aktiv, sehr ausgeglichen</li>
                <li><strong>Mötzi:</strong> Erst ab 2021, solide Verteilung</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Einzelabende */}
        <TabsContent value="einzelabende" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Einzelabende seit 2021
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Keine Abende gefunden.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Datum</TableHead>
                        <TableHead className="text-center">1.</TableHead>
                        <TableHead className="text-center">2.</TableHead>
                        <TableHead className="text-center">3.</TableHead>
                        <TableHead className="text-center">4.</TableHead>
                        <TableHead className="text-right">Kasse</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((session) => {
                        const getRankPlayer = (rank: number) => 
                          session.rankings.find(r => r.rank === rank)?.playerName || '-';
                        
                        return (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium whitespace-nowrap">
                              {new Date(session.date).toLocaleDateString('de-CH', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </TableCell>
                            <TableCell className="text-center text-primary font-medium">
                              {getRankPlayer(1)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getRankPlayer(2)}
                            </TableCell>
                            <TableCell className="text-center">
                              {getRankPlayer(3)}
                            </TableCell>
                            <TableCell className="text-center text-muted-foreground">
                              {getRankPlayer(4)}
                            </TableCell>
                            <TableCell className="text-right text-muted-foreground">
                              {session.totalPot > 0 ? `CHF ${session.totalPot.toLocaleString()}` : '-'}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
