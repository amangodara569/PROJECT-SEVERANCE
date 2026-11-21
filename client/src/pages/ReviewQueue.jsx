import { useState, useEffect } from 'react';
import api from '../api/api';
import AsciiArt from '../components/AsciiArt';
import { Button } from '@/components/ui/button';

// Admin moderation queue with hairline rows and outline Keep and Hide actions
export default function ReviewQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/reports');
      setItems(res.data.queue || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQueue(); }, []);

  const handleDismiss = async (targetType, targetId) => {
    try {
      await api.post(`/admin/reports/${targetType}/${targetId}/dismiss`);
      setNotice('Reports dismissed. Transmission kept on feed.');
      setItems((prev) => prev.filter((it) => it._id !== targetId));
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to dismiss reports');
    }
  };

  const handleRemove = async (targetType, targetId) => {
    try {
      await api.post(`/admin/reports/${targetType}/${targetId}/remove`);
      setNotice('Transmission hidden from feed.');
      setItems((prev) => prev.filter((it) => it._id !== targetId));
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to hide transmission');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 text-xs">
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
        <div>
          <h1 className="text-base font-semibold text-[var(--text)] font-head">Review queue</h1>
          <p className="text-xs text-[var(--muted)]">Audit transmissions flagged by the community.</p>
        </div>
        <Button onClick={loadQueue} variant="outline" size="xs">
          Refresh
        </Button>
      </div>

      {notice && (
        <div className="p-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[var(--text)]">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="py-8 text-center text-[var(--muted)]">Loading audit records...</div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
          <AsciiArt piece="empty-all-caught-up" size={12} still={true} tone="muted" />
          <p className="text-sm text-[var(--muted)]">Queue is clear.</p>
        </div>
      ) : (
        <div className="border-t border-[var(--border)]">
          {items.map((item) => (
            <div key={item._id} className="py-4 px-2 border-b border-[var(--border)] space-y-2 hover:bg-[var(--hover)] transition-colors">
              <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                <span className="font-medium text-[var(--text)]">{item.targetType} by {item.authorDisplay}</span>
                <span>{item.reportCount} reports</span>
              </div>

              {item.title && <h2 className="font-medium text-sm text-[var(--text)]">{item.title}</h2>}
              <p className="text-xs text-[var(--text)] bg-[var(--surface)] p-2 rounded-[var(--radius-sm)] border border-[var(--border)] whitespace-pre-wrap">
                {item.body}
              </p>

              {item.reasons && item.reasons.length > 0 && (
                <div className="text-[11px] text-[var(--muted)]">
                  Reasons: {item.reasons.join(', ')}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleDismiss(item.targetType, item._id)}
                >
                  Keep
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleRemove(item.targetType, item._id)}
                >
                  Hide
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
