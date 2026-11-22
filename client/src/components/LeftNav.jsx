import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Home, Layers, TrendingDown, Briefcase, Bookmark, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import api from '../api/api';

// Left navigation with primary routes and joined floors (cleaned: no redundant profile card or footer links)
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

  // Live synchronization: reflect floor join/leave instantly across the app
  useEffect(() => {
    const handleFloorEvent = (e) => {
      const { floorId, slug, name, joined } = e.detail || {};
      if (joined) {
        setJoinedFloors((prev) => {
          if (prev.some((f) => f._id === floorId || f.slug === slug)) return prev;
          return [...prev, { _id: floorId, slug, name: name || slug, memberCount: 1, isMember: true }];
        });
      } else {
        setJoinedFloors((prev) => prev.filter((f) => f._id !== floorId && f.slug !== slug));
      }
    };
    window.addEventListener('linkedout:floor-joined', handleFloorEvent);
    return () => window.removeEventListener('linkedout:floor-joined', handleFloorEvent);
  }, []);

  const primaryNav = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Floors', path: '/floors', icon: Layers },
    { label: 'Severed Floor', path: '/severed-floor', icon: TrendingDown },
    { label: 'Comeback', path: '/comeback', icon: Briefcase },
    { label: 'Saved', path: '/saved', icon: Bookmark }
  ];

  return (
    <aside
      className={`text-xs bg-[var(--bg)] ${
        isMobile
          ? 'w-72 h-full p-4 overflow-y-auto'
          : 'w-full sticky top-14 p-3 overflow-y-auto overflow-x-hidden'
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

        {/* Informational Footer Links */}
        <footer className="pt-4 border-t border-[var(--border)] px-3 flex flex-wrap items-center gap-3 text-[11px] text-[var(--muted)]">
          <Link
            to="/handbook"
            onClick={isMobile ? onCloseMobile : undefined}
            className="hover:text-[var(--text)] transition-colors"
          >
            Handbook
          </Link>
          <Link
            to="/wellness"
            onClick={isMobile ? onCloseMobile : undefined}
            className="hover:text-[var(--text)] transition-colors"
          >
            Wellness
          </Link>
          <Link
            to="/handbook"
            onClick={isMobile ? onCloseMobile : undefined}
            className="hover:text-[var(--text)] transition-colors"
          >
            Privacy
          </Link>
        </footer>
      </div>
    </aside>
  );
}
