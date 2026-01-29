import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Spade } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
});

const signupSchema = z.object({
  username: z.string().min(2, 'Benutzername muss mindestens 2 Zeichen haben'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(6, 'Passwort muss mindestens 6 Zeichen haben'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const signupForm = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    
    if (error) {
      let message = 'Anmeldung fehlgeschlagen';
      if (error.message.includes('Invalid login credentials')) {
        message = 'E-Mail oder Passwort ist falsch';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Bitte bestätige zuerst deine E-Mail-Adresse';
      }
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: message,
      });
    } else {
      toast({
        title: 'Willkommen zurück!',
        description: 'Du wurdest erfolgreich angemeldet.',
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true);
    const { error } = await signUp(data.email, data.password, data.username);
    
    if (error) {
      let message = 'Registrierung fehlgeschlagen';
      if (error.message.includes('User already registered')) {
        message = 'Diese E-Mail-Adresse ist bereits registriert';
      } else if (error.message.includes('Password')) {
        message = 'Das Passwort erfüllt nicht die Anforderungen';
      }
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: message,
      });
    } else {
      toast({
        title: 'Willkommen!',
        description: 'Dein Konto wurde erstellt. Du kannst dich jetzt anmelden.',
      });
      navigate('/');
    }
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Spade className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Jass Tracker</CardTitle>
          <CardDescription>
            Melde dich an oder erstelle ein Konto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="signup">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4 pt-4">
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">E-Mail</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="deine@email.ch"
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Passwort</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Anmelden
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4 pt-4">
              <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Benutzername</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="Dein Name"
                    {...signupForm.register('username')}
                  />
                  {signupForm.formState.errors.username && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">E-Mail</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="deine@email.ch"
                    {...signupForm.register('email')}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Passwort</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register('password')}
                  />
                  {signupForm.formState.errors.password && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Passwort bestätigen</Label>
                  <Input
                    id="signup-confirm"
                    type="password"
                    placeholder="••••••••"
                    {...signupForm.register('confirmPassword')}
                  />
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Registrieren
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
