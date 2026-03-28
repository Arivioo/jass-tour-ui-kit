import { NavLink } from 'react-router-dom';
import { Home, Play, History, Trophy, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/session', icon: Play, label: 'Session' },
  { to: '/history', icon: History, label: 'Abende' },
  { to: '/rangliste', icon: Trophy, label: 'Rangliste' },
  { to: '/kasse', icon: Wallet, label: 'Kasse' },
];

export function BottomNav() {
  return (
    <div className="flex h-16 items-center justify-around px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) =>
            cn(
              'flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:h-0.5 after:w-4 after:rounded-full after:bg-primary'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <item.icon className="h-5 w-5" aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
