import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navigation links configuration
const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/floors', label: 'Floors' },
  { path: '/severed-floor', label: 'Severed Floor' },
  { path: '/comeback', label: 'Comeback' },
  { path: '/handbook', label: 'Handbook' },
  { path: '/wellness', label: 'Wellness' }
];

// Sidebar navigation for desktop and bottom bar for mobile
export default function Sidebar() {
  const { user } = useAuth();

  return (
    <>
      {/* Desktop left navigation column */}
      <aside
        className="hidden md:flex flex-col w-52 shrink-0 border-r min-h-[calc(100vh-53px)] p-4 gap-1 font-mono text-xs"
        style={{ borderColor: 'var(--border)' }}
      >
        <span className="uppercase tracking-widest text-[10px] mb-2 px-2" style={{ color: 'var(--muted)' }}>
          Navigation
        </span>

        {NAV_LINKS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `px-3 py-2 border transition-colors ${
                isActive ? 'font-bold' : 'hover:opacity-80'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'var(--surface)' : 'transparent',
              borderColor: isActive ? 'var(--border)' : 'transparent',
              color: 'var(--text)',
              borderRadius: '2px'
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      {/* Mobile bottom navigation bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around py-2 px-1 font-mono text-[10px]"
        style={{
          backgroundColor: 'var(--bg)',
          borderColor: 'var(--border)'
        }}
      >
        {NAV_LINKS.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `px-2 py-1 uppercase ${isActive ? 'underline font-bold' : ''}`
            }
            style={{ color: 'var(--text)' }}
          >
            {item.label}
          </NavLink>
        ))}
        {user && (
          <NavLink
            to={`/u/${user.username}`}
            className={({ isActive }) =>
              `px-2 py-1 uppercase ${isActive ? 'underline font-bold' : ''}`
            }
            style={{ color: 'var(--text)' }}
          >
            Profile
          </NavLink>
        )}
      </nav>
    </>
  );
}

