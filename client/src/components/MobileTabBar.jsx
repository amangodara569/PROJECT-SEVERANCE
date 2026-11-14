import { NavLink } from 'react-router-dom';
import { Home, Layers, TrendingDown, Briefcase, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// MobileTabBar: Bottom navigation bar for viewport widths under 768px
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
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-14 bg-[var(--color-bg-card)] border-t border-[var(--color-border)] flex items-center justify-around px-2 font-mono text-[10px]"
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
                  ? 'text-[var(--color-primary)] font-bold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
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