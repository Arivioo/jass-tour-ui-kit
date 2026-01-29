import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, CreditCard, Gift, Share2, CheckCircle, Medal, GripVertical, ArrowUp, ArrowDown, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { PLAYERS, FINE_TYPES, formatCHF } from '@/lib/players';
import { cn } from '@/lib/utils';
import { LuckyWheel } from '@/components/LuckyWheel';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
interface Fine {
  id: string;
  playerId: string;
  type: string;
  amount: number;
  note?: string;
  matchNumber?: number;
  location?: string;
}

interface LocationState {
  matchResults?: Array<{
    teamA: string[];
    teamB: string[];
    teamATotal: number;
    teamBTotal: number;
    winner: 'A' | 'B' | 'tie';
    fines: Fine[];
    location?: string;
    matchNumber?: number;
  }>;
  playerWins?: { [playerId: string]: number };
}

interface RankingPlayer {
  playerId: string;
  name: string;
  wins: number;
  rank: number;
}

// Placeholder summary data for when no state is passed
const PLACEHOLDER_SUMMARY = {
  rankings: [
    { playerId: '1', name: 'Mötzi', wins: 3, rank: 1 },
    { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
    { playerId: '3', name: 'Husi', wins: 2, rank: 3 },
    { playerId: '4', name: 'Rötschi', wins: 1, rank: 4 },
  ],
  matchResults: [
    { matchNumber: 1, location: 'Rechte Winkel', fines: [
      { id: '1', playerId: '1', type: 'eichle', amount: 5, note: 'Runde 3', matchNumber: 1, location: 'Rechte Winkel' },
      { id: '2', playerId: '2', type: 'match', amount: 10, note: 'Runde 5', matchNumber: 1, location: 'Rechte Winkel' },
    ]},
    { matchNumber: 2, location: 'Hürtel', fines: [
      { id: '3', playerId: '3', type: 'weniger', amount: 5, note: 'Runde 2', matchNumber: 2, location: 'Hürtel' },
    ]},
    { matchNumber: 3, location: 'Engel', fines: [
      { id: '4', playerId: '4', type: 'gliichi4', amount: 5, note: 'Runde 1', matchNumber: 3, location: 'Engel' },
      { id: '5', playerId: '1', type: 'charte', amount: 5, note: 'Runde 4', matchNumber: 3, location: 'Engel' },
    ]},
  ],
};

const RANK_FINES: { [key: number]: number } = { 1: 0, 2: 10, 3: 15, 4: 20 };

export default function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [leftFirst, setLeftFirst] = useState('');
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [showTiebreaker, setShowTiebreaker] = useState(false);
  const [tiedPlayers, setTiedPlayers] = useState<string[]>([]);

  // Initialize rankings from match wins
  useEffect(() => {
    const initialRankings = state?.playerWins
      ? PLAYERS
          .map(player => ({
            playerId: player.id,
            name: player.name,
            wins: state.playerWins?.[player.id] || 0,
            rank: 0,
          }))
          .sort((a, b) => b.wins - a.wins)
          .map((player, index) => ({ ...player, rank: index + 1 }))
      : PLACEHOLDER_SUMMARY.rankings;
    
    setRankings(initialRankings);
    
    // Check for ties
    const winCounts = initialRankings.map(r => r.wins);
    const duplicates = winCounts.filter((wins, idx) => 
      winCounts.indexOf(wins) !== idx || winCounts.lastIndexOf(wins) !== idx
    );
    const uniqueTiedWins = [...new Set(duplicates)];
    
    if (uniqueTiedWins.length > 0) {
      const tied = initialRankings
        .filter(r => uniqueTiedWins.includes(r.wins))
        .map(r => r.playerId);
      setTiedPlayers(tied);
      setShowTiebreaker(true);
    }
  }, [state?.playerWins]);

  // Collect all fines from match results with location info
  const allFines: Fine[] = state?.matchResults
    ? state.matchResults.flatMap(match => match.fines.map(f => ({
        ...f,
        matchNumber: match.matchNumber || 0,
        location: match.location || 'Unbekannt',
      })))
    : PLACEHOLDER_SUMMARY.matchResults.flatMap(m => m.fines);

  // Group fines by player
  const finesByPlayer = PLAYERS.reduce((acc, player) => {
    acc[player.id] = allFines.filter(f => f.playerId === player.id);
    return acc;
  }, {} as { [key: string]: Fine[] });

  // Calculate total fines per player
  const playerFines = PLAYERS.reduce((acc, player) => {
    acc[player.id] = finesByPlayer[player.id]?.reduce((sum, f) => sum + f.amount, 0) || 0;
    return acc;
  }, {} as { [key: string]: number });

  // Calculate payments with rank fines based on wins
  const payments = rankings.map(player => {
    const finesAmount = playerFines[player.playerId] || 0;
    const rankFine = RANK_FINES[player.rank] || 0;
    const playerFinesList = finesByPlayer[player.playerId] || [];
    return {
      playerId: player.playerId,
      name: player.name,
      buyIn: 25,
      fines: finesAmount,
      finesList: playerFinesList,
      rankFine,
      total: 25 + finesAmount + rankFine,
    };
  });

  // Handle wheel completion
  const handleWheelComplete = (orderedPlayers: RankingPlayer[]) => {
    setRankings(prev => {
      const newRankings = [...prev];
      const startRank = prev.find(r => r.playerId === orderedPlayers[0].playerId)?.rank || 1;
      
      orderedPlayers.forEach((player, idx) => {
        const rankingIdx = newRankings.findIndex(r => r.playerId === player.playerId);
        if (rankingIdx !== -1) {
          newRankings[rankingIdx].rank = startRank + idx;
        }
      });
      
      return newRankings.sort((a, b) => a.rank - b.rank);
    });
    
    setShowTiebreaker(false);
    setTiedPlayers([]);
  };

  // Move player up in ranking
  const moveUp = (index: number) => {
    if (index === 0) return;
    setRankings(prev => {
      const newRankings = [...prev];
      // Swap ranks
      const tempRank = newRankings[index].rank;
      newRankings[index].rank = newRankings[index - 1].rank;
      newRankings[index - 1].rank = tempRank;
      // Swap positions
      [newRankings[index], newRankings[index - 1]] = [newRankings[index - 1], newRankings[index]];
      return newRankings;
    });
  };

  // Move player down in ranking
  const moveDown = (index: number) => {
    if (index === rankings.length - 1) return;
    setRankings(prev => {
      const newRankings = [...prev];
      // Swap ranks
      const tempRank = newRankings[index].rank;
      newRankings[index].rank = newRankings[index + 1].rank;
      newRankings[index + 1].rank = tempRank;
      // Swap positions
      [newRankings[index], newRankings[index + 1]] = [newRankings[index + 1], newRankings[index]];
      return newRankings;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Zusammenfassung</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Übersicht des Jass-Abends</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })}
          </span>
        </div>
      </div>

      {/* Lucky Wheel Tiebreaker */}
      {showTiebreaker && tiedPlayers.length > 0 && (
        <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-primary" />
              Gleichstand! Glücksrad entscheidet
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {tiedPlayers.length} Spieler haben die gleiche Anzahl Siege – das Glücksrad entscheidet die Reihenfolge!
            </p>
          </CardHeader>
          <CardContent>
            <LuckyWheel
              players={rankings.filter(r => tiedPlayers.includes(r.playerId))}
              onComplete={handleWheelComplete}
            />
          </CardContent>
        </Card>
      )}

      {/* Rankings - based on match wins */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Schlussrangliste
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            1 Punkt pro gewonnenes Match – Rangliste kann manuell angepasst werden
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {rankings.map((player, index) => (
            <div
              key={player.playerId}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-3 transition-all",
                tiedPlayers.includes(player.playerId) && "border-primary/30"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveUp(index)}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveDown(index)}
                  disabled={index === rankings.length - 1}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                player.rank === 1 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : player.rank === 2
                  ? 'bg-gray-100 text-gray-600'
                  : player.rank === 3
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {player.rank}
              </div>
              <div className="flex-1">
                <div className="font-medium">{player.name}</div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Medal className="h-3 w-3" />
                  {player.wins} {player.wins === 1 ? 'Sieg' : 'Siege'}
                </div>
              </div>
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Payment Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Zahlungsübersicht
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Detaillierte Auflistung aller Zahlungen mit Bussen
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.map((player) => (
            <div
              key={player.playerId}
              className="rounded-lg border bg-muted/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-semibold">{player.name}</span>
                <span className="text-lg font-bold text-primary">{formatCHF(player.total)}</span>
              </div>
              
              {/* Summary Row */}
              <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Buy-In:</span>
                  <span>{formatCHF(player.buyIn)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bussen:</span>
                  <span>{formatCHF(player.fines)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rang-Busse:</span>
                  <span>{formatCHF(player.rankFine)}</span>
                </div>
              </div>

              {/* Detailed Fines List */}
              {player.finesList.length > 0 && (
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <AlertCircle className="h-3 w-3" />
                    Bussen Details
                  </div>
                  <div className="space-y-1">
                    {player.finesList.map((fine, idx) => {
                      const fineType = FINE_TYPES.find(f => f.id === fine.type);
                      return (
                        <div
                          key={fine.id || idx}
                          className="flex items-center justify-between text-sm rounded bg-card p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {fine.location}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Match {fine.matchNumber}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <span>{fineType?.label || fine.type}</span>
                            {fine.note && (
                              <span className="text-xs text-muted-foreground">
                                ({fine.note})
                              </span>
                            )}
                          </div>
                          <span className="font-medium">{formatCHF(fine.amount)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Rank Fine Legend */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="mb-1 font-medium">Rang-Bussen:</div>
            <div className="grid grid-cols-4 gap-2 text-muted-foreground">
              <span>1. {formatCHF(0)}</span>
              <span>2. {formatCHF(10)}</span>
              <span>3. {formatCHF(15)}</span>
              <span>4. {formatCHF(20)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lösli */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Lösli
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Wer ging zuerst nach Hause?</label>
            <Select value={leftFirst} onValueChange={setLeftFirst}>
              <SelectTrigger>
                <SelectValue placeholder="Spieler wählen" />
              </SelectTrigger>
              <SelectContent>
                {PLAYERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {leftFirst && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm">
              <span className="font-medium text-primary">
                {PLAYERS.find(p => p.id === leftFirst)?.name}
              </span>{' '}
              muss nächstes Mal Lösli kaufen.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button 
          size="lg" 
          className="gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <CheckCircle className="h-5 w-5" />
          Session abschliessen
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="gap-2"
        >
          <Share2 className="h-5 w-5" />
          Als PDF / Teilen
        </Button>
      </div>
    </div>
  );
}
