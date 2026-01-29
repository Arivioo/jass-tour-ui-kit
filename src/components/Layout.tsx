import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

export function Layout() {
  const location = useLocation();
  const isPasswordGate = location.pathname === '/';

  if (isPasswordGate) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:border-r lg:bg-card">
        <Sidebar />
      </aside>

      {/* Main content */}
      <main className="pb-20 lg:pb-0 lg:pl-64">
        <div className="mx-auto max-w-2xl px-4 py-6 lg:max-w-4xl lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card lg:hidden">
        <BottomNav />
      </nav>
    </div>
  );
}
