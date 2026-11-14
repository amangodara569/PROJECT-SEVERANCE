import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useMode } from '../context/ModeContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RightSidebar() {
  const [severedCount, setSeveredCount] = useState('--');
  const [floors, setFloors] = useState([]);
  const { isInnie } = useMode();

  useEffect(() => {
    api.get('/layoffs')
      .then((res) => setSeveredCount(res.data.severedThisMonth?.toLocaleString() || '0'))
      .catch(() => {});

    api.get('/floors')
      .then((res) => setFloors((res.data.floors || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  return (
    <aside
      className={`hidden lg:flex flex-col w-64 shrink-0 border-l min-h-[calc(100vh-53px)] p-4 gap-4 font-mono text-xs transition-colors ${
        isInnie
          ? 'bg-[#ffffff] border-[#e6e6e6]'
          : 'bg-[#000000] border-[#222222]'
      }`}
    >
      {/* Severed this month box */}
      <Card className="p-3.5 space-y-1">
        <h3 className="uppercase tracking-[0.15em] text-[10px] font-bold text-[var(--muted)]">
          {isInnie ? 'SEVERED WORKFORCE (MONTH)' : 'DISPLACED OPERATORS'}
        </h3>
        <div className={`text-2xl font-black tracking-tight ${isInnie ? 'text-[#4a154b]' : 'text-[#FFC000]'}`}>
          {severedCount}
        </div>
        <p className="text-[10px] text-[var(--muted)]">
          Verified headcount reductions this calendar cycle.
        </p>
      </Card>

      {/* Trending floors box */}
      <Card className="p-3.5 space-y-2.5">
        <h3 className="uppercase tracking-[0.15em] text-[10px] font-bold text-[var(--muted)] flex items-center justify-between">
          <span>{isInnie ? 'ACTIVE FLOORS' : 'ACTIVE SECTORS'}</span>
          <span className="text-[10px] font-normal">{floors.length}</span>
        </h3>

        {floors.length === 0 ? (
          <p className="text-[11px] text-[var(--muted)]">
            Floors loading...
          </p>
        ) : (
          <div className="space-y-2">
            {floors.map((f) => (
              <div key={f._id} className="flex justify-between items-center text-[11px]">
                <Link to={`/floors/${f.slug}`} className="hover:underline font-semibold text-[var(--text)] truncate max-w-[140px]">
                  {isInnie ? `# ${f.slug}` : f.name.toUpperCase()}
                </Link>
                <Badge variant={isInnie ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0">
                  {f.memberCount || 0}
                </Badge>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/floors"
          className={`inline-block pt-1 text-[11px] font-semibold hover:underline ${
            isInnie ? 'text-[#1264a3]' : 'text-[#FFC000]'
          }`}
        >
          {isInnie ? 'Browse all channels →' : 'EXPLORE ALL SECTORS →'}
        </Link>
      </Card>
    </aside>
  );
}
