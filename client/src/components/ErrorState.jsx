import AsciiArt from './AsciiArt';
import { Button } from '@/components/ui/button';

// Error display: one plain sentence plus one action, no ASCII headline
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
    <div className="py-12 px-4 flex flex-col items-center justify-center text-center space-y-4">
      <AsciiArt piece={piece} size={12} still={true} tone="muted" />

      <p className="text-sm text-[var(--muted)] max-w-md">
        {message || defaultMessage}
      </p>

      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          size="sm"
        >
          Retry
        </Button>
      )}
    </div>
  );
}
