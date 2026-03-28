import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, ChevronRight, Inbox, MapPin, Users, Medal, Loader2, Gift, FileDown } from 'lucide-react';
import { formatCHF } from '@/lib/players';
import { JASS } from '@/lib/constants';
import { useSessionsWithRankings } from '@/hooks/useSessions';
import { exportSessionsCsv } from '@/lib/exportCsv';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function History() {
  usePageTitle('Verlauf');
  const navigate = useNavigate();
  const { data: sessions, isLoading, error } = useSessionsWithRankings();

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive" role="alert">
        Daten konnten nicht geladen werden. Bitte versuche es erneut.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Daten werden geladen…</span>
      </div>
    );
  }

  const sessionList = sessions || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Vergangene Abende</h1>
          <p className="text-muted-foreground">Alle bisherigen Jass-Sessions</p>
        </div>
        {sessionList.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportSessionsCsv(sessionList.map(s => ({
              date: s.date,
              location: s.location,
              winner: s.players[0]?.name || '',
              totalPot: s.total_pot,
              players: s.players,
            })))}
          >
            <FileDown className="h-4 w-4" aria-hidden="true" />
            CSV
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      {sessionList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard 
            label="Sessions" 
            value={sessionList.length.toString()} 
            icon={Calendar}
          />
          <StatCard 
            label="Total Pot" 
            value={formatCHF(sessionList.reduce((sum, s) => sum + s.total_pot, 0))} 
            icon={Trophy}
          />
          <StatCard 
            label="Matches" 
            value={(sessionList.length * JASS.MATCHES_PER_SESSION).toString()}
            icon={Medal}
          />
          <StatCard 
            label="Locations" 
            value={new Set(sessionList.map(s => s.location)).size.toString()} 
            icon={MapPin}
          />
        </div>
      )}

      {/* Session List */}
      {sessionList.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {sessionList.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/summary/${session.id}`, { 
                state: { 
                  fromHistory: true,
                  historySession: session 
                } 
              })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon: Icon 
}: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface SessionWithRankings {
  id: string;
  date: string;
  location: string;
  total_pot: number;
  losliPlayerName?: string | null;
  players: {
    name: string;
    rank: number;
    wins: number;
    totalFines: number;
  }[];
  matchCount: number;
}

function SessionCard({ 
  session, 
  onClick 
}: { 
  session: SessionWithRankings;
  onClick: () => void;
}) {
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const winner = session.players[0];
  const tiedForFirst = session.players.filter(p => p.wins === winner?.wins).length > 1;

  return (
    <Card 
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {formattedDate}
            </div>
            
            {/* Winner & Location */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {winner && (
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
                  <span className="font-semibold">
                    {winner.name}
                    {tiedForFirst && (
                      <span className="text-xs text-muted-foreground ml-1">(Gleichstand aufgelöst)</span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {session.location}
              </div>
            </div>

            {/* Players & Stats */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                {session.players.map(p => p.name).join(', ')}
              </span>
              <span className="hidden sm:inline">•</span>
              <span>{session.matchCount} Matches</span>
              <span className="hidden sm:inline">•</span>
              <span>Pot: {formatCHF(session.total_pot)}</span>
              {session.losliPlayerName && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Gift className="h-3.5 w-3.5" aria-hidden="true" />
                    {session.losliPlayerName}
                  </span>
                </>
              )}
            </div>

            {/* Rankings */}
            {session.players.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {session.players.map((player, idx) => (
                  <div 
                    key={player.name}
                    className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${
                      idx === 0
                        ? 'bg-rank-gold text-rank-gold-foreground'
                        : idx === 1
                        ? 'bg-rank-silver text-rank-silver-foreground'
                        : idx === 2
                        ? 'bg-rank-bronze text-rank-bronze-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <span className="font-bold">{player.rank}.</span>
                    <span>{player.name}</span>
                    <span className="opacity-60">({player.wins}S)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="shrink-0" aria-label="Session Details anzeigen">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
        </div>
        <h2 className="mb-1 text-lg font-semibold">Noch keine Sessions</h2>
        <p className="text-sm text-muted-foreground">
          Starte deine erste Jass-Session, um hier Daten zu sehen.
        </p>
      </CardContent>
    </Card>
  );
}
