import { Link } from 'react-router-dom';

// Format date to YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toISOString().split('T')[0];
};

// LayoffRow component representing a single tracked corporate reduction
export default function LayoffRow({ layoff, onConfirm, currentUserId }) {
  const isConfirmed = layoff.confirmedBy?.some((id) => (id?._id || id) === currentUserId);

  return (
    <div
      className="p-3 border flex flex-wrap items-center justify-between gap-3 font-mono text-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        borderRadius: '2px'
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        {/* Company name, linked to floor if one exists */}
        {layoff.floorSlug ? (
          <Link
            to={`/floors/${layoff.floorSlug}`}
            className="font-bold underline hover:opacity-80"
            style={{ color: 'var(--text)' }}
          >
            {layoff.company}
          </Link>
        ) : (
          <span className="font-bold" style={{ color: 'var(--text)' }}>
            {layoff.company}
          </span>
        )}

        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>{formatDate(layoff.date)}</span>

        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--text)' }}>
          {layoff.peopleAffected > 0 ? `${layoff.peopleAffected.toLocaleString()} people` : 'Unspecified headcount'}
        </span>

        <span style={{ color: 'var(--muted)' }}>·</span>
        <span style={{ color: 'var(--muted)' }}>
          Confirmed by {layoff.confirmCount || 0}
        </span>

        {layoff.sourceUrl && (
          <>
            <span style={{ color: 'var(--muted)' }}>·</span>
            <a
              href={layoff.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="underline text-[11px]"
              style={{ color: 'var(--muted)' }}
            >
              [ Source ]
            </a>
          </>
        )}
      </div>

      <div>
        <button
          type="button"
          disabled={isConfirmed}
          onClick={() => onConfirm && onConfirm(layoff._id)}
          className="px-2.5 py-1 text-[11px] uppercase tracking-wider border font-mono"
          style={{
            backgroundColor: isConfirmed ? 'transparent' : 'var(--text)',
            color: isConfirmed ? 'var(--muted)' : 'var(--bg)',
            borderColor: 'var(--border)',
            opacity: isConfirmed ? 0.6 : 1
          }}
        >
          {isConfirmed ? 'Confirmed' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}

