import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import api from '../api/api';
import { Button } from '@/components/ui/button';
import { useMode } from '../context/ModeContext';

// Renders a mini bar sparkline from daily data points
const renderMiniBarChart = (numbers = []) => {
  if (!numbers || numbers.length === 0) return '';
  const max = Math.max(...numbers, 1);
  const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return numbers
    .slice(-30)
    .map((val) => {
      if (val === 0) return ' ';
      const idx = Math.min(Math.floor((val / max) * blocks.length), blocks.length - 1);
      return blocks[idx];
    })
    .join('');
};

// Right rail with severed count and suggested floors (clean Severance terminal view)
export default function RightRail({ floorContext = null, postContext = null }) {
  const { mode } = useMode();
  const currentFloor = floorContext || postContext?.floor;
  const [overview, setOverview] = useState({ severedThisMonth: 0, severedByDay: [] });
  const [popularFloors, setPopularFloors] = useState([]);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const [statsRes, floorsRes] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/floors?sort=members&limit=5')
        ]);
        setOverview(statsRes.data || { severedThisMonth: 0, severedByDay: [] });
        setPopularFloors(floorsRes.data.floors || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadModules();
  }, [mode]);

  const handleJoinFloor = async (id, slug) => {
    try {
      const res = await api.post(`/floors/${slug}/join`);
      const target = popularFloors.find((f) => f._id === id);
      const isJoined = res.data.joined;
      setPopularFloors((prev) =>
        prev.map((f) => (f._id === id ? { ...f, isMember: isJoined, memberCount: res.data.memberCount } : f))
      );
      window.dispatchEvent(
        new CustomEvent('linkedout:floor-joined', {
          detail: { floorId: id, slug, name: target?.name, joined: isJoined }
        })
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-full space-y-6 text-xs select-none">
      {/* Contextual Floor Info */}
      {currentFloor && (
        <section className={`space-y-3 pb-6 ${mode === 'outie' ? 'border-b border-[#1E2D28]' : 'border-b border-[var(--border)]'}`}>
          <h2 className="text-sm font-semibold text-[var(--text)]">About this floor</h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {currentFloor.description || 'People who worked at this floor, talking about what happened and what comes next.'}
          </p>
          <div className="text-xs text-[var(--muted)]">
            {currentFloor.memberCount || 1} members
          </div>
          <button
            type="button"
            onClick={() => handleJoinFloor(currentFloor._id, currentFloor.slug)}
            className={`w-full justify-center ${
              mode === 'outie'
                ? (currentFloor.isMember
                    ? "border border-[#1E2D28] text-[#7A8080] hover:text-[#E5E5E5] rounded-full text-xs px-3.5 py-1.5 font-medium shrink-0 cursor-pointer transition-colors flex items-center gap-1"
                    : "bg-[#B0E4CC] text-[#091413] hover:opacity-90 font-bold rounded-full text-xs px-3.5 py-1.5 shrink-0 cursor-pointer transition-opacity flex items-center gap-1")
                : (currentFloor.isMember
                    ? "border border-[var(--border)] text-[var(--muted)] px-3 py-1 rounded-[var(--radius-sm)] text-xs font-medium flex items-center gap-1"
                    : "bg-[var(--accent)] text-[var(--accent-ink)] px-3 py-1 rounded-[var(--radius-sm)] text-xs font-bold flex items-center gap-1")
            }`}
          >
            {currentFloor.isMember ? (
              <>
                <Check size={12} />
                <span>Joined</span>
              </>
            ) : (
              '+ Join floor'
            )}
          </button>

          <div className="pt-3 space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text)]">Floor rules</h3>
            <ul className="space-y-1 text-xs text-[var(--muted)]">
              <li>Be raw, not cruel.</li>
              <li>Do not name private people.</li>
              <li>Report doxxing.</li>
            </ul>
          </div>
        </section>
      )}

      {mode === 'outie' ? (
        /* ================= OUTIE RIGHT RAIL (Circular Stats Gauge & Populated Suggested Floors) ================= */
        <div className="space-y-8">
          {/* My Stats with Circular Progress Ring */}
          <section className="space-y-4">
            <h2 className="text-base font-semibold text-[#E5E5E5]">My Stats</h2>
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#262A2A"
                  strokeWidth="7"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold text-[#E5E5E5] leading-none">
                  {overview.severedThisMonth || 0}
                </span>
                <span className="text-[10px] text-[#7A8080] mt-1">
                  Severed this month
                </span>
              </div>
            </div>
          </section>

          {/* Suggested Floors with Rounded-Square Avatars and + Join Links */}
          <section className="space-y-3.5">
            <div>
              <h2 className="text-base font-semibold text-[#E5E5E5]">Suggested Floors</h2>
              <p className="text-[11px] text-[#7A8080]">Popular community items</p>
            </div>

            <div className="space-y-3.5">
              {popularFloors.length === 0 ? (
                <div className="text-xs text-[#7A8080]">No suggestions available.</div>
              ) : (
                popularFloors.map((floor) => {
                  const initials = (floor.name || 'Group').slice(0, 2).toUpperCase();
                  return (
                    <div key={floor._id} className="flex items-center justify-between gap-3">
                      <Link to={`/floors/${floor.slug}`} className="flex items-center gap-3 min-w-0 flex-1 group">
                        <div className="w-8 h-8 rounded-[6px] bg-[#262A2A] flex items-center justify-center text-xs font-semibold text-[#E5E5E5] shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 truncate">
                          <div className="font-bold text-xs text-[#5A7EE6] group-hover:underline truncate font-head">
                            #{floor.name}
                          </div>
                          <div className="text-[10px] text-[#7A8080] truncate">
                            {floor.memberCount} members
                          </div>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleJoinFloor(floor._id, floor.slug)}
                        className={
                          floor.isMember
                            ? "border border-[#1E2D28] text-[#7A8080] hover:text-[#E5E5E5] rounded-full text-xs px-3 py-1 font-medium shrink-0 cursor-pointer transition-colors flex items-center gap-1"
                            : "bg-[#B0E4CC] text-[#091413] hover:opacity-90 font-bold rounded-full text-xs px-3 py-1 shrink-0 cursor-pointer transition-opacity"
                        }
                      >
                        {floor.isMember ? (
                          <>
                            <Check size={12} />
                            <span>Joined</span>
                          </>
                        ) : (
                          '+ Join'
                        )}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Subtle 4-Point Star Accent at Bottom */}
          <div className="pt-6 flex justify-end text-[#7A8080]/30 select-none">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/>
            </svg>
          </div>
        </div>
      ) : (
        /* ================= INNIE RIGHT RAIL (Lumon Tabular Clean View) ================= */
        <div className="space-y-6">
          <section className="space-y-1 pb-6 border-b border-[var(--border)]">
            <div className="text-[42px] leading-tight font-semibold tabular-nums text-[var(--text)] font-head">
              {overview.severedThisMonth.toLocaleString()}
            </div>
            <p className="text-xs text-[var(--muted)]">Severed this month</p>
            {overview.severedByDay && overview.severedByDay.length > 0 && (
              <div className="text-xs tracking-wider text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap pt-2 font-mono">
                {renderMiniBarChart(overview.severedByDay)}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[var(--text)]">Suggested floors</h2>
            <div className="space-y-3">
              {popularFloors.map((floor) => (
                <div key={floor._id} className="flex items-center justify-between gap-2">
                  <Link to={`/floors/${floor.slug}`} className="truncate group cursor-pointer flex-1">
                    <span className="font-medium text-[var(--text)] group-hover:text-[var(--accent)] transition-colors block truncate">
                      #{floor.name}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] block tabular-nums">
                      {floor.memberCount} members
                    </span>
                  </Link>
                  {floor.isMember ? (
                    <span className="text-[11px] text-[var(--muted)] flex items-center gap-1">
                      <Check size={12} /> Joined
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => handleJoinFloor(floor._id, floor.slug)}
                    >
                      Join
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </aside>
  );
}
