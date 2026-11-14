import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';

// OnboardingCard: Multi-step employee readiness checklist for new accounts
export default function OnboardingCard({ joinedCount = 0, postCount = 0 }) {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('linkedout:onboarding-dismissed') === 'true') {
      setDismissed(true);
    }
  }, []);

  const hasJoined3 = joinedCount >= 3;
  const hasPosted = postCount >= 1;
  const [readHandbook, setReadHandbook] = useState(() => {
    return localStorage.getItem('linkedout:handbook-read') === 'true';
  });

  const completedCount = (hasJoined3 ? 1 : 0) + (hasPosted ? 1 : 0) + (readHandbook ? 1 : 0);

  if (dismissed || completedCount === 3) return null;

  const handleDismiss = () => {
    localStorage.setItem('linkedout:onboarding-dismissed', 'true');
    setDismissed(true);
  };

  return (
    <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] relative font-mono text-xs space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
            // ONBOARDING PROTOCOL
          </span>
          <h3 className="font-bold text-xs text-[var(--color-text-primary)] mt-0.5">
            Severance Readiness Checklist ({completedCount}/3 Completed)
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1"
          aria-label="Dismiss checklist"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-2">
        {/* Step 1: Join 3 floors */}
        <Link
          to="/floors"
          className="flex items-center justify-between p-2 rounded-sm hover:bg-[var(--color-bg-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors"
        >
          <div className="flex items-center gap-2">
            {hasJoined3 ? (
              <CheckCircle2 size={16} className="text-[#007a5a]" />
            ) : (
              <Circle size={16} className="text-[var(--color-text-muted)]" />
            )}
            <span className={hasJoined3 ? 'line-through text-[var(--color-text-muted)]' : 'font-medium text-[var(--color-text-primary)]'}>
              Join 3 company floors ({joinedCount}/3)
            </span>
          </div>
          <span className="text-[10px] text-[var(--color-primary)]">Explore →</span>
        </Link>

        {/* Step 2: Write your first post */}
        <div className="flex items-center justify-between p-2 rounded-sm hover:bg-[var(--color-bg-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors">
          <div className="flex items-center gap-2">
            {hasPosted ? (
              <CheckCircle2 size={16} className="text-[#007a5a]" />
            ) : (
              <Circle size={16} className="text-[var(--color-text-muted)]" />
            )}
            <span className={hasPosted ? 'line-through text-[var(--color-text-muted)]' : 'font-medium text-[var(--color-text-primary)]'}>
              Transmit your first post to the feed
            </span>
          </div>
          <span className="text-[10px] text-[var(--color-text-muted)]">Compose above</span>
        </div>

        {/* Step 3: Read Handbook */}
        <Link
          to="/handbook"
          onClick={() => {
            localStorage.setItem('linkedout:handbook-read', 'true');
            setReadHandbook(true);
          }}
          className="flex items-center justify-between p-2 rounded-sm hover:bg-[var(--color-bg-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors"
        >
          <div className="flex items-center gap-2">
            {readHandbook ? (
              <CheckCircle2 size={16} className="text-[#007a5a]" />
            ) : (
              <Circle size={16} className="text-[var(--color-text-muted)]" />
            )}
            <span className={readHandbook ? 'line-through text-[var(--color-text-muted)]' : 'font-medium text-[var(--color-text-primary)]'}>
              Read the Community Handbook & Protocols
            </span>
          </div>
          <span className="text-[10px] text-[var(--color-primary)]">Handbook →</span>
        </Link>
      </div>
    </Card>
  );
}