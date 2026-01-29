import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, CreditCard, Gift, Share2, CheckCircle, Medal, Shuffle, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { PLAYERS, formatCHF } from '@/lib/players';
import { cn } from '@/lib/utils';

interface LocationState {
  matchResults?: Array<{
    teamA: string[];
    teamB: string[];
    teamATotal: number;
    teamBTotal: number;
    winner: 'A' | 'B' | 'tie';
    fines: Array<{ playerId: string; amount: number }>;
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
  payments: [
    { playerId: '1', name: 'Mötzi', buyIn: 25, fines: 15, rankFine: 0, total: 40 },
    { playerId: '2', name: 'Poli', buyIn: 25, fines: 20, rankFine: 10, total: 55 },
    { playerId: '3', name: 'Husi', buyIn: 25, fines: 10, rankFine: 15, total: 50 },
    { playerId: '4', name: 'Rötschi', buyIn: 25, fines: 25, rankFine: 20, total: 70 },
  ],
};

const RANK_FINES: { [key: number]: number } = { 1: 0, 2: 10, 3: 15, 4: 20 };

export default function Summary() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | undefined;
  const [leftFirst, setLeftFirst] = useState('');
  const [rankings, setRankings] = useState<RankingPlayer[]>([]);
  const [isRandomizing, setIsRandomizing] = useState(false);
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

  // Calculate fines from match results
  const playerFines = state?.matchResults
    ? PLAYERS.reduce((acc, player) => {
        const totalFines = state.matchResults?.reduce((sum, match) => {
          return sum + match.fines
            .filter(f => f.playerId === player.id)
            .reduce((s, f) => s + f.amount, 0);
        }, 0) || 0;
        acc[player.id] = totalFines;
        return acc;
      }, {} as { [key: string]: number })
    : null;

  // Calculate payments with rank fines based on wins
  const payments = rankings.map(player => {
    const finesAmount = playerFines?.[player.playerId] || 
      PLACEHOLDER_SUMMARY.payments.find(p => p.playerId === player.playerId)?.fines || 0;
    const rankFine = RANK_FINES[player.rank] || 0;
    return {
      playerId: player.playerId,
      name: player.name,
      buyIn: 25,
      fines: finesAmount,
      rankFine,
      total: 25 + finesAmount + rankFine,
    };
  });

  // Randomize tied players
  const handleRandomize = () => {
    setIsRandomizing(true);
    
    // Animate randomization
    let iterations = 0;
    const maxIterations = 15;
    const interval = setInterval(() => {
      iterations++;
      
      setRankings(prev => {
        const tiedWins = [...new Set(prev.filter(r => tiedPlayers.includes(r.playerId)).map(r => r.wins))];
        const newRankings = [...prev];
        
        tiedWins.forEach(wins => {
          const tiedIndices = newRankings
            .map((r, i) => r.wins === wins ? i : -1)
            .filter(i => i !== -1);
          
          // Shuffle tied players
          for (let i = tiedIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const tempRank = newRankings[tiedIndices[i]].rank;
            newRankings[tiedIndices[i]].rank = newRankings[tiedIndices[j]].rank;
            newRankings[tiedIndices[j]].rank = tempRank;
            
            // Swap positions in array
            [newRankings[tiedIndices[i]], newRankings[tiedIndices[j]]] = 
              [newRankings[tiedIndices[j]], newRankings[tiedIndices[i]]];
          }
        });
        
        return newRankings.sort((a, b) => a.rank - b.rank);
      });
      
      if (iterations >= maxIterations) {
        clearInterval(interval);
        setIsRandomizing(false);
        setShowTiebreaker(false);
      }
    }, 100);
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
        <p className="text-muted-foreground">Übersicht des Jass-Abends</p>
      </div>

      {/* Tiebreaker Card */}
      {showTiebreaker && tiedPlayers.length > 0 && (
        <Card className="border-2 border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-semibold text-primary flex items-center gap-2">
                  <Shuffle className="h-5 w-5" />
                  Gleichstand erkannt!
                </p>
                <p className="text-sm text-muted-foreground">
                  {tiedPlayers.length} Spieler haben die gleiche Anzahl Siege
                </p>
              </div>
              <Button 
                onClick={handleRandomize}
                disabled={isRandomizing}
                className="gap-2"
              >
                <Shuffle className={cn("h-4 w-4", isRandomizing && "animate-spin")} />
                {isRandomizing ? 'Auslosen...' : 'Auslosen'}
              </Button>
            </div>
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
                isRandomizing && tiedPlayers.includes(player.playerId) && "animate-pulse bg-primary/10",
                tiedPlayers.includes(player.playerId) && !isRandomizing && "border-primary/30"
              )}
            >
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveUp(index)}
                  disabled={index === 0 || isRandomizing}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => moveDown(index)}
                  disabled={index === rankings.length - 1 || isRandomizing}
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
        </CardHeader>
        <CardContent className="space-y-3">
          {payments.map((player) => (
            <div
              key={player.playerId}
              className="rounded-lg border bg-muted/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-lg font-semibold">{player.name}</span>
                <span className="text-lg font-bold text-primary">{formatCHF(player.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
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
                <div className="flex justify-between font-medium">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="text-primary">{formatCHF(player.total)}</span>
                </div>
              </div>
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
