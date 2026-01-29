import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  playerId: string;
  name: string;
  wins: number;
}

interface LuckyWheelProps {
  players: Player[];
  onComplete: (orderedPlayers: Player[]) => void;
}

const WHEEL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
];

export function LuckyWheel({ players, onComplete }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [remainingPlayers, setRemainingPlayers] = useState<Player[]>(players);
  const [orderedResults, setOrderedResults] = useState<Player[]>([]);
  const wheelRef = useRef<HTMLDivElement>(null);

  const segmentAngle = 360 / remainingPlayers.length;

  const spinWheel = () => {
    if (isSpinning || remainingPlayers.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);

    // Random number of full rotations (3-5) plus random segment
    const fullRotations = 3 + Math.random() * 2;
    const randomSegment = Math.floor(Math.random() * remainingPlayers.length);
    const targetRotation = rotation + (fullRotations * 360) + (randomSegment * segmentAngle) + (segmentAngle / 2);

    setRotation(targetRotation);

    // Wait for spin to complete
    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate which segment the pointer landed on
      const normalizedRotation = targetRotation % 360;
      const winnerIndex = Math.floor((360 - normalizedRotation + segmentAngle / 2) / segmentAngle) % remainingPlayers.length;
      const selectedPlayer = remainingPlayers[winnerIndex];
      
      setWinner(selectedPlayer);
      setShowResult(true);
      
      // Add to ordered results
      const newOrderedResults = [...orderedResults, selectedPlayer];
      setOrderedResults(newOrderedResults);
      
      // Remove from remaining players
      const newRemaining = remainingPlayers.filter(p => p.playerId !== selectedPlayer.playerId);
      
      setTimeout(() => {
        if (newRemaining.length <= 1) {
          // If only one player left, add them automatically
          if (newRemaining.length === 1) {
            const finalResults = [...newOrderedResults, newRemaining[0]];
            onComplete(finalResults);
          } else {
            onComplete(newOrderedResults);
          }
        } else {
          setRemainingPlayers(newRemaining);
          setShowResult(false);
          setWinner(null);
        }
      }, 1500);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>
          Platz {orderedResults.length + 1} von {players.length} wird ausgelost
        </span>
      </div>

      {/* Already determined positions */}
      {orderedResults.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center">
          {orderedResults.map((player, idx) => (
            <div
              key={player.playerId}
              className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm"
            >
              <span className="font-bold text-primary">{idx + 1}.</span>
              <span>{player.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Wheel container */}
      <div className="relative">
        {/* Pointer */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <div
          ref={wheelRef}
          className="relative w-48 h-48 rounded-full border-4 border-primary shadow-xl overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {remainingPlayers.map((player, index) => {
            const startAngle = index * segmentAngle;
            const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
            
            return (
              <div
                key={player.playerId}
                className="absolute w-full h-full"
                style={{
                  clipPath: remainingPlayers.length === 2
                    ? `polygon(50% 50%, ${index === 0 ? '0% 0%, 100% 0%, 100% 50%, 0% 50%' : '0% 50%, 100% 50%, 100% 100%, 0% 100%'})`
                    : `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.tan((segmentAngle * Math.PI) / 360)}% 0%)`,
                  transform: `rotate(${startAngle}deg)`,
                  transformOrigin: '50% 50%',
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          })}
          
          {/* Player names */}
          {remainingPlayers.map((player, index) => {
            const angle = (index * segmentAngle) + (segmentAngle / 2) - 90;
            const radius = 60;
            const x = 96 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 96 + radius * Math.sin((angle * Math.PI) / 180);
            
            return (
              <div
                key={`name-${player.playerId}`}
                className="absolute text-xs font-bold text-foreground drop-shadow-sm whitespace-nowrap"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                }}
              >
                {player.name}
              </div>
            );
          })}

          {/* Center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background border-2 border-primary shadow-inner flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Result announcement */}
      {showResult && winner && (
        <div className="animate-scale-in text-center space-y-1">
          <p className="text-lg font-bold text-primary">🎉 {winner.name}!</p>
          <p className="text-sm text-muted-foreground">
            Platz {orderedResults.length}
          </p>
        </div>
      )}

      {/* Spin button */}
      <Button
        onClick={spinWheel}
        disabled={isSpinning}
        size="lg"
        className={cn(
          "gap-2 min-w-[200px]",
          isSpinning && "animate-pulse"
        )}
      >
        <Sparkles className={cn("h-5 w-5", isSpinning && "animate-spin")} />
        {isSpinning ? 'Dreht...' : remainingPlayers.length === players.length ? 'Glücksrad drehen!' : 'Weiter drehen!'}
      </Button>

      {/* Remaining players */}
      {remainingPlayers.length < players.length && remainingPlayers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Noch im Rennen: {remainingPlayers.map(p => p.name).join(', ')}
        </p>
      )}
    </div>
  );
}
