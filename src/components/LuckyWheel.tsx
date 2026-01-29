import { useState } from 'react';
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
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
];

// Create SVG arc path for a pie segment
function createArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  
  const x1 = centerX + radius * Math.cos(startRad);
  const y1 = centerY + radius * Math.sin(startRad);
  const x2 = centerX + radius * Math.cos(endRad);
  const y2 = centerY + radius * Math.sin(endRad);
  
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  
  return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
}

// Get text position for a segment
function getTextPosition(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): { x: number; y: number; rotation: number } {
  const midAngle = (startAngle + endAngle) / 2;
  const rad = (midAngle - 90) * (Math.PI / 180);
  const textRadius = radius * 0.6;
  
  return {
    x: centerX + textRadius * Math.cos(rad),
    y: centerY + textRadius * Math.sin(rad),
    rotation: midAngle,
  };
}

export function LuckyWheel({ players, onComplete }: LuckyWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [remainingPlayers, setRemainingPlayers] = useState<Player[]>(players);
  const [orderedResults, setOrderedResults] = useState<Player[]>([]);

  const segmentAngle = 360 / remainingPlayers.length;
  const wheelSize = 220;
  const center = wheelSize / 2;
  const radius = wheelSize / 2 - 10;

  const spinWheel = () => {
    if (isSpinning || remainingPlayers.length === 0) return;

    setIsSpinning(true);
    setShowResult(false);

    // Random number of full rotations (4-6) plus random final position
    const fullRotations = 4 + Math.random() * 2;
    const randomAngle = Math.random() * 360;
    const targetRotation = rotation + (fullRotations * 360) + randomAngle;

    setRotation(targetRotation);

    // Wait for spin to complete
    setTimeout(() => {
      setIsSpinning(false);
      
      // Calculate which segment the pointer landed on
      // The pointer is at the top (0 degrees), so we need to find which segment is there
      const normalizedRotation = ((targetRotation % 360) + 360) % 360;
      // Since the wheel rotates clockwise, the segment at top is the one where
      // 360 - normalizedRotation falls into
      const pointerAngle = (360 - normalizedRotation + 360) % 360;
      const winnerIndex = Math.floor(pointerAngle / segmentAngle) % remainingPlayers.length;
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
      }, 2000);
    }, 3500);
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
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[24px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
        </div>

        {/* SVG Wheel */}
        <svg
          width={wheelSize}
          height={wheelSize}
          className="drop-shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3.5s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
          }}
        >
          {/* Outer ring */}
          <circle
            cx={center}
            cy={center}
            r={radius + 5}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
          />
          
          {/* Segments */}
          {remainingPlayers.map((player, index) => {
            const startAngle = index * segmentAngle;
            const endAngle = (index + 1) * segmentAngle;
            const path = createArcPath(center, center, radius, startAngle, endAngle);
            const textPos = getTextPosition(center, center, radius, startAngle, endAngle);
            const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
            
            return (
              <g key={player.playerId}>
                {/* Segment */}
                <path
                  d={path}
                  fill={color}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />
                {/* Segment border line */}
                <line
                  x1={center}
                  y1={center}
                  x2={center + radius * Math.cos((startAngle - 90) * Math.PI / 180)}
                  y2={center + radius * Math.sin((startAngle - 90) * Math.PI / 180)}
                  stroke="hsl(var(--background))"
                  strokeWidth="2"
                />
                {/* Player name */}
                <text
                  x={textPos.x}
                  y={textPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-bold fill-primary-foreground"
                  style={{
                    transform: `rotate(${textPos.rotation}deg)`,
                    transformOrigin: `${textPos.x}px ${textPos.y}px`,
                  }}
                >
                  {player.name}
                </text>
              </g>
            );
          })}
          
          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r={25}
            fill="hsl(var(--background))"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
          />
          <circle
            cx={center}
            cy={center}
            r={18}
            fill="hsl(var(--primary))"
          />
        </svg>
      </div>

      {/* Result announcement */}
      {showResult && winner && (
        <div className="animate-scale-in text-center space-y-1">
          <p className="text-xl font-bold text-primary">🎉 {winner.name}!</p>
          <p className="text-sm text-muted-foreground">
            bekommt Platz {orderedResults.length}
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

      {/* Remaining players info */}
      {remainingPlayers.length < players.length && remainingPlayers.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Noch im Rennen: {remainingPlayers.map(p => p.name).join(', ')}
        </p>
      )}
    </div>
  );
}

// Demo component to show wheel with different player counts
export function LuckyWheelDemo() {
  const twoPlayers = [
    { playerId: '1', name: 'Mötzi', wins: 2 },
    { playerId: '2', name: 'Poli', wins: 2 },
  ];
  
  const threePlayers = [
    { playerId: '1', name: 'Mötzi', wins: 2 },
    { playerId: '2', name: 'Poli', wins: 2 },
    { playerId: '3', name: 'Husi', wins: 2 },
  ];
  
  const fourPlayers = [
    { playerId: '1', name: 'Mötzi', wins: 2 },
    { playerId: '2', name: 'Poli', wins: 2 },
    { playerId: '3', name: 'Husi', wins: 2 },
    { playerId: '4', name: 'Rötschi', wins: 2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      <div className="text-center space-y-4">
        <h3 className="font-bold text-lg">2 Spieler</h3>
        <LuckyWheel players={twoPlayers} onComplete={() => {}} />
      </div>
      <div className="text-center space-y-4">
        <h3 className="font-bold text-lg">3 Spieler</h3>
        <LuckyWheel players={threePlayers} onComplete={() => {}} />
      </div>
      <div className="text-center space-y-4">
        <h3 className="font-bold text-lg">4 Spieler</h3>
        <LuckyWheel players={fourPlayers} onComplete={() => {}} />
      </div>
    </div>
  );
}
