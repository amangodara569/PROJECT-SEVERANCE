import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import BreakRoom from './BreakRoom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

// PostComposer: X-style expanding composer with avatar, type chips, and posting identity indicator
export default function PostComposer({ defaultFloor = '', onPostCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('vent');
  const [floor, setFloor] = useState(defaultFloor);
  const [floors, setFloors] = useState([]);
  const [error, setError] = useState('');
  const [breakRoomMsg, setBreakRoomMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { isInnie } = useMode();

  useEffect(() => {
    if (isOpen && floors.length === 0) {
      api.get('/floors')
        .then((res) => setFloors(res.data.floors || []))
        .catch(() => {});
    }
  }, [isOpen, floors.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setError('');
    setBreakRoomMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/posts', {
        title: title.trim(),
        body: body.trim(),
        type,
        floor: floor || null,
        isInnie
      });

      setTitle('');
      setBody('');
      setIsOpen(false);
      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      if (err.response?.data?.isBreakRoom) {
        setBreakRoomMsg(err.response.data.error);
      } else {
        setError(err.response?.data?.error || 'Failed to submit post');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChipClick = (t, e) => {
    e.stopPropagation();
    setType(t);
    setIsOpen(true);
  };

  // Collapsed State: X-Style prompt with avatar, chips, and posting as identity
  if (!isOpen) {
    return (
      <Card
        onClick={() => setIsOpen(true)}
        className="p-3.5 cursor-pointer font-mono text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all select-none space-y-2.5 shadow-xs"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--color-primary)] text-[var(--color-primary-fg)] shrink-0"
          >
            {isInnie ? 'IN' : (user?.username?.[0]?.toUpperCase() || 'U')}
          </div>
          <div className="flex-1 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] px-3 py-2 text-[var(--color-text-muted)] rounded-sm text-xs">
            What happened? Share corporate severance or telemetry...
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)] text-[11px]">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => handleChipClick('vent', e)}
              className="px-2 py-0.5 rounded-sm border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)] text-[var(--color-text-muted)] transition-colors uppercase text-[10px]"
            >
              Vent
            </button>
            <button
              type="button"
              onClick={(e) => handleChipClick('question', e)}
              className="px-2 py-0.5 rounded-sm border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)] text-[var(--color-text-muted)] transition-colors uppercase text-[10px]"
            >
              Question
            </button>
            <button
              type="button"
              onClick={(e) => handleChipClick('hired', e)}
              className="px-2 py-0.5 rounded-sm border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-text-primary)] text-[var(--color-text-muted)] transition-colors uppercase text-[10px]"
            >
              🧇 Hired
            </button>
          </div>

          <span className="text-[10px] text-[var(--color-text-muted)]">
            Posting as <strong className="text-[var(--color-text-primary)]">{isInnie ? user?.innieHandle : `@${user?.username}`}</strong>
          </span>
        </div>
      </Card>
    );
  }

  // Expanded State
  return (
    <>
      <BreakRoom message={breakRoomMsg} onClose={() => setBreakRoomMsg('')} />

      <Card className="p-4 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] font-mono text-xs shadow-md">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-[var(--color-primary)] text-[var(--color-primary-fg)]"
              >
                {isInnie ? 'IN' : (user?.username?.[0]?.toUpperCase() || 'U')}
              </div>
              <span className="text-[11px] font-bold text-[var(--color-text-primary)] uppercase">
                {isInnie ? `Innie (${user?.innieHandle})` : `@${user?.username}`}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsOpen(false)}
              className="text-[11px] uppercase text-[var(--color-text-muted)]"
            >
              Cancel
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Input
              type="text"
              required
              placeholder="Headline / Summary of transmission..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div>
            <Textarea
              required
              rows={4}
              placeholder="Detailed testimony, numbers, severance conditions (phone/email strictly prohibited)..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              {/* Type selector chips */}
              <div className="flex items-center gap-1">
                {['vent', 'question', 'hired'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold transition-colors border ${
                      type === t
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                        : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                    }`}
                    style={{ borderRadius: 'var(--radius-btn)' }}
                  >
                    {t === 'hired' ? '🧇 Hired' : t}
                  </button>
                ))}
              </div>

              {/* Floor selector dropdown */}
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="p-1.5 text-[11px] font-mono bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                style={{ borderRadius: 'var(--radius-input)' }}
              >
                <option value="">(No specific floor)</option>
                {floors.map((f) => (
                  <option key={f._id} value={f._id}>
                    #{f.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              size="sm"
              className="font-mono text-xs uppercase font-semibold"
            >
              {isSubmitting ? 'Transmitting...' : 'Post'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}