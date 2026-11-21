import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sidebar navigation with hairline borders and theme v2 variables
export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: 'Feed' },
    { path: '/floors', label: 'Floors' },
    { path: '/severed-floor', label: 'Severed Floor' },
    { path: '/comeback', label: 'Comeback' },
    { path: '/handbook', label: 'Handbook' },
    { path: '/wellness', label: 'Wellness' }
  ];

  return (
    <aside className="w-56 p-4 border-r border-[var(--border)] bg-[var(--bg)] min-h-[calc(100vh-56px)] text-xs space-y-6">
      <div className="space-y-1">
        <span className="text-[11px] font-medium text-[var(--muted)] px-2 block mb-2">
          Navigation
        </span>
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-2.5 py-1.5 rounded-[var(--radius-sm)] transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-medium'
                    : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {user?.role === 'admin' && (
        <div className="pt-3 border-t border-[var(--border)]">
          <Link
            to="/admin/reports"
            className="block px-2.5 py-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]"
          >
            Review queue
          </Link>
        </div>
      )}
    </aside>
  );
}
