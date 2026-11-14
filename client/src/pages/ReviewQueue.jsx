import { useState, useEffect } from 'react';
import api from '../api/api';
import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ReviewQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadQueue = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/reports');
      setItems(res.data.queue || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleDismiss = async (targetType, targetId) => {
    try {
      await api.post(`/admin/reports/${targetType}/${targetId}/dismiss`);
      setNotice('Reports dismissed. Transmission restored to feed.');
      setItems((prev) => prev.filter((it) => it._id !== targetId));
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to dismiss reports');
    }
  };

  const handleRemove = async (targetType, targetId) => {
    if (!window.confirm('Sever this transmission permanently from the system?')) return;
    try {
      await api.post(`/admin/reports/${targetType}/${targetId}/remove`);
      setNotice('Transmission permanently deleted.');
      setItems((prev) => prev.filter((it) => it._id !== targetId));
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete transmission');
    }
  };

  if (loading) {
    return (
      <div className="font-mono text-xs py-8 text-center text-[var(--color-text-muted)]">
        Retrieving compliance audit records...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            DISCIPLINARY REVIEW QUEUE
          </h1>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Audit transmissions flagged by community members.
          </p>
        </div>
        <Button
          onClick={loadQueue}
          variant="outline"
          size="xs"
          className="uppercase font-mono"
        >
          [ Refresh ]
        </Button>
      </div>

      {notice && (
        <Card className="p-2.5 font-mono text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
          {notice}
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {items.length === 0 ? (
        <Card
          className="p-8 text-center flex flex-col items-center justify-center space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]"
        >
          <AsciiArt piece="empty-all-caught-up" size={12} still={true} tone="muted" />
          <div className="font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            Queue is clear.
          </div>
          <p className="text-xs italic text-[var(--color-text-muted)]">
            The work is mysterious and important. All transmissions meet Lumon compliance standards.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card
              key={item._id}
              className="p-4 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" size="sm" className="uppercase font-mono text-[10px]">
                    {item.targetType}
                  </Badge>
                  {item.hidden ? (
                    <Badge variant="destructive" size="sm" className="uppercase font-mono text-[10px]">
                      AUTO-HIDDEN (5+ REPORTS)
                    </Badge>
                  ) : (
                    <Badge variant="secondary" size="sm" className="uppercase font-mono text-[10px]">
                      FLAGGED ({item.reportCount} reports)
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  By: {item.authorDisplay}
                </span>
              </div>

              {item.title && (
                <h3 className="font-bold text-xs uppercase text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
              )}

              <p className="text-xs leading-relaxed whitespace-pre-wrap p-2 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)]" style={{ borderRadius: 'var(--radius-card)' }}>
                {item.body}
              </p>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                  Report Reasons:
                </span>
                <ul className="list-disc list-inside text-[11px] text-[var(--color-text-muted)]">
                  {item.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleDismiss(item.targetType, item._id)}
                  className="font-mono text-xs uppercase"
                >
                  Dismiss Reports
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="xs"
                  onClick={() => handleRemove(item.targetType, item._id)}
                  className="font-mono text-xs uppercase"
                >
                  Sever Transmission
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}