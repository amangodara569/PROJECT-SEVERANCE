import AsciiArt from './AsciiArt';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BreakRoom({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <Card className="w-full max-w-sm p-6 text-center font-mono space-y-4 shadow-xl border-[var(--border)]">
        <div className="flex justify-center mb-1">
          <AsciiArt piece="hourglass" size={10} still={false} tone="text" />
        </div>

        <h2 className="text-sm font-bold tracking-widest uppercase text-[var(--destructive)] font-mono">
          BREAK ROOM INTERCEPT
        </h2>

        <div className="space-y-3 text-xs leading-relaxed text-[var(--text)]">
          <p>{message}</p>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full font-mono uppercase tracking-wider font-semibold"
          >
            EDIT TRANSMISSION
          </Button>
        </div>
      </Card>
    </div>
  );
}
