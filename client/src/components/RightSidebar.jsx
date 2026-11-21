import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

// Secondary right rail with hairline divider and theme v2 tokens
export default function RightSidebar() {
  const [stats, setStats] = useState({ severedThisMonth: 0 });
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    api.get('/stats/overview').then((res) => setStats(res.data)).catch(() => {});
    api.get('/floors').then((res) => setFloors((res.data.floors || []).slice(0, 4))).catch(() => {});
  }, []);

  return (
    <aside className="w-64 p-4 border-l border-[var(--border)] bg-[var(--bg)] text-xs space-y-6 hidden lg:block">
      <div className="space-y-1">
        <div className="text-[42px] leading-tight font-semibold tabular-nums text-[var(--text)] font-head">
          {stats.severedThisMonth.toLocaleString()}
        </div>
        <p className="text-xs text-[var(--muted)]">Severed this month</p>
      </div>

      <div className="space-y-2 pt-4 border-t border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--text)]">Active floors</h3>
        <div className="space-y-1">
          {floors.map((f) => (
            <Link
              key={f._id}
              to={`/floors/${f.slug}`}
              className="flex items-center justify-between p-1.5 hover:bg-[var(--hover)] rounded-[var(--radius-sm)] transition-colors"
            >
              <span className="font-medium text-[var(--text)]">#{f.name}</span>
              <span className="text-[10px] text-[var(--muted)] tabular-nums">{f.memberCount}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
