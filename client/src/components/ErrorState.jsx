import AsciiArt from './AsciiArt';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    <Card className="p-8 flex flex-col items-center justify-center text-center space-y-4 font-mono text-xs">
      <AsciiArt piece={piece} size={12} still={true} tone="muted" />

      <div className="space-y-1">
        <h3 className="font-bold uppercase tracking-wider text-[var(--destructive)] font-mono">
          {status ? `STATUS ${status}` : 'COMMUNICATION ERROR'}
        </h3>
        <p className="text-xs text-[var(--muted)]">
          {message || defaultMessage}
        </p>
      </div>

      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          size="xs"
          className="uppercase font-semibold font-mono"
        >
          [ Retry Transmission ]
        </Button>
      )}
    </Card>
  );
}
