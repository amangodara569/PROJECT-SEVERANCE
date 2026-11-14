import { useMode } from '../context/ModeContext';

export default function VoteButtons({ score = 0, userVote = 0, onVote }) {
  const { isInnie } = useMode();

  return (
    <div className="flex flex-col items-center select-none shrink-0 font-mono text-xs">
      <button
        type="button"
        onClick={() => onVote(1)}
        className={`p-1 transition-colors cursor-pointer text-xs ${
          userVote === 1
            ? (isInnie ? 'text-[#4a154b] font-bold' : 'text-[#FFC000] font-black scale-110')
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
        title="Upvote"
      >
        ▲
      </button>

      <span
        className={`font-mono font-bold my-0.5 text-xs ${
          userVote !== 0
            ? (isInnie ? 'text-[#4a154b]' : 'text-[#FFC000]')
            : 'text-[var(--muted)]'
        }`}
      >
        {score}
      </span>

      <button
        type="button"
        onClick={() => onVote(-1)}
        className={`p-1 transition-colors cursor-pointer text-xs ${
          userVote === -1
            ? (isInnie ? 'text-[#4a154b] font-bold' : 'text-[#29ABE2] font-black scale-110')
            : 'text-[var(--muted)] hover:text-[var(--text)]'
        }`}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}
