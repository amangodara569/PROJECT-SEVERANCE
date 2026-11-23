import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

// Onboarding card with severance checklist for new users
export default function OnboardingCard({ joinedCount = 0, postCount = 0 }) {
  const { user } = useAuth();
  const { mode } = useMode();
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
    <div className={
      mode === 'outie'
        ? "py-4 px-1 bg-transparent border-0 border-b border-[#1E2D28] space-y-3 text-xs mb-0"
        : "p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-3 text-xs mb-4"
    }>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[var(--muted)] block">Onboarding protocol</span>
          <h3 className={`font-semibold text-sm mt-0.5 ${mode === 'outie' ? 'text-[#5A7EE6] font-head' : 'text-[var(--text)]'}`}>
            Severance readiness checklist ({completedCount}/3 completed)
          </h3>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
          aria-label="Dismiss checklist"
        >
          <X size={14} />
        </button>
      </div>

      <div className="space-y-1.5">
        <Link
          to="/floors"
          className={`flex items-center justify-between p-2 rounded-[var(--radius-sm)] transition-colors ${
            mode === 'outie' ? 'hover:bg-[#121414]' : 'hover:bg-[var(--hover)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {hasJoined3 ? (
              <CheckCircle2 size={16} className={mode === 'outie' ? 'text-[#B0E4CC]' : 'text-[var(--accent)]'} />
            ) : (
              <Circle size={16} className="text-[var(--muted)]" />
            )}
            <span className={hasJoined3 ? 'line-through text-[var(--muted)]' : (mode === 'outie' ? 'text-[#E5E5E5] font-medium' : 'text-[var(--text)] font-medium')}>
              Join 3 company floors ({joinedCount}/3)
            </span>
          </div>
          <span className={`text-xs ${mode === 'outie' ? 'text-[#B0E4CC]' : 'text-[var(--accent)]'}`}>Explore</span>
        </Link>

        <div className={`flex items-center justify-between p-2 rounded-[var(--radius-sm)] transition-colors ${
          mode === 'outie' ? 'hover:bg-[#121414]' : 'hover:bg-[var(--hover)]'
        }`}>
          <div className="flex items-center gap-2.5">
            {hasPosted ? (
              <CheckCircle2 size={16} className={mode === 'outie' ? 'text-[#B0E4CC]' : 'text-[var(--accent)]'} />
            ) : (
              <Circle size={16} className="text-[var(--muted)]" />
            )}
            <span className={hasPosted ? 'line-through text-[var(--muted)]' : (mode === 'outie' ? 'text-[#E5E5E5] font-medium' : 'text-[var(--text)] font-medium')}>
              Share your first post to the feed
            </span>
          </div>
          <span className="text-xs text-[var(--muted)]">Compose above</span>
        </div>

        <Link
          to="/handbook"
          onClick={() => {
            localStorage.setItem('linkedout:handbook-read', 'true');
            setReadHandbook(true);
          }}
          className={`flex items-center justify-between p-2 rounded-[var(--radius-sm)] transition-colors ${
            mode === 'outie' ? 'hover:bg-[#121414]' : 'hover:bg-[var(--hover)]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {readHandbook ? (
              <CheckCircle2 size={16} className={mode === 'outie' ? 'text-[#B0E4CC]' : 'text-[var(--accent)]'} />
            ) : (
              <Circle size={16} className="text-[var(--muted)]" />
            )}
            <span className={readHandbook ? 'line-through text-[var(--muted)]' : (mode === 'outie' ? 'text-[#E5E5E5] font-medium' : 'text-[var(--text)] font-medium')}>
              Read the Community Handbook
            </span>
          </div>
          <span className={`text-xs ${mode === 'outie' ? 'text-[#B0E4CC]' : 'text-[var(--accent)]'}`}>Handbook</span>
        </Link>
      </div>
    </div>
  );
}
