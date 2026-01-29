import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Player {
  playerId: string;
  name: string;
  wins: number;
}

const WHEEL_COLORS = [
  'hsl(0, 84%, 60%)',      // Red
  'hsl(45, 93%, 47%)',     // Orange/Yellow
  'hsl(142, 76%, 36%)',    // Green
  'hsl(217, 91%, 60%)',    // Blue
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

function DemoWheel({ players, title }: { players: Player[]; title: string }) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const segmentAngle = 360 / players.length;
  const wheelSize = 200;
  const center = wheelSize / 2;
  const radius = wheelSize / 2 - 10;

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    const newRotation = rotation + 1440 + Math.random() * 360;
    setRotation(newRotation);
    setTimeout(() => setIsSpinning(false), 3500);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        {/* Wheel container */}
        <div className="relative">
          {/* Pointer */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
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
            {players.map((player, index) => {
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
                    stroke="white"
                    strokeWidth="2"
                  />
                  {/* Player name */}
                  <text
                    x={textPos.x}
                    y={textPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold"
                    fill="white"
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
              r={20}
              fill="white"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
            />
            <circle
              cx={center}
              cy={center}
              r={14}
              fill="hsl(var(--primary))"
            />
          </svg>
        </div>

        {/* Spin button */}
        <Button
          onClick={spin}
          disabled={isSpinning}
          className={cn("gap-2", isSpinning && "animate-pulse")}
        >
          <Sparkles className={cn("h-4 w-4", isSpinning && "animate-spin")} />
          {isSpinning ? 'Dreht...' : 'Drehen!'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function WheelDemo() {
  const twoPlayers: Player[] = [
    { playerId: '1', name: 'Mötzi', wins: 2 },
    { playerId: '2', name: 'Poli', wins: 2 },
  ];
  
  const threePlayers: Player[] = [
    { playerId: '1', name: 'Mötzi', wins: 2 },
    { playerId: '2', name: 'Poli', wins: 2 },
    { playerId: '3', name: 'Husi', wins: 2 },
  ];
  
  const fourPlayers: Player[] = [
    { playerId: '1', name: 'Mötzi', wins: 2 },
    { playerId: '2', name: 'Poli', wins: 2 },
    { playerId: '3', name: 'Husi', wins: 2 },
    { playerId: '4', name: 'Rötschi', wins: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Glücksrad Demo</h1>
        <p className="text-muted-foreground">Darstellung für 2, 3 und 4 Spieler</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DemoWheel players={twoPlayers} title="2 Spieler" />
        <DemoWheel players={threePlayers} title="3 Spieler" />
        <DemoWheel players={fourPlayers} title="4 Spieler" />
      </div>
    </div>
  );
}
