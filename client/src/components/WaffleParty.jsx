import AsciiArt from './AsciiArt';

// Full-screen celebration screen shown upon posting a "hired" recovery story
export default function WaffleParty({ onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none transition-opacity duration-500 animate-fadeIn"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ASCII waffle iron open celebration */}
      <div className="mb-6 flex justify-center">
        <AsciiArt piece="waffle-iron-open" size={14} still={false} tone="text" />
      </div>

      <h1 className="font-mono text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase mb-2">
        WAFFLE PARTY
      </h1>

      <p className="font-mono text-sm uppercase tracking-widest mb-10" style={{ color: 'var(--muted)' }}>
        You were reintegrated.
      </p>

      <button
        type="button"
        onClick={onContinue}
        className="px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-bold border transition-colors"
        style={{
          backgroundColor: 'var(--text)',
          color: 'var(--bg)',
          borderColor: 'var(--text)',
          borderRadius: '2px'
        }}
      >
        Continue
      </button>
    </div>
  );
}

