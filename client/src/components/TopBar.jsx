import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Menu, X, User, Bookmark, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SeverToggle from './SeverToggle';
import Avatar from './Avatar';
import api from '../api/api';
import { Button } from '@/components/ui/button';

// TopBar: 56px header with logo, search input, Sever toggle, create button, and user avatar
export default function TopBar({ onToggleMobileNav, isMobileNavOpen, onOpenComposer }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ floors: [], posts: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Unified items list for keyboard navigation
  const combinedResults = [
    ...(results.floors || []).map((f) => ({ type: 'floor', data: f, id: f._id, url: `/floors/${f.slug}` })),
    ...(results.posts || []).map((p) => ({ type: 'post', data: p, id: p._id, url: `/post/${p._id}` }))
  ];

  // Debounced search query
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ floors: [], posts: [] });
      setSelectedIndex(-1);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(res.data);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (err) {
        console.error(err);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  // Handle arrow keys and enter to navigate suggestions
  const handleKeyDown = (e) => {
    if (!showDropdown || combinedResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % combinedResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + combinedResults.length) % combinedResults.length);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < combinedResults.length) {
        e.preventDefault();
        const selected = combinedResults[selectedIndex];
        setShowDropdown(false);
        setSelectedIndex(-1);
        navigate(selected.url);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  // Click outside listener for search & user menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[var(--bg)] border-b border-[var(--border)] px-4 flex items-center justify-between gap-3">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={onToggleMobileNav}
          className="md:hidden p-1 text-[var(--muted)] hover:text-[var(--text)]"
        >
          {isMobileNavOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link to="/" className="text-sm font-semibold tracking-tight text-[var(--text)]">
          Linked Out
        </Link>
      </div>

      {/* Center: Search input */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-2 hidden sm:block">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
            placeholder="Search posts and floors"
            className="w-full h-9 pl-9 pr-3 text-xs bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] placeholder:text-[var(--muted)] transition-colors"
          />
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && combinedResults.length > 0 && (
          <div className="absolute top-10 left-0 right-0 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-2 space-y-1 text-xs z-50 max-h-80 overflow-y-auto">
            {combinedResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              if (item.type === 'floor') {
                const f = item.data;
                return (
                  <button
                    key={`floor-${f._id}`}
                    type="button"
                    onClick={() => { setShowDropdown(false); setSelectedIndex(-1); navigate(item.url); }}
                    className={`w-full text-left p-2 flex items-center justify-between rounded-[var(--radius-sm)] cursor-pointer transition-colors ${
                      isSelected ? 'bg-[var(--hover)] ring-1 ring-[var(--accent)]' : 'hover:bg-[var(--hover)]'
                    }`}
                  >
                    <span className="font-medium text-[var(--text)]">#{f.name}</span>
                    <span className="text-[10px] text-[var(--muted)]">{f.memberCount} members</span>
                  </button>
                );
              }

              const p = item.data;
              return (
                <button
                  key={`post-${p._id}`}
                  type="button"
                  onClick={() => { setShowDropdown(false); setSelectedIndex(-1); navigate(item.url); }}
                  className={`w-full text-left p-2 flex flex-col rounded-[var(--radius-sm)] cursor-pointer transition-colors ${
                    isSelected ? 'bg-[var(--hover)] ring-1 ring-[var(--accent)]' : 'hover:bg-[var(--hover)]'
                  }`}
                >
                  <span className="font-medium text-[var(--text)] line-clamp-1">{p.title}</span>
                  <span className="text-[10px] text-[var(--muted)]">{p.floor ? `#${p.floor.name}` : ''}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Sever toggle, + New post, and User Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <SeverToggle />

        {user && (
          <Button type="button" variant="default" size="sm" onClick={onOpenComposer} className="gap-1">
            <Plus size={14} />
            <span className="hidden sm:inline">New post</span>
          </Button>
        )}

        {user ? (
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              aria-label="User account"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="cursor-pointer"
            >
              <Avatar user={user} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-11 w-44 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-1.5 space-y-1 text-xs z-50">
                <Link to={`/u/${user.username}`} onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 p-2 hover:bg-[var(--hover)] text-[var(--text)] rounded-[var(--radius-sm)]">
                  <User size={13} />
                  <span>Profile</span>
                </Link>
                <Link to="/saved" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 p-2 hover:bg-[var(--hover)] text-[var(--text)] rounded-[var(--radius-sm)]">
                  <Bookmark size={13} />
                  <span>Saved</span>
                </Link>
                <Link to="/handbook" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 p-2 hover:bg-[var(--hover)] text-[var(--text)] rounded-[var(--radius-sm)]">
                  <BookOpen size={13} />
                  <span>Handbook</span>
                </Link>
                <button
                  type="button"
                  onClick={() => { setShowUserMenu(false); logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2 p-2 text-left hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--text)] rounded-[var(--radius-sm)] border-t border-[var(--border)] mt-1 cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button asChild variant="outline" size="sm">
            <Link to="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
