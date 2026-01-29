import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Trophy, ChevronRight, Inbox, MapPin, Users, Medal, Filter, RotateCcw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCHF } from '@/lib/players';

interface SessionData {
  id: string;
  date: string;
  location: string;
  players: {
    name: string;
    rank: number;
    wins: number;
    totalFines: number;
  }[];
  totalPot: number;
  matchCount: number;
}

// Comprehensive test data covering all variants
const TEST_SESSIONS: SessionData[] = [
  // Variant 1: Clear winner (all different wins)
  {
    id: '1',
    date: '2024-01-26',
    location: 'Rechte Winkel',
    players: [
      { name: 'Mötzi', rank: 1, wins: 3, totalFines: 45 },
      { name: 'Poli', rank: 2, wins: 2, totalFines: 55 },
      { name: 'Husi', rank: 3, wins: 1, totalFines: 60 },
      { name: 'Rötschi', rank: 4, wins: 0, totalFines: 70 },
    ],
    totalPot: 230,
    matchCount: 3,
  },
  // Variant 2: Two players tied for 1st
  {
    id: '2',
    date: '2024-01-19',
    location: 'Hürtel',
    players: [
      { name: 'Poli', rank: 1, wins: 2, totalFines: 40 },
      { name: 'Mötzi', rank: 2, wins: 2, totalFines: 50 },
      { name: 'Rötschi', rank: 3, wins: 1, totalFines: 55 },
      { name: 'Husi', rank: 4, wins: 1, totalFines: 65 },
    ],
    totalPot: 210,
    matchCount: 3,
  },
  // Variant 3: Three players tied
  {
    id: '3',
    date: '2024-01-12',
    location: 'Engel',
    players: [
      { name: 'Husi', rank: 1, wins: 2, totalFines: 35 },
      { name: 'Mötzi', rank: 2, wins: 2, totalFines: 45 },
      { name: 'Poli', rank: 3, wins: 2, totalFines: 55 },
      { name: 'Rötschi', rank: 4, wins: 0, totalFines: 75 },
    ],
    totalPot: 210,
    matchCount: 3,
  },
  // Variant 4: All four players tied
  {
    id: '4',
    date: '2024-01-05',
    location: 'Rössli',
    players: [
      { name: 'Rötschi', rank: 1, wins: 1, totalFines: 30 },
      { name: 'Poli', rank: 2, wins: 1, totalFines: 40 },
      { name: 'Mötzi', rank: 3, wins: 1, totalFines: 50 },
      { name: 'Husi', rank: 4, wins: 1, totalFines: 60 },
    ],
    totalPot: 180,
    matchCount: 4,
  },
  // Variant 5: Two separate tie groups (2+2)
  {
    id: '5',
    date: '2023-12-29',
    location: 'Pöp',
    players: [
      { name: 'Mötzi', rank: 1, wins: 3, totalFines: 25 },
      { name: 'Husi', rank: 2, wins: 3, totalFines: 35 },
      { name: 'Poli', rank: 3, wins: 1, totalFines: 65 },
      { name: 'Rötschi', rank: 4, wins: 1, totalFines: 75 },
    ],
    totalPot: 200,
    matchCount: 4,
  },
  // Variant 6: High fines session
  {
    id: '6',
    date: '2023-12-22',
    location: 'Rechte Winkel',
    players: [
      { name: 'Poli', rank: 1, wins: 3, totalFines: 85 },
      { name: 'Mötzi', rank: 2, wins: 2, totalFines: 95 },
      { name: 'Rötschi', rank: 3, wins: 1, totalFines: 105 },
      { name: 'Husi', rank: 4, wins: 0, totalFines: 115 },
    ],
    totalPot: 400,
    matchCount: 3,
  },
  // Variant 7: Low fines session (clean game)
  {
    id: '7',
    date: '2023-12-15',
    location: 'Hürtel',
    players: [
      { name: 'Husi', rank: 1, wins: 2, totalFines: 25 },
      { name: 'Rötschi', rank: 2, wins: 2, totalFines: 35 },
      { name: 'Poli', rank: 3, wins: 1, totalFines: 40 },
      { name: 'Mötzi', rank: 4, wins: 1, totalFines: 45 },
    ],
    totalPot: 145,
    matchCount: 3,
  },
  // Variant 8: Many matches (5 matches)
  {
    id: '8',
    date: '2023-12-08',
    location: 'Engel',
    players: [
      { name: 'Mötzi', rank: 1, wins: 4, totalFines: 55 },
      { name: 'Poli', rank: 2, wins: 3, totalFines: 65 },
      { name: 'Husi', rank: 3, wins: 2, totalFines: 70 },
      { name: 'Rötschi', rank: 4, wins: 1, totalFines: 80 },
    ],
    totalPot: 270,
    matchCount: 5,
  },
  // Variant 9: Manual location
  {
    id: '9',
    date: '2023-12-01',
    location: 'Bei Mötzi zu Hause',
    players: [
      { name: 'Rötschi', rank: 1, wins: 3, totalFines: 40 },
      { name: 'Husi', rank: 2, wins: 2, totalFines: 50 },
      { name: 'Mötzi', rank: 3, wins: 1, totalFines: 55 },
      { name: 'Poli', rank: 4, wins: 0, totalFines: 65 },
    ],
    totalPot: 210,
    matchCount: 3,
  },
  // Variant 10: Oldest session (different year)
  {
    id: '10',
    date: '2023-06-16',
    location: 'Rössli',
    players: [
      { name: 'Poli', rank: 1, wins: 2, totalFines: 50 },
      { name: 'Mötzi', rank: 2, wins: 2, totalFines: 55 },
      { name: 'Husi', rank: 3, wins: 1, totalFines: 60 },
      { name: 'Rötschi', rank: 4, wins: 1, totalFines: 70 },
    ],
    totalPot: 235,
    matchCount: 3,
  },
];

type FilterType = 'all' | 'location' | 'winner';

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionData[]>(TEST_SESSIONS);
  const [showEmpty, setShowEmpty] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');

  // Get unique locations and winners for filters
  const locations = [...new Set(TEST_SESSIONS.map(s => s.location))];
  const winners = [...new Set(TEST_SESSIONS.map(s => s.players[0].name))];

  // Apply filters
  const filteredSessions = sessions.filter(session => {
    if (filterType === 'location' && filterValue) {
      return session.location === filterValue;
    }
    if (filterType === 'winner' && filterValue) {
      return session.players[0].name === filterValue;
    }
    return true;
  });

  // Toggle between empty state and data
  const toggleEmpty = () => {
    if (showEmpty) {
      setSessions(TEST_SESSIONS);
    } else {
      setSessions([]);
    }
    setShowEmpty(!showEmpty);
  };

  // Reset filters
  const resetFilters = () => {
    setFilterType('all');
    setFilterValue('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Vergangene Abende</h1>
        <p className="text-muted-foreground">Alle bisherigen Jass-Sessions</p>
      </div>

      {/* Test Controls */}
      <Card className="border-dashed border-primary/50 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-primary">🧪 Test-Kontrollen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={showEmpty ? 'default' : 'outline'} 
              size="sm"
              onClick={toggleEmpty}
            >
              {showEmpty ? 'Daten anzeigen' : 'Leerer Zustand'}
            </Button>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterType} onValueChange={(v: FilterType) => {
              setFilterType(v);
              setFilterValue('');
            }}>
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle anzeigen</SelectItem>
                <SelectItem value="location">Nach Ort</SelectItem>
                <SelectItem value="winner">Nach Sieger</SelectItem>
              </SelectContent>
            </Select>

            {filterType === 'location' && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[160px] h-8">
                  <SelectValue placeholder="Ort wählen" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {filterType === 'winner' && (
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Sieger wählen" />
                </SelectTrigger>
                <SelectContent>
                  {winners.map(w => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(filterType !== 'all' || filterValue) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 gap-1">
                <RotateCcw className="h-3 w-3" />
                Zurücksetzen
              </Button>
            )}
          </div>

          {/* Test case legend */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Enthaltene Testfälle:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 list-disc list-inside">
              <li>Klarer Sieger (alle verschiedene Siege)</li>
              <li>2 Spieler Gleichstand für 1.</li>
              <li>3 Spieler Gleichstand</li>
              <li>Alle 4 Spieler Gleichstand</li>
              <li>2 getrennte Tie-Gruppen (2+2)</li>
              <li>Hohe Bussen (viele Strafen)</li>
              <li>Niedrige Bussen (sauberes Spiel)</li>
              <li>Viele Matches (5 Runden)</li>
              <li>Manuelle Location-Eingabe</li>
              <li>Ältere Session (anderes Jahr)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      {!showEmpty && filteredSessions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard 
            label="Sessions" 
            value={filteredSessions.length.toString()} 
            icon={Calendar}
          />
          <StatCard 
            label="Total Pot" 
            value={formatCHF(filteredSessions.reduce((sum, s) => sum + s.totalPot, 0))} 
            icon={Trophy}
          />
          <StatCard 
            label="Matches" 
            value={filteredSessions.reduce((sum, s) => sum + s.matchCount, 0).toString()} 
            icon={Medal}
          />
          <StatCard 
            label="Locations" 
            value={new Set(filteredSessions.map(s => s.location)).size.toString()} 
            icon={MapPin}
          />
        </div>
      )}

      {/* Session List */}
      {filteredSessions.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
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
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-semibold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionCard({ 
  session, 
  onClick 
}: { 
  session: SessionData;
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
  
  // Check if there was a tie for 1st
  const tiedForFirst = session.players.filter(p => p.wins === winner.wins).length > 1;

  return (
    <Card 
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </div>
            
            {/* Winner & Location */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-semibold">
                  {winner.name}
                  {tiedForFirst && (
                    <span className="text-xs text-muted-foreground ml-1">(Gleichstand aufgelöst)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {session.location}
              </div>
            </div>

            {/* Players & Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {session.players.map(p => p.name).join(', ')}
              </div>
              <span>•</span>
              <span>{session.matchCount} Matches</span>
              <span>•</span>
              <span>Pot: {formatCHF(session.totalPot)}</span>
            </div>

            {/* Rankings */}
            <div className="flex gap-2 pt-1">
              {session.players.map((player, idx) => (
                <div 
                  key={player.name}
                  className={`flex items-center gap-1 text-xs rounded-full px-2 py-0.5 ${
                    idx === 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : idx === 1 
                      ? 'bg-gray-100 text-gray-700'
                      : idx === 2
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className="font-bold">{player.rank}.</span>
                  <span>{player.name}</span>
                  <span className="opacity-60">({player.wins}S)</span>
                </div>
              ))}
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
