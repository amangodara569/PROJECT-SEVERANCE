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
      <Card
        onClick={() => setIsOpen(true)}
        className="p-3.5 cursor-pointer font-mono text-xs flex flex-row items-center justify-between hover:border-[var(--border-focus)] transition-all select-none"
      >
        <span className="text-[var(--muted)]">
          {isInnie ? '💬 Message #general (Share your transition...)' : 'TRANSMIT EXPERIENCE (Report restructuring...)'}
        </span>
        <Badge variant={isInnie ? 'default' : 'outline'} className="text-[10px]">
          {isInnie ? `Innie: ${user?.innieHandle}` : `@${user?.username}`}
        </Badge>
      </Card>
    );
  }

  return (
    <>
      <BreakRoom message={breakRoomMsg} onClose={() => setBreakRoomMsg('')} />

      <Card className="p-4 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-[var(--text)]">
              {isInnie ? 'New Transmission to Floor' : 'DISPATCH TRANSMISSION'}
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setIsOpen(false)}
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
              placeholder={isInnie ? "Topic headline..." : "INCIDENT / TOPIC HEADLINE"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <Textarea
              required
              rows={4}
              placeholder="Tell your story honestly (raw language allowed; no phone numbers or personal emails)..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              style={{
                borderRadius: 'var(--radius-input)',
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
              className="p-2 text-xs font-mono border outline-none"
            >
              <option value="">Global Feed (All)</option>
              {floors.map((f) => (
                <option key={f._id} value={f._id}>
                  {isInnie ? `# ${f.slug}` : f.name.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{
                borderRadius: 'var(--radius-input)',
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
              className="p-2 text-xs font-mono border outline-none"
            >
              <option value="vent">Vent</option>
              <option value="solidarity">Solidarity</option>
              <option value="advice">Advice</option>
              <option value="hired">Hired (Comeback)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <span className="font-mono text-[11px] text-[var(--muted)]">
              Author: <strong className="text-[var(--text)]">{isInnie ? user?.innieHandle : `@${user?.username}`}</strong>
            </span>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="default"
              size="sm"
            >
              {isSubmitting ? 'TRANSMITTING...' : isInnie ? 'Send Transmission' : 'DISPATCH RECORD'}
            </Button>
          </div>

          {isInnie && (
            <p className="font-mono text-[11px] leading-relaxed pt-1 text-[var(--muted)]">
              Innie pseudonymity protects your real username and email. Platform safety guidelines apply.
            </p>
          )}
        </form>
      </Card>
    </>
  );
}
