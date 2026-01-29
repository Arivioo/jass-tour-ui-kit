import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Info, Loader2 } from 'lucide-react';
import { usePlayers } from '@/hooks/usePlayers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlayerStats {
  playerId: string;
  name: string;
  totalWins: number;
  totalSessions: number;
  totalFines: number;
}

export default function Rangliste() {
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  
  const { data: rankings = [], isLoading: rankingsLoading } = useQuery({
    queryKey: ['all-time-rankings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_rankings')
        .select('player_id, total_wins, total_fines, players(name)');
      
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
            totalFines: 0,
          };
        }
        statsMap[playerId].totalWins += ranking.total_wins || 0;
        statsMap[playerId].totalFines += ranking.total_fines || 0;
        statsMap[playerId].totalSessions += 1;
      });
      
      return Object.values(statsMap).sort((a, b) => b.totalWins - a.totalWins);
    },
  });

  const isLoading = playersLoading || rankingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Ewige Rangliste</h1>
        <p className="text-muted-foreground">Alle Siege und Punkte aller Zeiten</p>
      </div>

      {/* Rankings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Rangliste
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Daten vorhanden. Schliesse deine erste Session ab!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rang</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Siege</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                  <TableHead className="text-right">Bussen</TableHead>
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
                      {player.totalWins}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {player.totalSessions}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      CHF {player.totalFines}.–
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
            <h4 className="font-medium">Automatisch aktualisiert</h4>
            <p className="text-sm text-muted-foreground">
              Die ewige Rangliste wird automatisch aktualisiert, sobald Sessions abgeschlossen werden.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
