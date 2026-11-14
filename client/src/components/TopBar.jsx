import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Menu, X, User, Bookmark, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import SeverToggle from './SeverToggle';
import api from '../api/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// TopBar: Fixed 56px header with search, mode toggle, composer trigger, and user menu
export default function TopBar({ onToggleMobileNav, isMobileNavOpen, onOpenComposer }) {
  const { user, logout } = useAuth();
  const { isInnie } = useMode();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ floors: [], posts: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Debounced search query
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ floors: [], posts: [] });
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  // Click outside listener for search & user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectFloor = (slug) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/floors/${slug}`);
  };

  const handleSelectPost = (id) => {
    setShowDropdown(false);
    setQuery('');
    navigate(`/posts/${id}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-4 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={onToggleMobileNav}
          className="md:hidden p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          to="/"
          className="font-mono text-sm font-bold tracking-[0.2em] uppercase text-[var(--color-text-primary)] hover:opacity-85"
        >
          LINKED OUT
        </Link>
      </div>

      {/* Center: Wide Search with Dropdown */}
      <div ref={searchRef} className="relative flex-1 max-w-xl mx-2 hidden sm:block">
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setShowDropdown(true);
            }}
            placeholder="Search posts and floors"
            className="w-full h-9 pl-9 pr-3 text-xs font-mono bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border)] focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder:text-[var(--color-text-muted)]"
            style={{ borderRadius: 'var(--radius-input)' }}
          />
        </div>

        {/* Results Dropdown */}
        {showDropdown && (results.floors.length > 0 || results.posts.length > 0) && (
          <div
            className="absolute top-10 left-0 right-0 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl z-50 p-2 space-y-3 font-mono text-xs max-h-96 overflow-y-auto"
            style={{ borderRadius: 'var(--radius-card)' }}
          >
            {results.floors.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] px-2 block mb-1">
                  // FLOORS
                </span>
                {results.floors.map((f) => (
                  <button
                    key={f._id}
                    onClick={() => handleSelectFloor(f.slug)}
                    className="w-full text-left p-2 hover:bg-[var(--color-bg-subtle)] flex items-center justify-between transition-colors"
                  >
                    <span className="font-semibold text-[var(--color-text-primary)]">#{f.name}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">{f.memberCount} members</span>
                  </button>
                ))}
              </div>
            )}

            {results.posts.length > 0 && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] px-2 block mb-1">
                  // POSTS
                </span>
                {results.posts.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelectPost(p._id)}
                    className="w-full text-left p-2 hover:bg-[var(--color-bg-subtle)] flex flex-col gap-0.5 transition-colors border-b border-[var(--color-border)] last:border-b-0"
                  >
                    <span className="font-semibold text-[var(--color-text-primary)] line-clamp-1">{p.title}</span>
                    <span className="text-[10px] text-[var(--color-text-muted)]">
                      {p.floor ? `#${p.floor.name} · ` : ''}{p.isInnie ? p.innieHandle : `@${p.author?.username}`}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Sever toggle, + Create, and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <SeverToggle />

        {user && (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onOpenComposer}
            className="font-mono text-xs uppercase font-semibold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Create</span>
          </Button>
        )}

        {/* User avatar menu */}
        {user ? (
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              aria-label="User account menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] hover:border-[var(--color-primary)] transition-colors"
              style={{ borderRadius: 'var(--radius-btn)' }}
            >
              <div
                className="w-7 h-7 flex items-center justify-center font-mono text-xs font-bold bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
                style={{ borderRadius: 'var(--radius-btn)' }}
              >
                {isInnie ? 'IN' : (user.username?.[0]?.toUpperCase() || 'U')}
              </div>
              <span className="hidden md:inline font-mono text-xs font-semibold pr-1 max-w-[100px] truncate">
                {isInnie ? user.innieHandle : `@${user.username}`}
              </span>
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 top-10 w-48 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-2xl p-1.5 space-y-1 font-mono text-xs z-50"
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <Link
                  to={`/u/${user.username}`}
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] transition-colors"
                >
                  <User size={14} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] transition-colors"
                >
                  <Bookmark size={14} />
                  <span>Saved</span>
                </Link>
                <Link
                  to="/handbook"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 p-2 hover:bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] transition-colors"
                >
                  <BookOpen size={14} />
                  <span>Handbook</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-[var(--color-bg-subtle)] text-[#E01E5A] transition-colors border-t border-[var(--color-border)] mt-1"
                >
                  <LogOut size={14} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/login" className="font-mono text-xs uppercase">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}