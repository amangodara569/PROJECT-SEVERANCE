import { useMode } from '../context/ModeContext';

// Two-segment control for toggling Outie and Innie worlds
export default function SeverToggle() {
  const { isInnie, toggleMode } = useMode();

  return (
    <div className="inline-flex items-center p-0.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] select-none text-xs">
      <button
        type="button"
        onClick={isInnie ? toggleMode : undefined}
        className="sever-segment sever-outie"
      >
        Outie
      </button>
      <button
        type="button"
        onClick={!isInnie ? toggleMode : undefined}
        className="sever-segment sever-innie"
      >
        Innie
      </button>
    </div>
  );
}
