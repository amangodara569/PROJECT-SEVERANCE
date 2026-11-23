import { useState, useEffect, useRef } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import Avatar from './Avatar';
import BreakRoom from './BreakRoom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Expanding composer: compact row transforms to full editor with auto-resizing (80px to 280px) and 2000-char limit
export default function PostComposer({ defaultFloor = '', onPostCreated, initialOpen = false, onCancel }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('vent');
  const [floor, setFloor] = useState(defaultFloor);
  const [floors, setFloors] = useState([]);
  const [breakRoomMsg, setBreakRoomMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef(null);
  const { user } = useAuth();
  const { isInnie } = useMode();

  // Dynamic auto-expansion of post box up to 280px limit
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 280;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 80), maxHeight)}px`;
    }
  }, [body, isOpen]);

  useEffect(() => {
    if ((isOpen || initialOpen) && floors.length === 0) {
      api.get('/floors').then((res) => setFloors(res.data.floors || [])).catch(() => {});
    }
  }, [isOpen, initialOpen, floors.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || body.length > 2000) return;
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
      if (!initialOpen) {
        setIsOpen(false);
      }
      if (onPostCreated) onPostCreated(res.data.post);
    } catch (err) {
      if (err.response?.data?.isBreakRoom) {
        setBreakRoomMsg(err.response.data.error);
      } else {
        alert(err.response?.data?.error || 'Failed to submit post');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsOpen(false);
    }
  };

  const authorName = isInnie ? user?.innieHandle : (user?.name || `@${user?.username || 'user'}`);

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="py-3 px-3 border-b border-[var(--border)] cursor-pointer select-none space-y-2 bg-[var(--surface-card)]"
      >
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="flex-1 bg-[var(--hover)] border border-[var(--border)] px-3 py-2 text-[var(--muted)] rounded-[var(--radius-sm)] text-xs">
            What happened?
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setType('vent'); setIsOpen(true); }}
              className="hover:text-[var(--text)] transition-colors"
            >
              Vent
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setType('question'); setIsOpen(true); }}
              className="hover:text-[var(--text)] transition-colors"
            >
              Ask a question
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setType('hired'); setIsOpen(true); }}
              className="hover:text-[var(--text)] transition-colors"
            >
              I got hired
            </button>
          </div>
          <span className="font-meta">Posting as {authorName}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <BreakRoom message={breakRoomMsg} onClose={() => setBreakRoomMsg('')} />
      <div className="py-4 px-3 border-b border-[var(--border)] space-y-3 bg-[var(--surface-card)]">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar user={user} />
            <span className="text-xs text-[var(--muted)] font-meta">Posting as {authorName}</span>
          </div>

          <Input
            required
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[var(--surface)] border-[var(--border)] text-[var(--text)] text-xs h-9"
          />

          <div className="space-y-1">
            <textarea
              ref={textareaRef}
              required
              rows={3}
              maxLength={2000}
              placeholder="Say it plainly. Max 2000 characters."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full p-3 text-xs bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] resize-none overflow-y-auto font-mono transition-[height] duration-75"
              style={{ minHeight: '80px', maxHeight: '280px' }}
            />
            <div className="flex justify-end">
              <span className={`text-[11px] font-mono tabular-nums ${body.length > 1900 ? 'text-amber-400 font-semibold' : 'text-[var(--muted)]'}`}>
                {body.length} / 2000
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius-sm)] px-2.5 py-1 text-xs"
              >
                <option value="vent">Vent</option>
                <option value="question">Question</option>
                <option value="hired">Hired</option>
              </select>

              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius-sm)] px-2.5 py-1 text-xs"
              >
                <option value="">No floor</option>
                {floors.map((f) => (
                  <option key={f._id} value={f._id}>#{f.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || body.length > 2000}
                variant="default"
                size="sm"
                className="bg-[var(--accent)] text-[var(--accent-ink)] font-bold rounded-full px-4 hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
