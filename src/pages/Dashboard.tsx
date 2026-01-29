import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Play, History, FileText, Trophy, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function Dashboard() {
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  
  // Placeholder date - next Friday at 20:00
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + ((5 - nextDate.getDay() + 7) % 7 || 7));
  nextDate.setHours(20, 0, 0, 0);

  const countdown = getCountdown(nextDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Willkommen</h1>
        <p className="text-muted-foreground">Bereit für den nächsten Jass-Abend?</p>
      </div>

      {/* Next Date Card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary/5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              Nächster Termin
            </CardTitle>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground">
                  <Edit className="h-4 w-4" />
                  Bearbeiten
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Termin bearbeiten</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Datum</label>
                    <Input type="date" defaultValue={nextDate.toISOString().split('T')[0]} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Zeit</label>
                    <Input type="time" defaultValue="20:00" />
                  </div>
                  <Button className="w-full" onClick={() => setEditOpen(false)}>
                    Speichern
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4 flex items-center gap-2 text-lg font-medium">
            <Clock className="h-5 w-5 text-muted-foreground" />
            {nextDate.toLocaleDateString('de-CH', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            })} um 20:00
          </div>
          
          {/* Countdown */}
          <div className="grid grid-cols-3 gap-3">
            <CountdownUnit value={countdown.days} label="Tage" />
            <CountdownUnit value={countdown.hours} label="Stunden" />
            <CountdownUnit value={countdown.minutes} label="Minuten" />
          </div>
        </CardContent>
      </Card>

      {/* Primary Actions */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Button 
          size="lg" 
          className="h-14 gap-2 text-base font-semibold shadow-md"
          onClick={() => navigate('/session')}
        >
          <Play className="h-5 w-5" />
          Neue Session starten
        </Button>
        <Button 
          size="lg" 
          variant="outline" 
          className="h-14 gap-2 text-base font-semibold"
          onClick={() => navigate('/history')}
        >
          <History className="h-5 w-5" />
          Vergangene Abende
        </Button>
      </div>

      {/* Quick Access */}
      <div className="grid gap-3 sm:grid-cols-2">
        <QuickAccessCard 
          icon={FileText} 
          title="Statuten" 
          description="Regeln & Bussen"
          onClick={() => navigate('/statuten')}
        />
        <QuickAccessCard 
          icon={Trophy} 
          title="Ewige Rangliste" 
          description="Alle Zeiten"
          onClick={() => navigate('/rangliste')}
        />
      </div>

      {/* Wheel Demo Link - temporary */}
      <Button 
        variant="outline" 
        className="w-full gap-2"
        onClick={() => navigate('/wheel-demo')}
      >
        🎡 Glücksrad Demo ansehen
      </Button>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg bg-muted p-3 text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function QuickAccessCard({ 
  icon: Icon, 
  title, 
  description,
  onClick 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  onClick: () => void;
}) {
  return (
    <Card 
      className="cursor-pointer transition-shadow hover:shadow-md" 
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function getCountdown(targetDate: Date) {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}
