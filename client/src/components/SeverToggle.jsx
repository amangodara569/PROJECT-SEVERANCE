import { useMode } from '../context/ModeContext';

// SeverToggle allows switching between Outie and Innie modes
// Inverts colors across the entire app by toggling the .innie CSS class
export default function SeverToggle() {
  const { mode, isInnie, toggleMode } = useMode();

  return (
    <div className="flex flex-col items-center">
      {/* Two-part switch container */}
      <div
        className="flex items-center border font-mono text-xs overflow-hidden"
        style={{ borderColor: 'var(--border)', borderRadius: '2px' }}
      >
        <button
          type="button"
          onClick={() => isInnie && toggleMode()}
          className="px-2 py-1 tracking-wider uppercase border-none"
          style={{
            backgroundColor: !isInnie ? 'var(--text)' : 'transparent',
            color: !isInnie ? 'var(--bg)' : 'var(--muted)',
            borderRadius: 0
          }}
        >
          OUTIE
        </button>

        <button
          type="button"
          onClick={() => !isInnie && toggleMode()}
          className="px-2 py-1 tracking-wider uppercase border-none"
          style={{
            backgroundColor: isInnie ? 'var(--text)' : 'transparent',
            color: isInnie ? 'var(--bg)' : 'var(--muted)',
            borderRadius: 0
          }}
        >
          INNIE
        </button>
      </div>

      {/* Status indicator under toggle */}
      <span className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--muted)' }}>
        {isInnie ? 'You are Innie' : 'You are Outie'}
      </span>
    </div>
  );
}

