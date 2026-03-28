import { usePageTitle } from '@/hooks/usePageTitle';

export default function NotFound() {
  usePageTitle('Nicht gefunden');
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Seite nicht gefunden</p>
        <a href="/" className="inline-flex min-h-[44px] items-center text-primary underline hover:text-primary/90">
          Zurück zur Startseite
        </a>
      </div>
    </div>
  );
}
