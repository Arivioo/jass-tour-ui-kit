import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, Trophy, Calculator, AlertCircle, ChevronRight, X, Plus } from 'lucide-react';
import { PLAYERS, FINE_TYPES, formatCHF, type Player } from '@/lib/players';
import { cn } from '@/lib/utils';

type WizardStep = 'players' | 'teams' | 'points';

interface Fine {
  id: string;
  playerId: string;
  type: string;
  amount: number;
  note?: string;
}

export default function Session() {
  const navigate = useNavigate();
  const [currentMatch, setCurrentMatch] = useState(1);
  const [step, setStep] = useState<WizardStep>('players');
  const [activePlayers, setActivePlayers] = useState<string[]>(PLAYERS.map(p => p.id));
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scores, setScores] = useState<number[]>(Array(8).fill(0));
  const [fines, setFines] = useState<Fine[]>([]);

  const totalMatches = 5;
  const totalRounds = 8;

  const steps: { key: WizardStep; label: string; icon: React.ElementType }[] = [
    { key: 'players', label: 'Spieler', icon: Users },
    { key: 'teams', label: 'Teams', icon: Trophy },
    { key: 'points', label: 'Punkte & Bussen', icon: Calculator },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const handleNextStep = () => {
    if (step === 'players') setStep('teams');
    else if (step === 'teams') setStep('points');
    else if (step === 'points') {
      if (currentMatch < totalMatches) {
        setCurrentMatch(currentMatch + 1);
        setStep('teams');
        setScores(Array(8).fill(0));
      } else {
        navigate('/summary');
      }
    }
  };

  const teamATotal = scores.reduce((sum, s) => sum + s, 0);
  const teamBTotal = scores.reduce((sum, s) => sum + (157 - s), 0);

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="rounded-lg bg-primary/10 p-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-primary">Match {currentMatch}/{totalMatches}</span>
          {step === 'points' && (
            <span className="text-muted-foreground">Runde 1-{totalRounds}</span>
          )}
        </div>
        {/* Step Indicators */}
        <div className="mt-3 flex gap-2">
          {steps.map((s, i) => (
            <div
              key={s.key}
              className={cn(
                'flex-1 rounded-full h-1.5 transition-colors',
                i <= currentStepIndex ? 'bg-primary' : 'bg-primary/20'
              )}
            />
          ))}
        </div>
      </div>

      {/* Step Content */}
      {step === 'players' && (
        <PlayersStep 
          players={PLAYERS}
          active={activePlayers}
          onToggle={(id) => {
            setActivePlayers(prev => 
              prev.includes(id) 
                ? prev.filter(p => p !== id)
                : [...prev, id]
            );
          }}
          onNext={handleNextStep}
        />
      )}

      {step === 'teams' && (
        <TeamsStep
          players={PLAYERS.filter(p => activePlayers.includes(p.id))}
          teamA={teamA}
          teamB={teamB}
          onTeamAChange={setTeamA}
          onTeamBChange={setTeamB}
          onNext={handleNextStep}
          matchNumber={currentMatch}
        />
      )}

      {step === 'points' && (
        <PointsStep
          scores={scores}
          onScoreChange={(round, value) => {
            const newScores = [...scores];
            newScores[round] = value;
            setScores(newScores);
          }}
          teamATotal={teamATotal}
          teamBTotal={teamBTotal}
          teamANames={teamA.map(id => PLAYERS.find(p => p.id === id)?.name || '').join(' & ')}
          teamBNames={teamB.map(id => PLAYERS.find(p => p.id === id)?.name || '').join(' & ')}
          onNext={handleNextStep}
          players={PLAYERS.filter(p => activePlayers.includes(p.id))}
          fines={fines}
          onAddFine={(fine) => setFines([...fines, { ...fine, id: Date.now().toString() }])}
          onRemoveFine={(id) => setFines(fines.filter(f => f.id !== id))}
        />
      )}

    </div>
  );
}

function PlayersStep({ 
  players, 
  active, 
  onToggle, 
  onNext 
}: { 
  players: Player[];
  active: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Spieler heute
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {player.name.charAt(0)}
                </div>
                <span className="font-medium">{player.name}</span>
              </div>
              <Switch
                checked={active.includes(player.id)}
                onCheckedChange={() => onToggle(player.id)}
              />
            </div>
          ))}
        </div>
        <Button 
          className="w-full gap-2" 
          onClick={onNext}
          disabled={active.length < 2}
        >
          Weiter
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function TeamsStep({
  players,
  teamA,
  teamB,
  onTeamAChange,
  onTeamBChange,
  onNext,
  matchNumber,
}: {
  players: Player[];
  teamA: string[];
  teamB: string[];
  onTeamAChange: (ids: string[]) => void;
  onTeamBChange: (ids: string[]) => void;
  onNext: () => void;
  matchNumber: number;
}) {
  const availableForA = players.filter(p => !teamB.includes(p.id));
  const availableForB = players.filter(p => !teamA.includes(p.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Teams wählen (Match {matchNumber})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Team A */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Team A</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {[0, 1].map((idx) => (
              <Select
                key={`a-${idx}`}
                value={teamA[idx] || ''}
                onValueChange={(val) => {
                  const newTeam = [...teamA];
                  newTeam[idx] = val;
                  onTeamAChange(newTeam.filter(Boolean));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Spieler ${idx + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableForA.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={teamA.includes(p.id) && teamA[idx] !== p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>

        {/* Team B */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Team B</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {[0, 1].map((idx) => (
              <Select
                key={`b-${idx}`}
                value={teamB[idx] || ''}
                onValueChange={(val) => {
                  const newTeam = [...teamB];
                  newTeam[idx] = val;
                  onTeamBChange(newTeam.filter(Boolean));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Spieler ${idx + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {availableForB.map((p) => (
                    <SelectItem key={p.id} value={p.id} disabled={teamB.includes(p.id) && teamB[idx] !== p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>

        <Button 
          className="w-full gap-2" 
          onClick={onNext}
          disabled={teamA.length < 2 || teamB.length < 2}
        >
          Weiter
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function PointsStep({
  scores,
  onScoreChange,
  teamATotal,
  teamBTotal,
  teamANames,
  teamBNames,
  onNext,
  players,
  fines,
  onAddFine,
  onRemoveFine,
}: {
  scores: number[];
  onScoreChange: (round: number, value: number) => void;
  teamATotal: number;
  teamBTotal: number;
  teamANames: string;
  teamBNames: string;
  onNext: () => void;
  players: Player[];
  fines: Fine[];
  onAddFine: (fine: Omit<Fine, 'id'>) => void;
  onRemoveFine: (id: string) => void;
}) {
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Punkte & Bussen
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Team B = 157 − Team A | Tippe auf Runde für Bussen
          </p>
        </CardHeader>
        <CardContent>
          {/* Team Headers */}
          <div className="mb-3 grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-sm font-medium">
            <div className="w-16"></div>
            <div className="text-center text-primary">{teamANames || 'Team A'}</div>
            <div className="text-center text-muted-foreground">{teamBNames || 'Team B'}</div>
            <div className="w-8"></div>
          </div>

          {/* Rounds */}
          <div className="space-y-2">
            {scores.map((score, i) => {
              const roundFines = getFinesForRound(i);
              return (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                    <div className="w-16 text-sm text-muted-foreground">Runde {i + 1}</div>
                    <Input
                      type="number"
                      min="0"
                      max="157"
                      value={score || ''}
                      onChange={(e) => onScoreChange(i, parseInt(e.target.value) || 0)}
                      className="text-center"
                      placeholder="0"
                    />
                    <div className="rounded-md border bg-muted px-3 py-2 text-center text-muted-foreground">
                      {157 - score}
                    </div>
                    <Button
                      variant={expandedRound === i ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8 relative"
                      onClick={() => setExpandedRound(expandedRound === i ? null : i)}
                    >
                      <AlertCircle className="h-4 w-4" />
                      {roundFines.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {roundFines.length}
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Expanded Fine Entry for this Round */}
                  {expandedRound === i && (
                    <div className="ml-16 space-y-2 rounded-lg border bg-muted/50 p-3">
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
                          <Plus className="h-3 w-3" />
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
                                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                  onClick={() => onRemoveFine(fine.id)}
                                >
                                  <X className="h-3 w-3" />
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

      {/* Fines Summary */}
      {fines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
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
      <div className="sticky bottom-20 lg:bottom-4">
        <Card className="border-primary/20 bg-card shadow-lg">
          <CardContent className="p-4">
            <div className="mb-3 flex justify-between text-lg font-bold">
              <span className="text-primary">{teamATotal}</span>
              <span>Total</span>
              <span className="text-muted-foreground">{teamBTotal}</span>
            </div>
            <Button className="w-full gap-2" onClick={onNext}>
              Nächstes Match
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
