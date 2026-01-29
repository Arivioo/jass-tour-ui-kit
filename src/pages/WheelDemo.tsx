import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LuckyWheel } from '@/components/LuckyWheel';

interface Player {
  playerId: string;
  name: string;
  wins: number;
  rank: number;
}

interface TieGroup {
  wins: number;
  startRank: number;
  players: Player[];
}

// Demo scenarios
const SCENARIO_2_PLAYERS: { tieGroups: TieGroup[]; allPlayers: Player[] } = {
  tieGroups: [
    { wins: 2, startRank: 1, players: [
      { playerId: '1', name: 'Mötzi', wins: 2, rank: 1 },
      { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
    ]},
  ],
  allPlayers: [
    { playerId: '1', name: 'Mötzi', wins: 2, rank: 1 },
    { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
    { playerId: '3', name: 'Husi', wins: 1, rank: 3 },
    { playerId: '4', name: 'Rötschi', wins: 0, rank: 4 },
  ],
};

const SCENARIO_3_PLAYERS: { tieGroups: TieGroup[]; allPlayers: Player[] } = {
  tieGroups: [
    { wins: 2, startRank: 1, players: [
      { playerId: '1', name: 'Mötzi', wins: 2, rank: 1 },
      { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
      { playerId: '3', name: 'Husi', wins: 2, rank: 3 },
    ]},
  ],
  allPlayers: [
    { playerId: '1', name: 'Mötzi', wins: 2, rank: 1 },
    { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
    { playerId: '3', name: 'Husi', wins: 2, rank: 3 },
    { playerId: '4', name: 'Rötschi', wins: 0, rank: 4 },
  ],
};

const SCENARIO_4_PLAYERS: { tieGroups: TieGroup[]; allPlayers: Player[] } = {
  tieGroups: [
    { wins: 2, startRank: 1, players: [
      { playerId: '1', name: 'Mötzi', wins: 2, rank: 1 },
      { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
      { playerId: '3', name: 'Husi', wins: 2, rank: 3 },
      { playerId: '4', name: 'Rötschi', wins: 2, rank: 4 },
    ]},
  ],
  allPlayers: [
    { playerId: '1', name: 'Mötzi', wins: 2, rank: 1 },
    { playerId: '2', name: 'Poli', wins: 2, rank: 2 },
    { playerId: '3', name: 'Husi', wins: 2, rank: 3 },
    { playerId: '4', name: 'Rötschi', wins: 2, rank: 4 },
  ],
};

const SCENARIO_2_GROUPS: { tieGroups: TieGroup[]; allPlayers: Player[] } = {
  tieGroups: [
    { wins: 3, startRank: 1, players: [
      { playerId: '1', name: 'Mötzi', wins: 3, rank: 1 },
      { playerId: '2', name: 'Poli', wins: 3, rank: 2 },
    ]},
    { wins: 1, startRank: 3, players: [
      { playerId: '3', name: 'Husi', wins: 1, rank: 3 },
      { playerId: '4', name: 'Rötschi', wins: 1, rank: 4 },
    ]},
  ],
  allPlayers: [
    { playerId: '1', name: 'Mötzi', wins: 3, rank: 1 },
    { playerId: '2', name: 'Poli', wins: 3, rank: 2 },
    { playerId: '3', name: 'Husi', wins: 1, rank: 3 },
    { playerId: '4', name: 'Rötschi', wins: 1, rank: 4 },
  ],
};

type ScenarioKey = '2players' | '3players' | '4players' | '2groups';

export default function WheelDemo() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('2players');
  const [results, setResults] = useState<Player[] | null>(null);
  const [key, setKey] = useState(0); // For resetting wheel

  const scenarios: Record<ScenarioKey, { label: string; description: string; data: typeof SCENARIO_2_PLAYERS }> = {
    '2players': { 
      label: '2 Spieler', 
      description: 'Mötzi & Poli haben 2 Siege',
      data: SCENARIO_2_PLAYERS 
    },
    '3players': { 
      label: '3 Spieler', 
      description: 'Mötzi, Poli & Husi haben 2 Siege',
      data: SCENARIO_3_PLAYERS 
    },
    '4players': { 
      label: '4 Spieler', 
      description: 'Alle haben 2 Siege',
      data: SCENARIO_4_PLAYERS 
    },
    '2groups': { 
      label: '2 Gruppen', 
      description: 'Mötzi & Poli (3 Siege) + Husi & Rötschi (1 Sieg)',
      data: SCENARIO_2_GROUPS 
    },
  };

  const currentScenario = scenarios[activeScenario];

  const handleComplete = (finalRankings: Player[]) => {
    setResults(finalRankings);
  };

  const resetScenario = () => {
    setResults(null);
    setKey(k => k + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Glücksrad Demo</h1>
          <p className="text-muted-foreground">Teste verschiedene Gleichstand-Szenarien</p>
        </div>
      </div>

      {/* Scenario Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Szenario wählen</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.entries(scenarios) as [ScenarioKey, typeof scenarios[ScenarioKey]][]).map(([key, scenario]) => (
            <Button
              key={key}
              variant={activeScenario === key ? 'default' : 'outline'}
              className="h-auto flex-col py-3"
              onClick={() => {
                setActiveScenario(key);
                setResults(null);
                setKey(k => k + 1);
              }}
            >
              <span className="font-semibold">{scenario.label}</span>
              <span className="text-xs opacity-75 whitespace-normal">{scenario.description}</span>
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Wheel or Results */}
      <Card className="border-2 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              {currentScenario.label}
            </CardTitle>
            {results && (
              <Button variant="outline" size="sm" onClick={resetScenario} className="gap-1">
                <RotateCcw className="h-4 w-4" />
                Nochmal
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{currentScenario.description}</p>
        </CardHeader>
        <CardContent>
          {results ? (
            <div className="space-y-4 py-4">
              <div className="text-center text-lg font-semibold text-primary">
                🎉 Fertig! Finale Rangliste:
              </div>
              <div className="space-y-2">
                {results.map((player) => (
                  <div
                    key={player.playerId}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3",
                      player.rank === 1 && "bg-yellow-50 border-yellow-300",
                      player.rank === 2 && "bg-gray-50 border-gray-300",
                      player.rank === 3 && "bg-orange-50 border-orange-300"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full font-bold",
                      player.rank === 1 && "bg-yellow-200 text-yellow-800",
                      player.rank === 2 && "bg-gray-200 text-gray-700",
                      player.rank === 3 && "bg-orange-200 text-orange-800",
                      player.rank === 4 && "bg-muted text-muted-foreground"
                    )}>
                      {player.rank}
                    </div>
                    <span className="font-medium">{player.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {player.wins} {player.wins === 1 ? 'Sieg' : 'Siege'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <LuckyWheel
              key={key}
              tieGroups={currentScenario.data.tieGroups}
              allPlayers={currentScenario.data.allPlayers}
              onComplete={handleComplete}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
