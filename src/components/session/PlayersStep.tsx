import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Users, ChevronRight } from 'lucide-react';
import type { Player } from '@/hooks/usePlayers';

interface PlayersStepProps {
  players: Player[];
  active: string[];
  onToggle: (id: string) => void;
  onNext: () => void;
}

export function PlayersStep({ players, active, onToggle, onNext }: PlayersStepProps) {
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
