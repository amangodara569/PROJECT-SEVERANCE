import AsciiArt from './AsciiArt';

// BreakRoom modal: displayed when a submission contains forbidden contact info
export default function BreakRoom({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div
        className="w-full max-w-sm p-6 border text-center font-mono space-y-4"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          borderRadius: '2px'
        }}
      >
        <div className="flex justify-center mb-1">
          <AsciiArt piece="hourglass" size={10} still={false} tone="text" />
        </div>

        <h2 className="text-sm font-bold tracking-widest uppercase">
          BREAK ROOM
        </h2>

        <div className="space-y-3 text-xs leading-relaxed" style={{ color: 'var(--text)' }}>
          <p>{message}</p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-4 text-xs font-mono uppercase tracking-wider font-semibold"
            style={{
              backgroundColor: 'var(--text)',
              color: 'var(--bg)',
              border: '1px solid var(--text)'
            }}
          >
            Edit Post
          </button>
        </div>
      </div>
    </div>
  );
}

