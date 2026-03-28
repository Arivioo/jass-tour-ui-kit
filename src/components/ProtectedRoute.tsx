import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check shared password gate first (fast)
    if (sessionStorage.getItem('jass-access') === 'granted') {
      setHasAccess(true);
      setChecking(false);
      return;
    }

    // Fall back to Supabase Auth
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        sessionStorage.setItem('jass-access', 'granted');
        setHasAccess(true);
      }
      setChecking(false);
    });
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Zugriff wird geprüft…</span>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
