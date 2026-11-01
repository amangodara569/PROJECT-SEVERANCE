import { useState, useEffect } from 'react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import BreakRoom from './BreakRoom';

// PostComposer component: creates vents, questions, and hired posts with Break Room safety
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

  // Load floors for dropdown when composer opens
  useEffect(() => {
    if (isOpen && floors.length === 0) {
      api.get('/floors')
        .then((res) => setFloors(res.data.floors || []))
        .catch(() => {});
    }
  }, [isOpen, floors.length]);

  // Handle post creation with Break Room intercept
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setError('');
    setBreakRoomMsg('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/posts', {
        title,
        body,
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

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="p-3 border cursor-pointer font-mono text-xs flex items-center justify-between"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}
      >
        <span style={{ color: 'var(--muted)' }}>What happened? (Share your story...)</span>
        <span className="text-[10px] px-2 py-0.5 border" style={{ borderColor: 'var(--border)' }}>
          {isInnie ? `Innie: ${user?.innieHandle}` : `@${user?.username}`}
        </span>
      </div>
    );
  }

  return (
    <>
      <BreakRoom message={breakRoomMsg} onClose={() => setBreakRoomMsg('')} />

      <form
        onSubmit={handleSubmit}
        className="p-4 border space-y-3"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs uppercase tracking-wider font-bold">Write Post</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="font-mono text-[11px] hover:underline bg-transparent border-none"
            style={{ color: 'var(--muted)' }}
          >
            Cancel
          </button>
        </div>

        {error && (
          <div className="p-2 text-xs border font-mono" style={{ borderColor: 'var(--border)' }}>
            {error}
          </div>
        )}

        <input
          type="text"
          required
          placeholder="Post Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 text-xs font-mono border outline-none bg-transparent"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        />

        <textarea
          required
          placeholder="Tell your story honestly (swear all you want; no phone numbers or emails)..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full p-2 text-xs border outline-none bg-transparent h-24"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        />

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="p-1.5 text-xs font-mono border bg-transparent"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="" style={{ background: 'var(--bg)' }}>No Floor (All)</option>
            {floors.map((f) => (
              <option key={f._id} value={f._id} style={{ background: 'var(--bg)' }}>
                Floor: {f.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="p-1.5 text-xs font-mono border bg-transparent"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            <option value="vent" style={{ background: 'var(--bg)' }}>Vent</option>
            <option value="question" style={{ background: 'var(--bg)' }}>Question</option>
            <option value="hired" style={{ background: 'var(--bg)' }}>Hired (Comeback)</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <span className="font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
            Posting as: <strong style={{ color: 'var(--text)' }}>{isInnie ? user?.innieHandle : `@${user?.username}`}</strong>
          </span>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-1.5 font-mono text-xs uppercase tracking-wider font-semibold"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </>
  );
}
