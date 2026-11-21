import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Comeback section temporarily disabled with a clean Severance refinement placeholder
export default function Comeback() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-4 text-xs space-y-6">
      <div className="py-4 border-b border-[var(--border)]">
        <h1 className="text-xl font-semibold text-[var(--text)] font-head">
          Comeback
        </h1>
        <p className="text-xs text-[var(--muted)] font-meta mt-1">
          Reintegration and career resumption ledger
        </p>
      </div>

      <div className="py-16 text-center space-y-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6">
        <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent)] mx-auto animate-pulse" />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-[var(--text)] font-head">
            Coming soon
          </h2>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto leading-relaxed">
            This department is currently undergoing refinement. Please enjoy all other floors equally.
          </p>
        </div>
        <div className="pt-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Return to feed
          </Button>
        </div>
      </div>
    </div>
  );
}
