import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import Avatar from './Avatar';
import BreakRoom from './BreakRoom';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Expanding composer: compact row on focus transforms to full post editor, or direct full editor if initialOpen=true
export default function PostComposer({ defaultFloor = '', onPostCreated, initialOpen = false, onCancel }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('vent');
  const [floor, setFloor] = useState(defaultFloor);
  const [floors, setFloors] = useState([]);
  const [breakRoomMsg, setBreakRoomMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { isInnie } = useMode();

  useEffect(() => {
    if ((isOpen || initialOpen) && floors.length === 0) {
      api.get('/floors').then((res) => setFloors(res.data.floors || [])).catch(() => {});
    }
  }, [isOpen, initialOpen, floors.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
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
        className="py-3 px-3 border-b border-[var(--border)] cursor-pointer select-none space-y-2"
      >
        <div className="flex items-center gap-3">
          <Avatar user={user} />
          <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] px-3 py-2 text-[var(--muted)] rounded-[var(--radius-sm)] text-xs">
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
          <span>Posting as {authorName}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <BreakRoom message={breakRoomMsg} onClose={() => setBreakRoomMsg('')} />
      <div className="py-4 px-3 border-b border-[var(--border)] space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2">
            <Avatar user={user} />
            <span className="text-xs text-[var(--muted)]">Posting as {authorName}</span>
          </div>

          <Input
            required
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            required
            rows={3}
            placeholder="Say it plainly."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />

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
              <Button type="submit" disabled={isSubmitting} variant="default" size="sm">
                {isSubmitting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
