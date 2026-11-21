import { NavLink } from 'react-router-dom';
import { Home, Layers, TrendingDown, Briefcase, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Mobile bottom navigation bar with 5 tabs and hairline top border
export default function MobileTabBar() {
  const { user } = useAuth();
  const profilePath = user?.username ? `/u/${user.username}` : '/login';

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Floors', path: '/floors', icon: Layers },
    { label: 'Severed', path: '/severed-floor', icon: TrendingDown },
    { label: 'Comeback', path: '/comeback', icon: Briefcase },
    { label: 'Profile', path: profilePath, icon: User }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[var(--bg)] border-t border-[var(--border)] flex items-center justify-around px-2 text-[11px]"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
                isActive
                  ? 'text-[var(--accent)] font-medium'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
