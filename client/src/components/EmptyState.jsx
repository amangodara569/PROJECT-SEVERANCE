import { Button } from '@/components/ui/button';

// Plain sentence empty state with an optional action
export default function EmptyState({
  message = 'Nothing here yet. The work is mysterious and important.',
  actionLabel,
  onAction
}) {
  return (
    <div className="py-12 px-4 text-center space-y-3">
      <p className="text-sm text-[var(--muted)] leading-relaxed max-w-md mx-auto">
        {message}
      </p>
      {actionLabel && onAction && (
        <div>
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
