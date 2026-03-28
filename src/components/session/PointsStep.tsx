import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calculator, AlertCircle, ChevronRight, ChevronLeft, X, Plus, Skull, PartyPopper } from 'lucide-react';
import { FINE_TYPES, formatCHF } from '@/lib/players';
import { JASS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Player } from '@/hooks/usePlayers';
import type { Fine } from '@/types/jass';

interface PointsStepProps {
  scoresA: (number | null)[];
  scoresB: (number | null)[];
  onScoreAChange: (round: number, value: number | null) => void;
  onScoreBChange: (round: number, value: number | null) => void;
  teamATotal: number;
  teamBTotal: number;
  teamANames: string;
  teamBNames: string;
  onNext: () => void;
  onPrev: () => void;
  players: Player[];
  fines: Fine[];
  onAddFine: (fine: Omit<Fine, 'id'>) => void;
  onRemoveFine: (id: string) => void;
  allRoundsComplete: boolean;
}

export function PointsStep({
  scoresA,
  scoresB,
  onScoreAChange,
  onScoreBChange,
  teamATotal,
  teamBTotal,
  teamANames,
  teamBNames,
  onNext,
  onPrev,
  players,
  fines,
  onAddFine,
  onRemoveFine,
  allRoundsComplete,
}: PointsStepProps) {
  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [note, setNote] = useState('');

  const selectedFineType = FINE_TYPES.find(f => f.id === selectedType);
  const isCustomAmount = selectedFineType?.amount === 0;

  const handleAddFine = (round: number) => {
    if (!selectedPlayer || !selectedType) return;
    onAddFine({
      playerId: selectedPlayer,
      type: selectedType,
      amount: isCustomAmount ? amount : (selectedFineType?.amount || 0),
      note: note ? `Runde ${round + 1}: ${note}` : `Runde ${round + 1}`,
    });
    setSelectedPlayer('');
    setSelectedType('');
    setAmount(0);
    setNote('');
  };

  const getFinesForRound = (round: number) => {
    return fines.filter(f => f.note?.startsWith(`Runde ${round + 1}`));
  };

  // Calculate win conditions
  const PPR = JASS.POINTS_PER_ROUND;
  const roundsPlayed = scoresA.filter(s => s !== null).length;
  const remainingRounds = JASS.ROUNDS_PER_MATCH - roundsPlayed;
  const currentDiff = teamBTotal - teamATotal;

  const teamAMinToWin = Math.floor((currentDiff + remainingRounds * PPR) / 2) + 1;
  const teamBMinToWin = Math.floor((-currentDiff + remainingRounds * PPR) / 2) + 1;
  const maxPossible = remainingRounds * PPR;

  const lastRound = JASS.ROUNDS_PER_MATCH - 1;
  const teamACantWin = roundsPlayed >= lastRound && teamAMinToWin > maxPossible;
  const teamBCantWin = roundsPlayed >= lastRound && teamBMinToWin > maxPossible;
  const showWinCondition = roundsPlayed >= lastRound && roundsPlayed < JASS.ROUNDS_PER_MATCH;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
            Punkte & Bussen
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gib Punkte ein – die andere Seite wird automatisch berechnet ({JASS.POINTS_PER_ROUND} − Eingabe)
          </p>
        </CardHeader>
        <CardContent>
          {/* Team Headers */}
          <div className="mb-3 grid grid-cols-[auto_1fr_1fr_auto] gap-1 sm:gap-2 text-sm font-medium">
            <div className="w-12 sm:w-16"></div>
            <div className="text-center text-primary truncate">{teamANames || 'Team A'}</div>
            <div className="text-center text-muted-foreground truncate">{teamBNames || 'Team B'}</div>
            <div className="w-8"></div>
          </div>

          {/* Rounds */}
          <div className="space-y-2">
            {scoresA.map((scoreA, i) => {
              const scoreB = scoresB[i];
              const roundFines = getFinesForRound(i);
              return (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-1 sm:gap-2">
                    <div className="w-12 sm:w-16 text-xs sm:text-sm text-muted-foreground">Runde {i + 1}</div>
                    <Input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max={JASS.POINTS_PER_ROUND}
                      value={scoreA ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        onScoreAChange(i, val !== null && !isNaN(val) ? Math.min(JASS.POINTS_PER_ROUND, Math.max(0, val)) : null);
                      }}
                      className="text-center"
                      placeholder="0"
                      aria-label={`Runde ${i + 1} Team A Punkte`}
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="0"
                      max={JASS.POINTS_PER_ROUND}
                      value={scoreB ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        onScoreBChange(i, val !== null && !isNaN(val) ? Math.min(JASS.POINTS_PER_ROUND, Math.max(0, val)) : null);
                      }}
                      className="text-center"
                      placeholder="0"
                      aria-label={`Runde ${i + 1} Team B Punkte`}
                    />
                    <Button
                      variant={expandedRound === i ? "default" : "ghost"}
                      size="icon"
                      className="relative"
                      onClick={() => setExpandedRound(expandedRound === i ? null : i)}
                      aria-label={`Bussen für Runde ${i + 1}`}
                    >
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                      {roundFines.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {roundFines.length}
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Expanded Fine Entry for this Round */}
                  {expandedRound === i && (
                    <div className="ml-0 sm:ml-16 space-y-2 rounded-lg border bg-muted/50 p-2 sm:p-3">
                      <div className="text-xs font-medium text-muted-foreground mb-2">
                        Bussen für Runde {i + 1}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Spieler" />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((p) => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedType} onValueChange={setSelectedType}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Bussenart" />
                          </SelectTrigger>
                          <SelectContent>
                            {FINE_TYPES.map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.label} {f.amount > 0 && `(${formatCHF(f.amount)})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {isCustomAmount && (
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          placeholder="Betrag (CHF)"
                          value={amount || ''}
                          onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                          className="h-9"
                        />
                      )}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Notiz (optional)"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="h-9"
                        />
                        <Button
                          size="sm"
                          className="shrink-0 gap-1"
                          onClick={() => handleAddFine(i)}
                          disabled={!selectedPlayer || !selectedType}
                        >
                          <Plus className="h-3 w-3" aria-hidden="true" />
                          Hinzufügen
                        </Button>
                      </div>

                      {/* Fines for this round */}
                      {roundFines.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                          {roundFines.map((fine) => {
                            const player = players.find(p => p.id === fine.playerId);
                            const fineType = FINE_TYPES.find(f => f.id === fine.type);
                            return (
                              <div
                                key={fine.id}
                                className="flex items-center justify-between rounded bg-card p-2 text-sm"
                              >
                                <span>
                                  <span className="font-medium">{player?.name}</span>
                                  {' – '}
                                  {fineType?.label} ({formatCHF(fine.amount)})
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive"
                                  onClick={() => onRemoveFine(fine.id)}
                                  aria-label="Busse entfernen"
                                >
                                  <X className="h-3 w-3" aria-hidden="true" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Win Condition Card */}
      {showWinCondition && (
        <Card className={cn(
          "border-2 transition-all",
          teamACantWin || teamBCantWin
            ? "border-destructive bg-destructive/5"
            : "border-primary/30 bg-primary/5"
        )}>
          <CardContent className="p-4">
            {teamACantWin ? (
              <div className="text-center space-y-2 animate-fade-in">
                <div className="flex items-center justify-center gap-2">
                  <Skull className="h-8 w-8 text-destructive animate-bounce" aria-hidden="true" />
                  <span className="text-2xl">💀</span>
                </div>
                <p className="font-bold text-destructive text-lg">
                  {teamANames} kann nicht mehr gewinnen!
                </p>
                <p className="text-sm text-muted-foreground">
                  Bräuchten {teamAMinToWin} Punkte, aber maximal {maxPossible} möglich
                </p>
              </div>
            ) : teamBCantWin ? (
              <div className="text-center space-y-2 animate-fade-in">
                <div className="flex items-center justify-center gap-2">
                  <Skull className="h-8 w-8 text-destructive animate-bounce" aria-hidden="true" />
                  <span className="text-2xl">💀</span>
                </div>
                <p className="font-bold text-destructive text-lg">
                  {teamBNames} kann nicht mehr gewinnen!
                </p>
                <p className="text-sm text-muted-foreground">
                  Bräuchten {teamBMinToWin} Punkte, aber maximal {maxPossible} möglich
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Trophy className="h-5 w-5" aria-hidden="true" />
                  <span className="font-semibold">Letzte Runde!</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{teamANames} braucht</p>
                    <p className="text-2xl font-bold text-primary">
                      {teamAMinToWin <= 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <PartyPopper className="h-5 w-5" aria-hidden="true" />
                          Führt!
                        </span>
                      ) : (
                        `${teamAMinToWin} Pkt`
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{teamBNames} braucht</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      teamBMinToWin <= 0 ? "text-primary" : "text-muted-foreground"
                    )}>
                      {teamBMinToWin <= 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <PartyPopper className="h-5 w-5" aria-hidden="true" />
                          Führt!
                        </span>
                      ) : (
                        `${teamBMinToWin} Pkt`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Fines Summary */}
      {fines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              Bussen dieses Match ({fines.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {fines.map((fine) => {
                const player = players.find(p => p.id === fine.playerId);
                const fineType = FINE_TYPES.find(f => f.id === fine.type);
                return (
                  <div
                    key={fine.id}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-muted-foreground">
                      {fine.note} – <span className="text-foreground font-medium">{player?.name}</span>: {fineType?.label}
                    </span>
                    <span className="font-medium">{formatCHF(fine.amount)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between pt-2 border-t font-medium">
                <span>Total Bussen</span>
                <span className="text-primary">{formatCHF(fines.reduce((sum, f) => sum + f.amount, 0))}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky Footer */}
      <div className="sticky bottom-[calc(5rem+env(safe-area-inset-bottom))] lg:bottom-4">
        <Card className="border-primary/20 bg-card shadow-lg">
          <CardContent className="p-4">
            <div className="mb-3 flex justify-between text-lg font-bold">
              <span className="text-primary">{teamATotal}</span>
              <span>Total</span>
              <span className="text-muted-foreground">{teamBTotal}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={onPrev}>
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Zurück
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={onNext}
                disabled={!allRoundsComplete}
              >
                Nächstes Match
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            {!allRoundsComplete && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Alle {JASS.ROUNDS_PER_MATCH} Runden müssen ausgefüllt sein
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
