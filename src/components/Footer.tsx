import { Shield } from 'lucide-react';

/** Standard site footer (no legal links — internal app). */
export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-2 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left lg:px-8">
        <div className="flex flex-col items-center gap-1 sm:items-start">
          <span className="text-sm font-semibold text-foreground">Beize Jass Tour</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3 w-3 shrink-0" aria-hidden="true" />
            Swiss-made
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Beize Jass Tour by Predivo GmbH. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
