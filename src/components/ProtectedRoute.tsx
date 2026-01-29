import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const hasAccess = sessionStorage.getItem('jass-access') === 'granted';

  if (!hasAccess) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
