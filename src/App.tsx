import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Loader2 } from "lucide-react";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import { PasswordGate } from "./components/shared/PasswordGate";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Session = lazy(() => import("./pages/Session"));
const History = lazy(() => import("./pages/History"));
const Summary = lazy(() => import("./pages/Summary"));
const Rangliste = lazy(() => import("./pages/Rangliste"));
const Statuten = lazy(() => import("./pages/Statuten"));
const Kasse = lazy(() => import("./pages/Kasse"));
const SessionLobby = lazy(() => import("./pages/SessionLobby"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <span className="sr-only">Seite wird geladen…</span>
    </div>
  );
}

const App = () => (
  <PasswordGate>
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/session" element={<Session />} />
                <Route path="/history" element={<History />} />
                <Route path="/summary" element={<Summary />} />
                <Route path="/summary/:id" element={<Summary />} />
                <Route path="/rangliste" element={<Rangliste />} />
                <Route path="/kasse" element={<Kasse />} />
                <Route path="/statuten" element={<Statuten />} />
                <Route path="/lobby" element={<SessionLobby />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  </PasswordGate>
);

export default App;
