import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, ChevronRight, Inbox } from 'lucide-react';

// Placeholder past sessions
const PAST_SESSIONS = [
  { id: '1', date: '2024-01-19', winner: 'Hans', players: ['Hans', 'Peter', 'Urs', 'Beat'] },
  { id: '2', date: '2024-01-12', winner: 'Peter', players: ['Hans', 'Peter', 'Urs', 'Beat'] },
  { id: '3', date: '2024-01-05', winner: 'Urs', players: ['Hans', 'Peter', 'Urs', 'Beat'] },
];

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Vergangene Abende</h1>
        <p className="text-muted-foreground">Alle bisherigen Jass-Sessions</p>
      </div>

      {PAST_SESSIONS.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {PAST_SESSIONS.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/summary/${session.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ 
  session, 
  onClick 
}: { 
  session: typeof PAST_SESSIONS[0];
  onClick: () => void;
}) {
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('de-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Card 
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="font-semibold">Sieger: {session.winner}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {session.players.join(', ')}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            <ChevronRight className="h-5 w-5" />
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
          <Inbox className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-1 text-lg font-semibold">Noch keine Sessions</h3>
        <p className="text-sm text-muted-foreground">
          Starte deine erste Jass-Session, um hier Daten zu sehen.
        </p>
      </CardContent>
    </Card>
  );
}
