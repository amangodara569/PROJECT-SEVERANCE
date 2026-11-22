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
        <section className="space-y-3 pb-6 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text)]">About this floor</h2>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {currentFloor.description || 'People who worked at this floor, talking about what happened and what comes next.'}
          </p>
          <div className="text-xs text-[var(--muted)]">
            {currentFloor.memberCount || 1} members
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleJoinFloor(currentFloor._id, currentFloor.slug)}
            className="w-full"
          >
            {currentFloor.isMember ? 'Joined' : 'Join floor'}
          </Button>

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

      {/* Severed This Month: 42px tabular number with sentence-case label below */}
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

      {/* Suggested floors */}
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
    </aside>
  );
}
