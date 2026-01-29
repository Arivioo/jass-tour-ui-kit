import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Users, Trophy, Calculator, AlertCircle, ChevronRight, ChevronLeft, X, Plus, Skull, PartyPopper, Sparkles, MapPin } from 'lucide-react';
import { PLAYERS, FINE_TYPES, LOCATIONS, formatCHF, type Player } from '@/lib/players';
import { cn } from '@/lib/utils';

type WizardStep = 'players' | 'teams' | 'points';

interface Fine {
  id: string;
  playerId: string;
  type: string;
  amount: number;
  note?: string;
  matchNumber?: number;
  location?: string;
}

interface MatchResult {
  teamA: string[];
  teamB: string[];
  teamATotal: number;
  teamBTotal: number;
  winner: 'A' | 'B' | 'tie';
  fines: Fine[];
  location: string;
  matchNumber: number;
}

// Track wins per player (1 point per match win)
interface PlayerWins {
  [playerId: string]: number;
}

// History entry for navigation
interface HistoryEntry {
  match: number;
  step: WizardStep;
  teamA: string[];
  teamB: string[];
  scoresA: (number | null)[];
  scoresB: (number | null)[];
  fines: Fine[];
  location: string;
}

export default function Session() {
  const navigate = useNavigate();
  const [currentMatch, setCurrentMatch] = useState(1);
  const [step, setStep] = useState<WizardStep>('players');
  const [activePlayers, setActivePlayers] = useState<string[]>(PLAYERS.map(p => p.id));
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scoresA, setScoresA] = useState<(number | null)[]>(Array(8).fill(null));
  const [scoresB, setScoresB] = useState<(number | null)[]>(Array(8).fill(null));
  const [fines, setFines] = useState<Fine[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [playerWins, setPlayerWins] = useState<PlayerWins>({});
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [winnerTeamNames, setWinnerTeamNames] = useState('');
  const [location, setLocation] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');

  const totalMatches = 5;
  const totalRounds = 8;

  const steps: { key: WizardStep; label: string; icon: React.ElementType }[] = [
    { key: 'players', label: 'Spieler', icon: Users },
    { key: 'teams', label: 'Teams', icon: Trophy },
    { key: 'points', label: 'Punkte & Bussen', icon: Calculator },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  
  // Get display location name
  const getLocationName = (loc: string, custom?: string) => {
    if (loc === 'custom') return custom || 'Unbekannt';
    return LOCATIONS.find(l => l.id === loc)?.name || loc;
  };

  // Check if all rounds have scores
  const allRoundsComplete = scoresA.every(s => s !== null);

  const handlePrevStep = () => {
    if (step === 'teams') {
      if (currentMatch > 1) {
        // Go back to previous match's points step
        const prevResult = matchResults[currentMatch - 2];
        if (prevResult) {
          // Restore previous match data
          setCurrentMatch(currentMatch - 1);
          setTeamA(prevResult.teamA);
          setTeamB(prevResult.teamB);
          // Reconstruct scores from totals (we need to store full scores in results)
          setScoresA(Array(8).fill(null));
          setScoresB(Array(8).fill(null));
          setFines(prevResult.fines);
          setLocation(prevResult.location || '');
          setStep('points');
          // Remove this result from matchResults
          setMatchResults(matchResults.slice(0, -1));
          // Recalculate player wins
          const newPlayerWins = { ...playerWins };
          if (prevResult.winner === 'A') {
            prevResult.teamA.forEach(playerId => {
              newPlayerWins[playerId] = Math.max(0, (newPlayerWins[playerId] || 0) - 1);
            });
          } else if (prevResult.winner === 'B') {
            prevResult.teamB.forEach(playerId => {
              newPlayerWins[playerId] = Math.max(0, (newPlayerWins[playerId] || 0) - 1);
            });
          }
          setPlayerWins(newPlayerWins);
        }
      } else {
        setStep('players');
      }
    } else if (step === 'points') {
      setStep('teams');
    }
  };

  const handleNextStep = () => {
    if (step === 'players') setStep('teams');
    else if (step === 'teams') setStep('points');
    else if (step === 'points') {
      // Determine winner and update wins
      const teamATotal = scoresA.reduce((sum, s) => sum + (s ?? 0), 0);
      const teamBTotal = scoresB.reduce((sum, s) => sum + (s ?? 0), 0);
      const winner = teamATotal > teamBTotal ? 'A' : teamBTotal > teamATotal ? 'B' : 'tie';
      const matchLocation = getLocationName(location, customLocation);
      
      // Add location and match info to fines
      const finesWithMeta = fines.map(f => ({
        ...f,
        matchNumber: currentMatch,
        location: matchLocation,
      }));
      
      const result: MatchResult = {
        teamA: [...teamA],
        teamB: [...teamB],
        teamATotal,
        teamBTotal,
        winner,
        fines: finesWithMeta,
        location: matchLocation,
        matchNumber: currentMatch,
      };
      
      // Update player wins (1 point per match win)
      const newPlayerWins = { ...playerWins };
      if (winner === 'A') {
        teamA.forEach(playerId => {
          newPlayerWins[playerId] = (newPlayerWins[playerId] || 0) + 1;
        });
      } else if (winner === 'B') {
        teamB.forEach(playerId => {
          newPlayerWins[playerId] = (newPlayerWins[playerId] || 0) + 1;
        });
      }
      
      setMatchResults([...matchResults, result]);
      setPlayerWins(newPlayerWins);
      
      // Show winner animation
      const winnerNames = winner === 'A' 
        ? teamA.map(id => PLAYERS.find(p => p.id === id)?.name || '').join(' & ')
        : winner === 'B'
        ? teamB.map(id => PLAYERS.find(p => p.id === id)?.name || '').join(' & ')
        : 'Unentschieden';
      setWinnerTeamNames(winnerNames);
      setShowWinnerAnimation(true);
      
      // After animation, continue
      setTimeout(() => {
        setShowWinnerAnimation(false);
        if (currentMatch < totalMatches) {
          setCurrentMatch(currentMatch + 1);
          setStep('teams');
          // Reset for new match - clear team selections
          setTeamA([]);
          setTeamB([]);
          setScoresA(Array(8).fill(null));
          setScoresB(Array(8).fill(null));
          setFines([]);
          setLocation('');
          setCustomLocation('');
        } else {
          // Navigate to summary with ranking data
          navigate('/summary', { state: { matchResults: [...matchResults, result], playerWins: newPlayerWins } });
        }
      }, 3000);
    }
  };

  const teamATotal = scoresA.reduce((sum, s) => sum + (s ?? 0), 0);
  const teamBTotal = scoresB.reduce((sum, s) => sum + (s ?? 0), 0);

  // Winner Animation Overlay
  if (showWinnerAnimation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95">
        <div className="text-center space-y-6 animate-scale-in">
          <div className="flex items-center justify-center gap-4">
            <Sparkles className="h-12 w-12 text-yellow-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <Trophy className="h-20 w-20 text-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
            <Sparkles className="h-12 w-12 text-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="space-y-2">
            <p className="text-xl text-muted-foreground">Match {currentMatch} Gewinner</p>
            <h1 className="text-4xl font-bold text-primary">
              🎉 {winnerTeamNames} 🎉
            </h1>
          </div>
          <div className="flex justify-center gap-8 text-2xl font-bold">
            <span className="text-primary">{teamATotal}</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-muted-foreground">{teamBTotal}</span>
          </div>
          <PartyPopper className="h-16 w-16 text-primary mx-auto animate-bounce" />
        </div>
      </div>
    );
  }

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
          location={location}
          customLocation={customLocation}
          onLocationChange={setLocation}
          onCustomLocationChange={setCustomLocation}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          matchNumber={currentMatch}
          canGoBack={currentMatch > 1 || true}
        />
      )}

      {step === 'points' && (
        <PointsStep
          scoresA={scoresA}
          scoresB={scoresB}
          onScoreAChange={(round, value) => {
            const newScores = [...scoresA];
            newScores[round] = value;
            setScoresA(newScores);
            // Auto-fill B as complement
            const newScoresB = [...scoresB];
            newScoresB[round] = value !== null ? 157 - value : null;
            setScoresB(newScoresB);
          }}
          onScoreBChange={(round, value) => {
            const newScores = [...scoresB];
            newScores[round] = value;
            setScoresB(newScores);
            // Auto-fill A as complement
            const newScoresA = [...scoresA];
            newScoresA[round] = value !== null ? 157 - value : null;
            setScoresA(newScoresA);
          }}
          teamATotal={teamATotal}
          teamBTotal={teamBTotal}
          teamANames={teamA.map(id => PLAYERS.find(p => p.id === id)?.name || '').join(' & ')}
          teamBNames={teamB.map(id => PLAYERS.find(p => p.id === id)?.name || '').join(' & ')}
          onNext={handleNextStep}
          onPrev={handlePrevStep}
          players={PLAYERS.filter(p => activePlayers.includes(p.id))}
          fines={fines}
          onAddFine={(fine) => setFines([...fines, { ...fine, id: Date.now().toString() }])}
          onRemoveFine={(id) => setFines(fines.filter(f => f.id !== id))}
          allRoundsComplete={allRoundsComplete}
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
  location,
  customLocation,
  onLocationChange,
  onCustomLocationChange,
  onNext,
  onPrev,
  matchNumber,
  canGoBack,
}: {
  players: Player[];
  teamA: string[];
  teamB: string[];
  onTeamAChange: (ids: string[]) => void;
  onTeamBChange: (ids: string[]) => void;
  location: string;
  customLocation: string;
  onLocationChange: (loc: string) => void;
  onCustomLocationChange: (loc: string) => void;
  onNext: () => void;
  onPrev: () => void;
  matchNumber: number;
  canGoBack: boolean;
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
        {/* Location Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </label>
          <Select value={location} onValueChange={onLocationChange}>
            <SelectTrigger>
              <SelectValue placeholder="Location wählen" />
            </SelectTrigger>
            <SelectContent>
              {LOCATIONS.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {location === 'custom' && (
            <Input
              placeholder="Location eingeben..."
              value={customLocation}
              onChange={(e) => onCustomLocationChange(e.target.value)}
            />
          )}
        </div>

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

        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="gap-2" 
            onClick={onPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </Button>
          <Button 
            className="flex-1 gap-2" 
            onClick={onNext}
            disabled={teamA.length < 2 || teamB.length < 2 || !location || (location === 'custom' && !customLocation)}
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PointsStep({
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
}: {
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

  // Calculate win conditions after round 7
  // In Jass, points per round = 157, split between both teams
  // If Team A scores X, Team B scores (157 - X)
  // So to win, Team A needs: teamATotal + X > teamBTotal + (remainingRounds * 157 - X)
  // Simplified: X > (teamBTotal - teamATotal + remainingRounds * 157) / 2
  const roundsPlayed = scoresA.filter(s => s !== null).length;
  const remainingRounds = 8 - roundsPlayed;
  const currentDiff = teamBTotal - teamATotal; // positive = B leads, negative = A leads
  
  // Points Team A needs to score in remaining rounds to win
  // X > (diff + remaining * 157) / 2, so min X = floor((diff + remaining * 157) / 2) + 1
  const teamAMinToWin = Math.floor((currentDiff + remainingRounds * 157) / 2) + 1;
  const teamBMinToWin = Math.floor((-currentDiff + remainingRounds * 157) / 2) + 1;
  
  // Max points possible in remaining rounds
  const maxPossible = remainingRounds * 157;
  
  // Can't win if minimum needed exceeds maximum possible
  const teamACantWin = roundsPlayed >= 7 && teamAMinToWin > maxPossible;
  const teamBCantWin = roundsPlayed >= 7 && teamBMinToWin > maxPossible;
  const showWinCondition = roundsPlayed >= 7 && roundsPlayed < 8;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Punkte & Bussen
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gib Punkte ein – die andere Seite wird automatisch berechnet (157 − Eingabe)
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
            {scoresA.map((scoreA, i) => {
              const scoreB = scoresB[i];
              const roundFines = getFinesForRound(i);
              return (
                <div key={i} className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2">
                    <div className="w-16 text-sm text-muted-foreground">Runde {i + 1}</div>
                    <Input
                      type="number"
                      min="0"
                      max="157"
                      value={scoreA ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        onScoreAChange(i, val !== null && !isNaN(val) ? Math.min(157, Math.max(0, val)) : null);
                      }}
                      className="text-center"
                      placeholder="0"
                    />
                    <Input
                      type="number"
                      min="0"
                      max="157"
                      value={scoreB ?? ''}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value);
                        onScoreBChange(i, val !== null && !isNaN(val) ? Math.min(157, Math.max(0, val)) : null);
                      }}
                      className="text-center"
                      placeholder="0"
                    />
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

      {/* Win Condition Card - shows after round 7 */}
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
                  <Skull className="h-8 w-8 text-destructive animate-bounce" />
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
                  <Skull className="h-8 w-8 text-destructive animate-bounce" />
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
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">Letzte Runde!</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{teamANames} braucht</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      teamAMinToWin <= 0 ? "text-primary" : "text-primary"
                    )}>
                      {teamAMinToWin <= 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <PartyPopper className="h-5 w-5" />
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
                          <PartyPopper className="h-5 w-5" />
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
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={onPrev}>
                <ChevronLeft className="h-4 w-4" />
                Zurück
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={onNext}
                disabled={!allRoundsComplete}
              >
                Nächstes Match
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {!allRoundsComplete && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Alle 8 Runden müssen ausgefüllt sein
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
