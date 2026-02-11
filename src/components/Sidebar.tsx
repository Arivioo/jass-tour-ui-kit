import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Play, History, Trophy, FileText, Settings, LogOut, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/session', icon: Play, label: 'Neue Session' },
  { to: '/history', icon: History, label: 'Vergangene Abende' },
  { to: '/rangliste', icon: Trophy, label: 'Ewige Rangliste' },
  { to: '/kasse', icon: Wallet, label: 'Kasse' },
  { to: '/statuten', icon: FileText, label: 'Statuten' },
  { to: '/settings', icon: Settings, label: 'Einstellungen' },
];

export function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('jass-access');
    navigate('/auth');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-bold text-primary">Beize Jass Tour</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Abmelden
        </Button>
      </div>
    </div>
  );
}
