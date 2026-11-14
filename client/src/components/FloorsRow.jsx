import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

// FloorsRow: Horizontal scrolling community stories strip
export default function FloorsRow({ floors = [], suggestedFloors = [] }) {
  const displayFloors = floors.length > 0 ? floors : suggestedFloors;

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none font-mono text-xs">
      <div className="flex items-center gap-2.5 min-w-max">
        {/* + Add / Explore card */}
        <Link
          to="/floors"
          className="w-20 h-24 p-2 flex flex-col items-center justify-center text-center border border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg-subtle)] transition-colors shrink-0"
          style={{ borderRadius: 'var(--radius-card)' }}
        >
          <div
            className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] mb-1"
          >
            <Plus size={16} />
          </div>
          <span className="text-[10px] font-bold text-[var(--color-text-primary)]">Explore</span>
        </Link>

        {/* Floor Story Cards */}
        {displayFloors.map((floor) => {
          const initials = floor.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <Link
              key={floor._id}
              to={`/floors/${floor.slug}`}
              className="w-20 h-24 p-2 flex flex-col items-center justify-between text-center border border-[var(--color-border)] hover:border-[var(--color-primary)] bg-[var(--color-bg-card)] transition-colors shrink-0 group shadow-xs"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              <div
                className="w-9 h-9 border border-[var(--color-border)] group-hover:border-[var(--color-primary)] flex items-center justify-center font-bold text-xs bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]"
                style={{ borderRadius: 'var(--radius-btn)' }}
              >
                {initials}
              </div>
              <div className="w-full">
                <span className="text-[10px] font-bold block truncate text-[var(--color-text-primary)]">
                  {floor.name}
                </span>
                <span className="text-[9px] text-[var(--color-text-muted)] block truncate">
                  {floor.memberCount || 1}m
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}