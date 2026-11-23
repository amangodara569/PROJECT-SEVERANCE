import { Link } from 'react-router-dom';
import { ExternalLink, Check, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMode } from '../context/ModeContext';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// Layoff item formatted with decoupled Outie (borderless + single horizontal divider) and Innie (card) architectures
export default function LayoffRow({ layoff, onConfirm }) {
  const { mode } = useMode();
  const isConfirmed = layoff.confirmedByMe || layoff.isConfirmed;
  const floorTarget = layoff.floorSlug ? `/floors/${layoff.floorSlug}` : `/floors`;

  if (mode === 'outie') {
    return (
      <article className="py-5 px-1 border-b border-[#1E2D28] space-y-3 text-xs bg-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#2A835F] font-head">
              <Link to={floorTarget} className="hover:underline transition-colors">
                {layoff.company}
              </Link>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-[#7A8080] font-meta mt-1">
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

          {/* Confirm report button commented out per design updates */}
          {/*
          <div>
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#B0E4CC] font-medium px-2.5 py-1">
                <Check size={13} />
                <span>Confirmed</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onConfirm && onConfirm(layoff._id)}
                className="text-xs text-[#B0E4CC] hover:underline font-medium px-2.5 py-1 cursor-pointer"
              >
                Confirm report
              </button>
            )}
          </div>
          */}
        </div>

        {/* Unspecified scale, confirmed by, and source link commented out per design updates */}
        {/*
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs text-[#7A8080]">
          <div className="flex items-center gap-4">
            <span className="font-meta tabular-nums text-[#E5E5E5] font-medium flex items-center gap-1.5">
              <Users size={13} className="text-[#7A8080]" />
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
              className="inline-flex items-center gap-1 text-[#7A8080] hover:text-[#E5E5E5] underline text-[11px]"
            >
              <span>Source</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        */}
      </article>
    );
  }

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

        {/* Confirm report button commented out per design updates */}
        {/*
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
        */}
      </div>

      {/* Unspecified scale, confirmed by, and source link commented out per design updates */}
      {/*
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
      */}
    </article>
  );
}