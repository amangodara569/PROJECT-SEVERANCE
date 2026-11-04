import { useState, useEffect } from 'react';
import api from '../api/api';
import AsciiArt from '../components/AsciiArt';

// ReviewQueue: Admin review dashboard for reported posts and comments
export default function ReviewQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Fetch flagged transmissions from admin endpoint
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

  // Dismiss reports and unhide item
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

  // Permanently delete flagged item
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
      <div className="font-mono text-xs py-8 text-center" style={{ color: 'var(--muted)' }}>
        Retrieving compliance audit records...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl font-mono text-xs">
      <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
            DISCIPLINARY REVIEW QUEUE
          </h1>
          <p className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Audit transmissions flagged by community members.
          </p>
        </div>
        <button
          onClick={loadQueue}
          className="px-2.5 py-1 text-[11px] border uppercase hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        >
          [ Refresh ]
        </button>
      </div>

      {notice && (
        <div className="p-2.5 border text-xs font-mono" style={{ borderColor: 'var(--text)', color: 'var(--text)', backgroundColor: 'var(--surface)' }}>
          {notice}
        </div>
      )}

      {error && (
        <div className="p-3 border text-xs" style={{ borderColor: 'red', color: 'red' }}>
          {error}
        </div>
      )}

      {items.length === 0 ? (
        <div
          className="p-8 border text-center flex flex-col items-center justify-center space-y-3"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}
        >
          <AsciiArt piece="empty-all-caught-up" size={12} still={true} tone="muted" />
          <div className="font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
            Queue is clear.
          </div>
          <p className="font-sans text-xs italic" style={{ color: 'var(--muted)' }}>
            The work is mysterious and important. All transmissions meet Lumon compliance standards.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="p-4 border space-y-3"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold border" style={{ borderColor: 'var(--border)' }}>
                    {item.targetType}
                  </span>
                  {item.hidden ? (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold" style={{ backgroundColor: 'red', color: 'white' }}>
                      AUTO-HIDDEN (5+ REPORTS)
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold border" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      FLAGGED ({item.reportCount} reports)
                    </span>
                  )}
                </div>
                <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
                  By: {item.authorDisplay}
                </span>
              </div>

              {item.title && (
                <h3 className="font-bold text-xs uppercase" style={{ color: 'var(--text)' }}>
                  {item.title}
                </h3>
              )}

              <p className="font-sans text-xs leading-relaxed whitespace-pre-wrap p-2 border" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                {item.body}
              </p>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold" style={{ color: 'var(--muted)' }}>
                  Report Reasons:
                </span>
                <ul className="list-disc list-inside text-[11px] font-sans" style={{ color: 'var(--muted)' }}>
                  {item.reasons.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <button
                  type="button"
                  onClick={() => handleDismiss(item.targetType, item._id)}
                  className="px-3 py-1 text-xs uppercase font-semibold border hover:opacity-80"
                  style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
                >
                  Dismiss Reports
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(item.targetType, item._id)}
                  className="px-3 py-1 text-xs uppercase font-semibold hover:opacity-80"
                  style={{ backgroundColor: 'red', color: 'white' }}
                >
                  Sever Transmission
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

