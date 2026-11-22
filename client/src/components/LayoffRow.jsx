import { Link } from 'react-router-dom';
import { ExternalLink, Check, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// Layoff item formatted as an elevated card with structured metadata and spacing
export default function LayoffRow({ layoff, onConfirm }) {
  const isConfirmed = layoff.confirmedByMe || layoff.isConfirmed;
  const floorTarget = layoff.floorSlug ? `/floors/${layoff.floorSlug}` : `/floors`;

  return (
    <article className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--muted)] transition-all space-y-3 text-xs shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--text)] font-head">
            <Link to={floorTarget} className="hover:text-[var(--accent)] hover:underline transition-colors">
              {layoff.company}
            </Link>
          </h2>
          <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] font-meta mt-1">
            <Calendar size={12} className="shrink-0" />
            <span>{formatDate(layoff.date)}</span>
            {layoff.note && (
              <>
                <span>•</span>
                <span className="truncate max-w-xs">{layoff.note}</span>
              </>
            )}
          </div>
        </div>

        <div>
          {isConfirmed ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] px-2.5 py-1 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)]">
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
              Confirm report
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <span className="font-meta tabular-nums text-[var(--text)] font-medium flex items-center gap-1.5">
            <Users size={13} className="text-[var(--muted)]" />
            {layoff.peopleAffected > 0 ? `${layoff.peopleAffected.toLocaleString()} personnel affected` : 'Unspecified scale'}
          </span>

          <span className="text-[11px]">
            Confirmed by {layoff.confirmCount || 0}
          </span>
        </div>

        {layoff.sourceUrl && (
          <a
            href={layoff.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[var(--muted)] hover:text-[var(--text)] underline text-[11px]"
          >
            <span>Source</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </article>
  );
}