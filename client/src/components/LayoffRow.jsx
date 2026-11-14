import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

export default function LayoffRow({ layoff, onConfirm, currentUserId }) {
  const isConfirmed = layoff.confirmedByMe || layoff.isConfirmed;

  return (
    <Card className="p-3.5 flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
      <div className="flex flex-wrap items-center gap-2">
        {layoff.floorSlug ? (
          <Link
            to={`/floors/${layoff.floorSlug}`}
            className="font-bold underline hover:opacity-85 text-[var(--text)]"
          >
            {layoff.company}
          </Link>
        ) : (
          <span className="font-bold text-[var(--text)]">
            {layoff.company}
          </span>
        )}

        <span className="text-[var(--muted)]">·</span>
        <span className="text-[var(--muted)]">{formatDate(layoff.date)}</span>

        <span className="text-[var(--muted)]">·</span>
        <Badge variant="secondary" className="font-mono text-[11px]">
          {layoff.peopleAffected > 0 ? `${layoff.peopleAffected.toLocaleString()} people` : 'Unspecified headcount'}
        </Badge>

        <span className="text-[var(--muted)]">·</span>
        <span className="text-[var(--muted)]">
          Confirmed by {layoff.confirmCount || 0}
        </span>

        {layoff.sourceUrl && (
          <>
            <span className="text-[var(--muted)]">·</span>
            <a
              href={layoff.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-[11px] text-[var(--muted)] hover:text-[var(--text)]"
            >
              [ Source ]
            </a>
          </>
        )}
      </div>

      <div>
        <Button
          type="button"
          disabled={isConfirmed}
          variant={isConfirmed ? "ghost" : "default"}
          size="xs"
          onClick={() => onConfirm && onConfirm(layoff._id)}
          className="uppercase tracking-wider font-mono text-[11px]"
        >
          {isConfirmed ? '✓ Confirmed' : 'Confirm'}
        </Button>
      </div>
    </Card>
  );
}
