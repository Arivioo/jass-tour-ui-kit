import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Spade, Lock } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-jass-password', {
        body: { password },
      });

      if (fnError || !data?.valid) {
        setError(true);
        setPassword('');
      } else {
        sessionStorage.setItem('jass-access', 'granted');
        navigate('/');
      }
    } catch {
      setError(true);
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Spade className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Beize Jass Tour</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gib das Passwort ein, um fortzufahren
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`pl-10 ${error ? 'border-destructive' : ''}`}
                autoFocus
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">
                Falsches Passwort
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Prüfe...' : 'Eintreten'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
