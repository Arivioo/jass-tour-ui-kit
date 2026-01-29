import { NavLink } from 'react-router-dom';
import { Home, Play, History, Trophy, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Start' },
  { to: '/session', icon: Play, label: 'Session' },
  { to: '/history', icon: History, label: 'Abende' },
  { to: '/rangliste', icon: Trophy, label: 'Rangliste' },
  { to: '/settings', icon: Settings, label: 'Mehr' },
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
              'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
              isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </div>
  );
}
