// Reusable VoteButtons component for posts and comments
export default function VoteButtons({ score = 0, userVote = 0, onVote }) {
  return (
    <div className="flex flex-col items-center select-none shrink-0 font-mono text-xs">
      {/* Upvote button */}
      <button
        type="button"
        onClick={() => onVote(1)}
        className="p-1 hover:opacity-80 transition-colors border-none bg-transparent"
        style={{ color: userVote === 1 ? 'var(--text)' : 'var(--muted)' }}
        title="Upvote"
      >
        ▲
      </button>

      {/* Net score */}
      <span
        className="font-bold my-0.5 text-xs"
        style={{ color: userVote !== 0 ? 'var(--text)' : 'var(--muted)' }}
      >
        {score}
      </span>

      {/* Downvote button */}
      <button
        type="button"
        onClick={() => onVote(-1)}
        className="p-1 hover:opacity-80 transition-colors border-none bg-transparent"
        style={{ color: userVote === -1 ? 'var(--text)' : 'var(--muted)' }}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}

