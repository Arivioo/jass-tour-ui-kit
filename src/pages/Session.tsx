import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Sparkles, PartyPopper, Loader2 } from 'lucide-react';
import { LOCATIONS } from '@/lib/players';
import { JASS } from '@/lib/constants';
import { usePlayers } from '@/hooks/usePlayers';
import { cn } from '@/lib/utils';
import type { Fine, MatchResult, PlayerWins } from '@/types/jass';
import { PlayersStep } from '@/components/session/PlayersStep';
import { TeamsStep } from '@/components/session/TeamsStep';
import { PointsStep } from '@/components/session/PointsStep';

type WizardStep = 'players' | 'teams' | 'points';

export default function Session() {
  const navigate = useNavigate();
  const { data: players = [], isLoading } = usePlayers();
  const [currentMatch, setCurrentMatch] = useState(1);
  const [step, setStep] = useState<WizardStep>('players');
  const [activePlayers, setActivePlayers] = useState<string[]>([]);
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [scoresA, setScoresA] = useState<(number | null)[]>(Array(JASS.ROUNDS_PER_MATCH).fill(null));
  const [scoresB, setScoresB] = useState<(number | null)[]>(Array(JASS.ROUNDS_PER_MATCH).fill(null));
  const [fines, setFines] = useState<Fine[]>([]);
  const [matchResults, setMatchResults] = useState<MatchResult[]>([]);
  const [playerWins, setPlayerWins] = useState<PlayerWins>({});
  const [showWinnerAnimation, setShowWinnerAnimation] = useState(false);
  const [winnerTeamNames, setWinnerTeamNames] = useState('');
  const [location, setLocation] = useState<string>('');
  const [customLocation, setCustomLocation] = useState<string>('');
  const [playersInitialized, setPlayersInitialized] = useState(false);

  // Initialize active players when players load
  if (players.length > 0 && !playersInitialized) {
    setActivePlayers(players.map(p => p.id));
    setPlayersInitialized(true);
  }

  const totalMatches = JASS.MATCHES_PER_SESSION;
  const totalRounds = JASS.ROUNDS_PER_MATCH;

  const steps: { key: WizardStep; label: string }[] = [
    { key: 'players', label: 'Spieler' },
    { key: 'teams', label: 'Teams' },
    { key: 'points', label: 'Punkte & Bussen' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const getLocationName = (loc: string, custom?: string) => {
    if (loc === 'custom') return custom || 'Unbekannt';
    return LOCATIONS.find(l => l.id === loc)?.name || loc;
  };

  const allRoundsComplete = scoresA.every(s => s !== null);

  const handlePrevStep = () => {
    if (step === 'teams') {
      if (currentMatch > 1) {
        const prevResult = matchResults[currentMatch - 2];
        if (prevResult) {
          setCurrentMatch(currentMatch - 1);
          setTeamA(prevResult.teamA);
          setTeamB(prevResult.teamB);
          setScoresA(Array(JASS.ROUNDS_PER_MATCH).fill(null));
          setScoresB(Array(JASS.ROUNDS_PER_MATCH).fill(null));
          setFines(prevResult.fines);
          setLocation(prevResult.location || '');
          setStep('points');
          setMatchResults(matchResults.slice(0, -1));
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
      const teamATotal = scoresA.reduce<number>((sum, s) => sum + (s ?? 0), 0);
      const teamBTotal = scoresB.reduce<number>((sum, s) => sum + (s ?? 0), 0);
      const winner: 'A' | 'B' | 'tie' = teamATotal > teamBTotal ? 'A' : teamBTotal > teamATotal ? 'B' : 'tie';
      const matchLocation = getLocationName(location, customLocation);

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

      const winnerNames = winner === 'A'
        ? teamA.map(id => players.find(p => p.id === id)?.name || '').join(' & ')
        : winner === 'B'
        ? teamB.map(id => players.find(p => p.id === id)?.name || '').join(' & ')
        : 'Unentschieden';
      setWinnerTeamNames(winnerNames);
      setShowWinnerAnimation(true);

      setTimeout(() => {
        setShowWinnerAnimation(false);
        if (currentMatch < totalMatches) {
          setCurrentMatch(currentMatch + 1);
          setStep('teams');
          setTeamA([]);
          setTeamB([]);
          setScoresA(Array(JASS.ROUNDS_PER_MATCH).fill(null));
          setScoresB(Array(JASS.ROUNDS_PER_MATCH).fill(null));
          setFines([]);
          setLocation('');
          setCustomLocation('');
        } else {
          navigate('/summary', { state: { matchResults: [...matchResults, result], playerWins: newPlayerWins } });
        }
      }, 3000);
    }
  };

  const teamATotal = scoresA.reduce<number>((sum, s) => sum + (s ?? 0), 0);
  const teamBTotal = scoresB.reduce<number>((sum, s) => sum + (s ?? 0), 0);

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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {step === 'players' && (
            <PlayersStep
              players={players}
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
              players={players.filter(p => activePlayers.includes(p.id))}
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
                const newScoresB = [...scoresB];
                newScoresB[round] = value !== null ? JASS.POINTS_PER_ROUND - value : null;
                setScoresB(newScoresB);
              }}
              onScoreBChange={(round, value) => {
                const newScores = [...scoresB];
                newScores[round] = value;
                setScoresB(newScores);
                const newScoresA = [...scoresA];
                newScoresA[round] = value !== null ? JASS.POINTS_PER_ROUND - value : null;
                setScoresA(newScoresA);
              }}
              teamATotal={teamATotal}
              teamBTotal={teamBTotal}
              teamANames={teamA.map(id => players.find(p => p.id === id)?.name || '').join(' & ')}
              teamBNames={teamB.map(id => players.find(p => p.id === id)?.name || '').join(' & ')}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
              players={players.filter(p => activePlayers.includes(p.id))}
              fines={fines}
              onAddFine={(fine) => setFines([...fines, { ...fine, id: Date.now().toString() }])}
              onRemoveFine={(id) => setFines(fines.filter(f => f.id !== id))}
              allRoundsComplete={allRoundsComplete}
            />
          )}
        </>
      )}
    </div>
  );
}
