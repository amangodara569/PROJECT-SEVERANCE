import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeverToggle from './SeverToggle';
import { Button } from '@/components/ui/button';

// Top navigation bar with hairline bottom divider
export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg)] text-[var(--text)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight text-[var(--text)]"
          >
            Linked Out
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <SeverToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={`/u/${user.username}`}
                className="px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors rounded-[var(--radius-sm)]"
              >
                {user.name || `@${user.username}`}
              </Link>
              <Button
                variant="outline"
                size="xs"
                onClick={logout}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="xs">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild variant="default" size="xs">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
