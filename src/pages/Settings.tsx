import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Users, Calendar, Palette, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { PLAYERS } from '@/lib/players';

export default function Settings() {
  const [players, setPlayers] = useState(PLAYERS);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer = {
      id: Date.now().toString(),
      name: newPlayerName.trim(),
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    setPlayers(players.map(p => 
      p.id === editingId ? { ...p, name: editName.trim() } : p
    ));
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalte Spieler und Termine</p>
      </div>

      {/* Players */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Spieler verwalten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Player List */}
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {player.name.charAt(0)}
                </div>
                
                {editingId === player.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                  />
                ) : (
                  <span className="flex-1 font-medium">{player.name}</span>
                )}

                <div className="flex gap-1">
                  {editingId === player.id ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      onClick={handleSaveEdit}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      onClick={() => handleStartEdit(player.id, player.name)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePlayer(player.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Player */}
          <div className="flex gap-2">
            <Input
              placeholder="Neuer Spieler"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            />
            <Button 
              variant="outline" 
              className="shrink-0 gap-2"
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim()}
            >
              <Plus className="h-4 w-4" />
              Hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Nächster Termin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Datum</label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Zeit</label>
              <Input type="time" defaultValue="20:00" />
            </div>
          </div>
          <Button className="w-full gap-2">
            <Save className="h-4 w-4" />
            Speichern
          </Button>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Anzeige
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Kompakte Ansicht</div>
              <div className="text-sm text-muted-foreground">
                Weniger Abstände in Listen
              </div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-muted-foreground">
                Dunkles Farbschema
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
