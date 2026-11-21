import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// Layoff row with company link, date, tabular people count, and confirm state
export default function LayoffRow({ layoff, onConfirm }) {
  const isConfirmed = layoff.confirmedByMe || layoff.isConfirmed;
  const floorTarget = layoff.floorSlug ? `/floors/${layoff.floorSlug}` : `/floors`;

  return (
    <div className="py-3 px-3 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-[var(--hover)] transition-colors">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={floorTarget}
          className="font-medium text-[var(--text)] hover:underline"
        >
          {layoff.company}
        </Link>

        <span className="text-[var(--muted)] font-meta">{formatDate(layoff.date)}</span>

        <span className="font-meta tabular-nums text-[var(--text)]">
          {layoff.peopleAffected > 0 ? `${layoff.peopleAffected.toLocaleString()} people affected` : 'Unspecified'}
        </span>

        <span className="text-[var(--muted)]">
          Confirmed by {layoff.confirmCount || 0}
        </span>

        {layoff.sourceUrl && (
          <a
            href={layoff.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--muted)] hover:text-[var(--text)] underline text-[11px]"
          >
            Source
          </a>
        )}
      </div>

      <div>
        {isConfirmed ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            <span>Confirmed</span>
          </span>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => onConfirm && onConfirm(layoff._id)}
          >
            Confirm
          </Button>
        )}
      </div>
    </div>
  );
}
