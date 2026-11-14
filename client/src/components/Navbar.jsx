import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import SeverToggle from './SeverToggle';
import SystemGuideModal from './SystemGuideModal';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isInnie } = useMode();
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
        className={`w-full border-b sticky top-0 z-40 px-4 py-2.5 transition-colors ${
          isInnie
            ? 'bg-[#ffffff] border-[#e6e6e6] shadow-xs'
            : 'bg-[#000000] border-[#222222]'
        }`}
      >
        <div className="max-w-[1100px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`text-sm sm:text-base font-bold tracking-[0.15em] uppercase hover:opacity-85 transition-opacity flex items-center gap-2 ${
                isInnie ? 'text-[#4a154b]' : 'text-[#FFFFFF]'
              }`}
            >
              <span className={`inline-block w-2.5 h-2.5 ${isInnie ? 'bg-[#4a154b] rounded-full' : 'bg-[#FFC000] rotate-45'}`} />
              LINKED OUT
            </Link>

            <span className={`text-[10px] font-mono px-2 py-0.5 tracking-wider uppercase ${
              isInnie
                ? 'bg-[#f9f0ff] text-[#4a154b] rounded-full border border-[#ebd8f5]'
                : 'bg-[#181818] text-[#FFC000] border border-[#2a2a2a]'
            }`}>
              {isInnie ? '# workplace' : 'v12 corpo'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <SeverToggle />

            <Button
              variant="outline"
              size="xs"
              onClick={() => setShowGuide(true)}
              className="font-mono font-bold text-xs"
              title="System Guide"
            >
              ?
            </Button>

            {user && (
              <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
                {user.isAdmin && (
                  <Link
                    to="/review"
                    className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
                      isInnie
                        ? 'bg-[#f4ede4] text-[#4a154b] rounded-full hover:bg-[#ebd8f5]'
                        : 'bg-[#202020] text-[#FFC000] border border-[#2c2c2c] hover:border-[#FFC000]'
                    }`}
                  >
                    AUDIT
                  </Link>
                )}

                <Link
                  to={`/u/${user.username}`}
                  className={`hover:underline font-mono text-xs ${
                    isInnie ? 'text-[#1264a3]' : 'text-[#FFFFFF]'
                  }`}
                >
                  @{user.username}
                </Link>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={logout}
                  className="font-mono text-xs"
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
