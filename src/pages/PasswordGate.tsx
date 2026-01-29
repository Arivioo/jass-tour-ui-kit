import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

const CORRECT_PASSWORD = '6403';

export default function PasswordGate() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      navigate('/dashboard');
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card 
        className={`w-full max-w-sm shadow-lg transition-transform ${isShaking ? 'animate-shake' : ''}`}
      >
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Beize Jass Tour</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Passwort eingeben"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`h-12 text-center text-lg ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                autoFocus
              />
              {error && (
                <p className="text-center text-sm text-destructive">
                  Falsches Passwort. Bitte erneut versuchen.
                </p>
              )}
            </div>
            <Button type="submit" className="h-12 w-full text-base font-semibold">
              Weiter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
