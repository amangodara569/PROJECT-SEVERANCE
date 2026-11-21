import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

// Horizontal scrolling strip for community floors
export default function FloorsRow({ floors = [], suggestedFloors = [] }) {
  const displayFloors = floors.length > 0 ? floors : suggestedFloors;

  return (
    <div className="w-full overflow-x-auto pb-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-max">
        {/* Explore Card */}
        <Link
          to="/floors"
          className="w-20 h-24 p-2 flex flex-col items-center justify-center text-center border border-dashed border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface)] rounded-[var(--radius)] transition-colors shrink-0"
        >
          <div className="w-8 h-8 rounded-[var(--radius-sm)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] mb-1">
            <Plus size={16} />
          </div>
          <span className="text-[11px] font-medium text-[var(--text)]">Explore</span>
        </Link>

        {/* Floor Cards */}
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
              className="w-20 h-24 p-2 flex flex-col items-center justify-between text-center border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--surface)] rounded-[var(--radius)] transition-colors shrink-0 group"
            >
              <div className="w-9 h-9 border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center font-medium text-xs bg-[var(--accent-soft)] text-[var(--accent)] rounded-[var(--radius-sm)]">
                {initials}
              </div>
              <div className="w-full">
                <span className="text-[11px] font-medium block truncate text-[var(--text)]">
                  {floor.name}
                </span>
                <span className="text-[10px] text-[var(--muted)] block truncate">
                  {floor.memberCount || 1} members
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
