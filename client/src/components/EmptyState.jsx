import { Card } from '@/components/ui/card';

export default function EmptyState({ message = 'Nothing here yet. The work is mysterious and important.' }) {
  return (
    <Card className="p-8 text-center font-mono text-xs text-[var(--muted)]">
      <p className="text-sm leading-relaxed">{message}</p>
    </Card>
  );
}
