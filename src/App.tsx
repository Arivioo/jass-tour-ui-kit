import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Session from "./pages/Session";
import History from "./pages/History";
import Summary from "./pages/Summary";
import Rangliste from "./pages/Rangliste";
import Statuten from "./pages/Statuten";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WheelDemo from "./pages/WheelDemo";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
              <Route path="/statuten" element={<Statuten />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/wheel-demo" element={<WheelDemo />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
