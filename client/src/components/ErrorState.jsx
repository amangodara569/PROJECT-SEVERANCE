import AsciiArt from './AsciiArt';

// ErrorState component rendering appropriate ASCII status art with real error text
export default function ErrorState({ status, message, onRetry }) {
  let piece = 'empty-smoking-server';
  let defaultMessage = 'Server connection disrupted. The work is mysterious and important.';

  if (status === 401) {
    piece = 'empty-session-expired';
    defaultMessage = 'Session expired. Log in again.';
  } else if (status === 429) {
    piece = 'empty-rate-limited';
    defaultMessage = 'Too many requests. Please wait a moment before trying again.';
  }

  return (
    <div
      className="p-8 border flex flex-col items-center justify-center text-center space-y-4 font-mono text-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        borderRadius: '2px'
      }}
    >
      <AsciiArt piece={piece} size={12} still={true} tone="muted" />

      <div className="space-y-1">
        <h3 className="font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
          {status ? `STATUS ${status}` : 'COMMUNICATION ERROR'}
        </h3>
        <p className="font-sans text-xs" style={{ color: 'var(--muted)' }}>
          {message || defaultMessage}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1 text-xs uppercase font-semibold border hover:opacity-80"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text)',
            backgroundColor: 'transparent'
          }}
        >
          [ Retry Transmission ]
        </button>
      )}
    </div>
  );
}

