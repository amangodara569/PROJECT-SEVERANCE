import { Button } from '@/components/ui/button';

// Intercept modal for doxxing or language rule checks
export default function BreakRoom({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm p-6 text-center space-y-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]">
        <h2 className="text-base font-semibold text-[var(--text)]">
          Break room
        </h2>

        <p className="text-sm leading-relaxed text-[var(--muted)]">
          {message}
        </p>

        <div className="pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="w-full"
          >
            Edit post
          </Button>
        </div>
      </div>
    </div>
  );
}
