import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Calendar, Plus, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import { usePlayers, useUpdatePlayer, useAddPlayer, useDeletePlayer } from '@/hooks/usePlayers';
import { useAppSettings, useUpdateNextDate } from '@/hooks/useAppSettings';
import { useToast } from '@/hooks/use-toast';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function Settings() {
  usePageTitle('Einstellungen');
  const { toast } = useToast();
  const { data: players = [], isLoading: playersLoading } = usePlayers();
  const { data: settings, isLoading: settingsLoading } = useAppSettings();
  const updatePlayer = useUpdatePlayer();
  const addPlayer = useAddPlayer();
  const deletePlayer = useDeletePlayer();
  const updateNextDate = useUpdateNextDate();

  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextTime, setNextTime] = useState('20:00');

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    if (name.length > 30) {
      toast({ variant: 'destructive', title: 'Name zu lang (max. 30 Zeichen)' });
      return;
    }
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      toast({ variant: 'destructive', title: 'Spieler existiert bereits' });
      return;
    }
    addPlayer.mutate(name, {
      onSuccess: () => {
        toast({ title: 'Spieler hinzugefügt!' });
        setNewPlayerName('');
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Fehler beim Hinzufügen' });
      },
    });
  };

  const handleRemovePlayer = (id: string) => {
    deletePlayer.mutate(id, {
      onSuccess: () => {
        toast({ title: 'Spieler entfernt' });
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Fehler beim Entfernen' });
      },
    });
  };

  const handleStartEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const handleSaveEdit = () => {
    const name = editName.trim();
    if (!editingId || !name) return;
    if (name.length > 30) {
      toast({ variant: 'destructive', title: 'Name zu lang (max. 30 Zeichen)' });
      return;
    }
    if (players.some(p => p.id !== editingId && p.name.toLowerCase() === name.toLowerCase())) {
      toast({ variant: 'destructive', title: 'Spieler existiert bereits' });
      return;
    }
    updatePlayer.mutate({ id: editingId, name }, {
      onSuccess: () => {
        toast({ title: 'Spieler aktualisiert!' });
        setEditingId(null);
        setEditName('');
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Fehler beim Speichern' });
      },
    });
  };

  const handleSaveDate = () => {
    if (!nextDate) return;
    
    const [hours, minutes] = nextTime.split(':').map(Number);
    const dateTime = new Date(nextDate);
    dateTime.setHours(hours, minutes, 0, 0);
    
    updateNextDate.mutate(dateTime, {
      onSuccess: () => {
        toast({ title: 'Termin gespeichert!' });
      },
      onError: () => {
        toast({ variant: 'destructive', title: 'Fehler beim Speichern' });
      },
    });
  };

  if (playersLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Daten werden geladen…</span>
      </div>
    );
  }

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
            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
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
                    aria-label="Spielername bearbeiten"
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
                      className="text-primary"
                      onClick={handleSaveEdit}
                      disabled={updatePlayer.isPending}
                      aria-label="Speichern"
                    >
                      {updatePlayer.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      ) : (
                        <Save className="h-4 w-4" aria-hidden="true" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                      onClick={() => handleStartEdit(player.id, player.name)}
                      aria-label={`${player.name} bearbeiten`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemovePlayer(player.id)}
                    disabled={deletePlayer.isPending}
                    aria-label={`${player.name} entfernen`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
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
              aria-label="Name des neuen Spielers"
            />
            <Button
              variant="outline"
              className="shrink-0 gap-2"
              onClick={handleAddPlayer}
              disabled={!newPlayerName.trim() || addPlayer.isPending}
            >
              {addPlayer.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Hinzufügen</span>
              <span className="sr-only sm:hidden">Hinzufügen</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Next Date */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" aria-hidden="true" />
            Nächster Termin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {settings?.next_date && (
            <div className="text-sm text-muted-foreground mb-2">
              Aktuell: {new Date(settings.next_date).toLocaleDateString('de-CH', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="settings-date" className="text-sm font-medium">Datum</label>
              <Input
                id="settings-date"
                type="date"
                value={nextDate}
                onChange={(e) => setNextDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="settings-time" className="text-sm font-medium">Zeit</label>
              <Input
                id="settings-time"
                type="time"
                value={nextTime}
                onChange={(e) => setNextTime(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="w-full gap-2" 
            onClick={handleSaveDate}
            disabled={!nextDate || updateNextDate.isPending}
          >
            {updateNextDate.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            Speichern
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
