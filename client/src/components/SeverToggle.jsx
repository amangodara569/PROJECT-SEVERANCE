import { useMode } from '../context/ModeContext';

// Animated toggle switch for switching between Outie and Innie worlds
export default function SeverToggle() {
  const { isInnie, toggleMode } = useMode();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isInnie}
      aria-label="Toggle between Outie and Innie mode"
      onClick={toggleMode}
      className={`group relative inline-flex h-7 w-28 items-center rounded-full p-0.5 transition-colors duration-200 border border-[var(--border)] cursor-pointer select-none ${
        isInnie ? 'bg-zinc-900 border-zinc-700' : 'bg-[var(--surface)] hover:border-[var(--muted)]'
      }`}
      title={`Active mode: ${isInnie ? 'Innie (Anonymous)' : 'Outie (Identity)'}. Click to switch.`}
    >
      {/* Sliding thumb pill with active label */}
      <span
        className={`pointer-events-none absolute top-0.5 bottom-0.5 w-[52px] rounded-full bg-[var(--accent)] text-[var(--accent-fg,#000)] font-semibold text-[10px] uppercase tracking-wider flex items-center justify-center shadow-sm transition-transform duration-200 ease-in-out ${
          isInnie ? 'translate-x-[56px]' : 'translate-x-0'
        }`}
      >
        {isInnie ? 'Innie' : 'Outie'}
      </span>

      {/* Subtle background track labels */}
      <div className="flex w-full justify-between px-2 text-[10px] font-medium text-[var(--muted)] pointer-events-none">
        <span className={`transition-opacity duration-200 ${!isInnie ? 'opacity-0' : 'opacity-80'}`}>
          Outie
        </span>
        <span className={`transition-opacity duration-200 ${isInnie ? 'opacity-0' : 'opacity-80'}`}>
          Innie
        </span>
      </div>
    </button>
  );
}
