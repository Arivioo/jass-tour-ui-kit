import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Spade, Lock } from 'lucide-react';

const CORRECT_PASSWORD = '6403';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      // Store access in sessionStorage
      sessionStorage.setItem('jass-access', 'granted');
      toast({
        title: 'Willkommen!',
        description: 'Zugang gewährt.',
      });
      navigate('/');
    } else {
      setError(true);
      setPassword('');
      toast({
        variant: 'destructive',
        title: 'Falsches Passwort',
        description: 'Bitte versuche es erneut.',
      });
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
          <CardDescription>
            Gib das Passwort ein, um fortzufahren
          </CardDescription>
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
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">
                Falsches Passwort
              </p>
            )}
            <Button type="submit" className="w-full">
              Eintreten
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
