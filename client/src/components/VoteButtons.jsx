import { ArrowBigUp, ArrowBigDown } from 'lucide-react';

// Vertical voting arrows with Lucide icons and score delta
export default function VoteButtons({ score = 0, userVote = 0, onVote }) {
  return (
    <div className="flex flex-col items-center select-none shrink-0 text-xs">
      <button
        type="button"
        onClick={() => onVote(userVote === 1 ? 0 : 1)}
        className={`p-1 cursor-pointer transition-colors rounded hover:bg-[var(--hover)] ${
          userVote === 1
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
        title="Upvote"
        aria-label="Upvote"
      >
        <ArrowBigUp size={18} fill={userVote === 1 ? 'currentColor' : 'none'} />
      </button>

      <span className="my-0.5 text-xs tabular-nums text-[var(--text)] font-semibold">
        {score}
      </span>

      <button
        type="button"
        onClick={() => onVote(userVote === -1 ? 0 : -1)}
        className={`p-1 cursor-pointer transition-colors rounded hover:bg-[var(--hover)] ${
          userVote === -1
            ? 'text-[var(--accent)] font-semibold'
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
        title="Downvote"
        aria-label="Downvote"
      >
        <ArrowBigDown size={18} fill={userVote === -1 ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
}
