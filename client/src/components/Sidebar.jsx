import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

const NAV_LINKS = [
  { path: '/', labelOutie: 'FEED // HOME', labelInnie: '# home-feed' },
  { path: '/floors', labelOutie: 'SECTOR // FLOORS', labelInnie: '# company-floors' },
  { path: '/severed-floor', labelOutie: 'SEVERED // REDUCTIONS', labelInnie: '# layoff-tracker' },
  { path: '/comeback', labelOutie: 'REINTEGRATION // JOBS', labelInnie: '# hired-celebrate' },
  { path: '/handbook', labelOutie: 'CODEX // HANDBOOK', labelInnie: '# handbook-rules' },
  { path: '/wellness', labelOutie: 'SANCTUARY // WELLNESS', labelInnie: '# wellness-room' }
];

export default function Sidebar() {
  const { user } = useAuth();
  const { isInnie } = useMode();

  return (
    <>
      <aside
        className={`hidden md:flex flex-col w-56 shrink-0 border-r min-h-[calc(100vh-53px)] p-4 gap-1.5 font-mono text-xs transition-colors ${
          isInnie
            ? 'bg-[#ffffff] border-[#e6e6e6]'
            : 'bg-[#000000] border-[#222222]'
        }`}
      >
        <span className="uppercase tracking-[0.2em] text-[10px] mb-2 px-2 text-[var(--muted)] font-bold">
          {isInnie ? 'CHANNELS' : 'TELEMETRY'}
        </span>

        {NAV_LINKS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
          >
            {({ isActive }) => (
              <div
                style={{ borderRadius: 'var(--radius-btn)' }}
                className={`w-full px-3 py-2 text-xs font-semibold flex items-center gap-2 transition-all select-none ${
                  isActive
                    ? (isInnie
                        ? 'bg-[#f9f0ff] text-[#4a154b] font-bold shadow-xs'
                        : 'bg-[#202020] text-[#FFC000] border-l-2 border-[#FFC000]')
                    : (isInnie
                        ? 'text-[#696969] hover:bg-[#f4ede4] hover:text-[#1d1d1d]'
                        : 'text-[#7D7D7D] hover:bg-[#181818] hover:text-[#FFFFFF]')
                }`}
              >
                <span>{isInnie ? item.labelInnie : item.labelOutie}</span>
              </div>
            )}
          </NavLink>
        ))}

        {user?.isAdmin && (
          <NavLink
            to="/review"
            className="mt-4"
          >
            {({ isActive }) => (
              <div
                style={{ borderRadius: 'var(--radius-btn)' }}
                className={`w-full px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all ${
                  isActive
                    ? (isInnie ? 'bg-[#4a154b] text-white border-[#4a154b]' : 'bg-[#FFC000] text-black border-[#FFC000]')
                    : (isInnie ? 'border-[#4a154b] text-[#4a154b] hover:bg-[#f9f0ff]' : 'border-[#333] text-[#FFC000] hover:border-[#FFC000]')
                }`}
              >
                <span>{isInnie ? '# moderation-queue' : 'AUDIT // MODERATION'}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-black/20 rounded">ADM</span>
              </div>
            )}
          </NavLink>
        )}
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 border-t z-40 flex items-center justify-around py-2 font-mono text-[10px] ${
          isInnie ? 'bg-[#ffffff] border-[#e6e6e6]' : 'bg-[#000000] border-[#222222]'
        }`}
      >
        {NAV_LINKS.slice(0, 4).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `px-2 py-1 uppercase tracking-wider ${
                isActive
                  ? (isInnie ? 'text-[#4a154b] font-bold' : 'text-[#FFC000] font-bold')
                  : 'text-[var(--muted)]'
              }`
            }
          >
            {item.path === '/' ? 'FEED' : item.path.replace('/', '')}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
