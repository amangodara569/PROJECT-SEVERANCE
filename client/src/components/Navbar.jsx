import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeverToggle from './SeverToggle';
import SystemGuideModal from './SystemGuideModal';

// Top navigation bar: logo on left, SeverToggle center-right, Guide button & user profile on right
export default function Navbar() {
  const { user, logout } = useAuth();
  const [showGuide, setShowGuide] = useState(() => {
    return localStorage.getItem('hasSeenSystemGuide') !== 'true';
  });

  const handleCloseGuide = () => {
    localStorage.setItem('hasSeenSystemGuide', 'true');
    setShowGuide(false);
  };

  return (
    <>
      <SystemGuideModal isOpen={showGuide} onClose={handleCloseGuide} />

      <header
        className="w-full border-b sticky top-0 z-40 px-4 py-2"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="font-mono text-base font-bold tracking-[0.2em] uppercase hover:opacity-80"
            style={{ color: 'var(--text)' }}
          >
            LINKED OUT
          </Link>

          <div className="flex items-center gap-4">
            <SeverToggle />

            {/* Guide trigger button */}
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="px-2 py-0.5 text-xs font-mono font-bold border hover:opacity-80"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                backgroundColor: 'var(--surface)'
              }}
              title="System Guide (?)"
            >
              ?
            </button>

            {user && (
              <div className="flex items-center gap-3 font-mono text-xs">
                {user.isAdmin && (
                  <Link
                    to="/review"
                    className="px-2 py-0.5 text-[11px] border uppercase hover:opacity-80"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      backgroundColor: 'var(--surface)'
                    }}
                  >
                    Audit
                  </Link>
                )}
                <Link
                  to={`/u/${user.username}`}
                  className="hover:underline"
                  style={{ color: 'var(--text)' }}
                >
                  @{user.username}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="px-2 py-1 text-[11px] border"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--muted)',
                    backgroundColor: 'transparent'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
