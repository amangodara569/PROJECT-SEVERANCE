import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

// Desktop right sidebar: shows trending company floors and real-time layoff counter
export default function RightSidebar() {
  const [severedCount, setSeveredCount] = useState('--');
  const [floors, setFloors] = useState([]);

  useEffect(() => {
    // Load monthly layoff count
    api.get('/layoffs')
      .then((res) => setSeveredCount(res.data.severedThisMonth?.toLocaleString() || '0'))
      .catch(() => {});

    // Load top floors
    api.get('/floors')
      .then((res) => setFloors((res.data.floors || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 border-l min-h-[calc(100vh-53px)] p-4 gap-6 font-mono text-xs"
      style={{ borderColor: 'var(--border)' }}
    >
      {/* Trending floors box */}
      <div
        className="p-3 border space-y-2"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          borderRadius: '2px'
        }}
      >
        <h3 className="uppercase tracking-widest text-[10px] font-bold" style={{ color: 'var(--muted)' }}>
          Trending Floors
        </h3>

        {floors.length === 0 ? (
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Company floors will appear here.
          </p>
        ) : (
          <div className="space-y-1">
            {floors.map((f) => (
              <div key={f._id} className="flex justify-between items-center text-[11px]">
                <Link to={`/floors/${f.slug}`} className="hover:underline font-semibold" style={{ color: 'var(--text)' }}>
                  {f.name}
                </Link>
                <span style={{ color: 'var(--muted)' }}>{f.members?.length || 0}</span>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/floors"
          className="inline-block pt-1 text-[11px] underline"
          style={{ color: 'var(--text)' }}
        >
          View all floors →
        </Link>
      </div>

      {/* Severed this month box */}
      <div
        className="p-3 border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          borderRadius: '2px'
        }}
      >
        <h3 className="uppercase tracking-widest text-[10px] mb-1 font-bold" style={{ color: 'var(--muted)' }}>
          Severed This Month
        </h3>
        <div className="text-xl font-bold my-1 tracking-wider" style={{ color: 'var(--text)' }}>
          {severedCount}
        </div>
        <p className="text-[10px]" style={{ color: 'var(--muted)' }}>
          Live layoff tracking on the Severed Floor.
        </p>
        <Link
          to="/severed-floor"
          className="inline-block mt-2 text-[11px] underline"
          style={{ color: 'var(--text)' }}
        >
          Open tracker →
        </Link>
      </div>
    </aside>
  );
}
