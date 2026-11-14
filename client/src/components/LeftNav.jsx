import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Home, Layers, TrendingDown, Briefcase, Bookmark, ChevronDown, ChevronRight, Plus, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import api from '../api/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// LeftNav: Sticky left navigation with primary routes, joined floors, recent items, and mini profile
export default function LeftNav({ isMobile = false, onCloseMobile = () => {} }) {
  const { user } = useAuth();
  const { isInnie } = useMode();
  const navigate = useNavigate();

  const [joinedFloors, setJoinedFloors] = useState([]);
  const [isFloorsExpanded, setIsFloorsExpanded] = useState(true);
  const [recents, setRecents] = useState([]);

  // Load joined floors
  useEffect(() => {
    const loadFloors = async () => {
      try {
        const res = await api.get('/floors');
        const all = res.data.floors || [];
        const joined = all.filter((f) => f.isMember);
        setJoinedFloors(joined);
      } catch (err) {
        console.error(err);
      }
    };
    loadFloors();
  }, [user]);

  // Load recents from localStorage
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('linkedout:recent') || '[]');
      setRecents(stored.slice(0, 3));
    } catch {}
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
      className={`flex flex-col justify-between font-mono text-xs border-r border-[var(--color-border)] bg-[var(--color-bg-canvas)] transition-all ${
        isMobile
          ? 'w-72 h-full p-4 overflow-y-auto'
          : 'w-full h-[calc(100vh-56px)] sticky top-14 p-3 overflow-y-auto overflow-x-hidden'
      }`}
    >
      <div className="space-y-5">
        {/* 1. Primary Navigation Links */}
        <nav aria-label="Main" className="space-y-1">
          {primaryNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.label}
                to={item.path}
                onClick={isMobile ? onCloseMobile : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 transition-colors border ${
                    isActive
                      ? 'border-[var(--color-primary)] font-bold text-[var(--color-primary)] bg-[var(--color-bg-subtle)]'
                      : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
                  }`
                }
                style={{ borderRadius: 'var(--radius-btn)' }}
              >
                <Icon size={16} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* 2. Your Floors (Reddit style collapsible) */}
        <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between px-2 text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
            <button
              type="button"
              onClick={() => setIsFloorsExpanded(!isFloorsExpanded)}
              className="flex items-center gap-1 hover:text-[var(--color-text-primary)] transition-colors"
            >
              {isFloorsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              <span>// YOUR FLOORS ({joinedFloors.length})</span>
            </button>
            <Link
              to="/floors"
              onClick={isMobile ? onCloseMobile : undefined}
              title="Explore all floors"
              className="hover:text-[var(--color-text-primary)]"
            >
              <Plus size={12} />
            </Link>
          </div>

          {isFloorsExpanded && (
            <div className="space-y-1 pl-1">
              {joinedFloors.length === 0 ? (
                <div className="p-3 text-center space-y-2">
                  <p className="text-[11px] text-[var(--color-text-muted)]">No joined floors yet.</p>
                  <Button
                    asChild
                    variant="outline"
                    size="xs"
                    onClick={isMobile ? onCloseMobile : undefined}
                    className="w-full text-[10px] uppercase"
                  >
                    <Link to="/floors">Join Your First Floor</Link>
                  </Button>
                </div>
              ) : (
                joinedFloors.map((f) => (
                  <NavLink
                    key={f._id}
                    to={`/floors/${f.slug}`}
                    onClick={isMobile ? onCloseMobile : undefined}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-2.5 py-1.5 transition-colors ${
                        isActive
                          ? 'font-bold text-[var(--color-primary)] bg-[var(--color-bg-subtle)]'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
                      }`
                    }
                    style={{ borderRadius: 'var(--radius-btn)' }}
                  >
                    <span className="truncate">#{f.name}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">{f.memberCount}</span>
                  </NavLink>
                ))
              )}
            </div>
          )}
        </div>

        {/* 3. Recent (Last 3 visited) */}
        {recents.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-[var(--color-border)]">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)] px-2 block">
              // RECENT
            </span>
            <div className="space-y-1 pl-1">
              {recents.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url}
                  onClick={isMobile ? onCloseMobile : undefined}
                  className="flex items-center gap-2 px-2.5 py-1 text-[11px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] transition-colors truncate"
                  style={{ borderRadius: 'var(--radius-btn)' }}
                >
                  <Compass size={12} className="shrink-0" />
                  <span className="truncate">{item.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Section: Mini Profile & Footer Links */}
      <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
        {/* 4. Mini Profile Card (LinkedIn style) */}
        {user ? (
          <Link
            to={`/u/${user.username}`}
            onClick={isMobile ? onCloseMobile : undefined}
            className="p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-card)] hover:border-[var(--color-primary)] transition-colors flex items-center gap-3 block"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            <div
              className="w-8 h-8 shrink-0 flex items-center justify-center font-bold text-xs bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
              style={{ borderRadius: 'var(--radius-btn)' }}
            >
              {isInnie ? 'IN' : (user.username?.[0]?.toUpperCase() || 'U')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs truncate text-[var(--color-text-primary)]">
                  {isInnie ? user.innieHandle : `@${user.username}`}
                </span>
                {!isInnie && (
                  <Badge variant="outline" size="sm" className="text-[9px] uppercase px-1 py-0">
                    {user.status || 'Employed'}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)] truncate">
                {isInnie ? 'Pseudonymous identity active' : (user.headline || 'Severed Personnel')}
              </p>
            </div>
          </Link>
        ) : (
          <div className="p-2.5 border border-[var(--color-border)] bg-[var(--color-bg-card)] text-center space-y-2">
            <span className="text-[11px] font-bold block text-[var(--color-text-primary)]">Welcome to Linked Out</span>
            <Button asChild variant="default" size="xs" className="w-full uppercase">
              <Link to="/login" onClick={isMobile ? onCloseMobile : undefined}>Sign In</Link>
            </Button>
          </div>
        )}

        {/* 5. Footer Links */}
        <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] px-1">
          <Link to="/handbook" onClick={isMobile ? onCloseMobile : undefined} className="hover:underline">
            Handbook
          </Link>
          <span>·</span>
          <Link to="/wellness" onClick={isMobile ? onCloseMobile : undefined} className="hover:underline">
            Wellness
          </Link>
          <span>·</span>
          <Link to="/severed-floor" onClick={isMobile ? onCloseMobile : undefined} className="hover:underline">
            Telemetry
          </Link>
        </div>
      </div>
    </aside>
  );
}