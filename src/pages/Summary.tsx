import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, CreditCard, Gift, Share2, CheckCircle, GripVertical } from 'lucide-react';
import { PLAYERS, formatCHF } from '@/lib/players';

// Placeholder summary data
const SUMMARY_DATA = {
  rankings: [
    { playerId: '1', name: 'Hans', points: 1250, rank: 1 },
    { playerId: '2', name: 'Peter', points: 1180, rank: 2 },
    { playerId: '3', name: 'Urs', points: 1050, rank: 3 },
    { playerId: '4', name: 'Beat', points: 920, rank: 4 },
  ],
  payments: [
    { playerId: '1', name: 'Hans', buyIn: 25, fines: 15, rankFine: 0, total: 40 },
    { playerId: '2', name: 'Peter', buyIn: 25, fines: 20, rankFine: 10, total: 55 },
    { playerId: '3', name: 'Urs', buyIn: 25, fines: 10, rankFine: 15, total: 50 },
    { playerId: '4', name: 'Beat', buyIn: 25, fines: 25, rankFine: 20, total: 70 },
  ],
};

const RANK_FINES = { 1: 0, 2: 10, 3: 15, 4: 20 };

export default function Summary() {
  const navigate = useNavigate();
  const [leftFirst, setLeftFirst] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Zusammenfassung</h1>
        <p className="text-muted-foreground">Übersicht des Jass-Abends</p>
      </div>

      {/* Rankings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Rangliste
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {SUMMARY_DATA.rankings.map((player) => (
            <div
              key={player.playerId}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
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
                <div className="text-sm text-muted-foreground">{player.points} Punkte</div>
              </div>
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
          {SUMMARY_DATA.payments.map((player) => (
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
