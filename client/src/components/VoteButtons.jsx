// Vertical voting arrows and score
export default function VoteButtons({ score = 0, userVote = 0, onVote }) {
  return (
    <div className="flex flex-col items-center select-none shrink-0 text-xs">
      <button
        type="button"
        onClick={() => onVote(1)}
        className={`p-1 cursor-pointer transition-colors text-xs ${
          userVote === 1
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
        title="Upvote"
        aria-label="Upvote"
      >
        ▲
      </button>

      <span className="my-0.5 text-xs tabular-nums text-[var(--text)] font-medium">
        {score}
      </span>

      <button
        type="button"
        onClick={() => onVote(-1)}
        className={`p-1 cursor-pointer transition-colors text-xs ${
          userVote === -1
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
        title="Downvote"
        aria-label="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
