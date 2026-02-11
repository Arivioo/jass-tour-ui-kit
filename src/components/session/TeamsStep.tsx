import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import { LOCATIONS } from '@/lib/players';
import type { Player } from '@/hooks/usePlayers';

interface TeamsStepProps {
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
}

export function TeamsStep({
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
}: TeamsStepProps) {
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
