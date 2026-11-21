import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Layers, TrendingDown, Briefcase, Bookmark, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import Avatar from './Avatar';
import api from '../api/api';
import { Button } from '@/components/ui/button';

// Sticky left navigation with primary routes, joined floors, and user summary
export default function LeftNav({ isMobile = false, onCloseMobile = () => {} }) {
  const { user } = useAuth();
  const { mode } = useMode();
  const [joinedFloors, setJoinedFloors] = useState([]);

  useEffect(() => {
    const loadFloors = async () => {
      try {
        const res = await api.get('/floors');
        const all = res.data.floors || [];
        setJoinedFloors(all.filter((f) => f.isMember));
      } catch (err) {
        console.error(err);
      }
    };
    loadFloors();
  }, [user, mode]);

  const primaryNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Floors', path: '/floors', icon: Layers },
    { label: 'Severed Floor', path: '/severed-floor', icon: TrendingDown },
    { label: 'Comeback', path: '/comeback', icon: Briefcase },
    { label: 'Saved', path: '/saved', icon: Bookmark }
  ];

  return (
    <aside
      className={`flex flex-col justify-between text-xs bg-[var(--bg)] ${
        isMobile
          ? 'w-72 h-full p-4 overflow-y-auto'
          : 'w-full h-[calc(100vh-56px)] sticky top-14 p-3 overflow-y-auto overflow-x-hidden'
      }`}
    >
      <div className="space-y-6">
        {/* Primary Navigation Links */}
        <nav aria-label="Main" className="space-y-0.5">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={isMobile ? onCloseMobile : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors rounded-[var(--radius-sm)] ${
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                      : 'text-[var(--text)] hover:bg-[var(--hover)]'
                  }`
                }
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Your Floors */}
        <div className="space-y-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center justify-between px-3 text-xs text-[var(--muted)]">
            <span>Your floors</span>
            <Link
              to="/floors"
              onClick={isMobile ? onCloseMobile : undefined}
              title="Create floor"
              className="hover:text-[var(--text)]"
            >
              <Plus size={14} />
            </Link>
          </div>

          <div className="space-y-0.5">
            {joinedFloors.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--muted)]">
                No joined floors yet.
              </div>
            ) : (
              joinedFloors.map((f) => (
                <NavLink
                  key={f._id}
                  to={`/floors/${f.slug}`}
                  onClick={isMobile ? onCloseMobile : undefined}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-1.5 transition-colors rounded-[var(--radius-sm)] ${
                      isActive
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                        : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'
                    }`
                  }
                >
                  <span className="truncate">#{f.name}</span>
                  <span className="text-[10px] tabular-nums shrink-0">{f.memberCount}</span>
                </NavLink>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Profile & Meta Links */}
      <div className="pt-4 border-t border-[var(--border)] space-y-3">
        {user ? (
          <Link
            to={`/u/${user.username}`}
            onClick={isMobile ? onCloseMobile : undefined}
            className="p-2 hover:bg-[var(--hover)] rounded-[var(--radius-sm)] flex items-center gap-2.5 transition-colors"
          >
            <Avatar user={user} />
            <div className="min-w-0 flex-1">
              <span className="font-medium text-xs truncate block text-[var(--text)]">
                {user.name || `@${user.username}`}
              </span>
              <span className="text-[10px] text-[var(--muted)] truncate block">
                {user.status || 'Employed'}
              </span>
            </div>
          </Link>
        ) : (
          <div className="p-2 text-center space-y-2">
            <Button asChild variant="default" size="sm" className="w-full">
              <Link to="/login" onClick={isMobile ? onCloseMobile : undefined}>Sign in</Link>
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-[var(--muted)] px-2">
          <Link to="/handbook" onClick={isMobile ? onCloseMobile : undefined} className="hover:text-[var(--text)]">
            Handbook
          </Link>
          <Link to="/wellness" onClick={isMobile ? onCloseMobile : undefined} className="hover:text-[var(--text)]">
            Wellness
          </Link>
          <Link to="/severed-floor" onClick={isMobile ? onCloseMobile : undefined} className="hover:text-[var(--text)]">
            Severed Floor
          </Link>
        </div>
      </div>
    </aside>
  );
}
