import { useState, useEffect } from 'react';
import api from '../api/api';
import LayoffRow from '../components/LayoffRow';
import { useAuth } from '../context/AuthContext';
import AsciiCustom from '../components/AsciiCustom';
import AsciiArt from '../components/AsciiArt';
import severedCounter from '../ascii/pieces/severed-counter';
import severedBoard from '../ascii/pieces/severed-board';

// The Severed Floor: real-time corporate layoff tracker and verification hub
export default function SeveredFloor() {
  const [layoffs, setLayoffs] = useState([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [company, setCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [peopleAffected, setPeopleAffected] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const { user } = useAuth();

  // Load layoffs list and monthly totals
  const fetchLayoffs = async (q = '') => {
    try {
      const res = await api.get(`/layoffs${q ? `?company=${q}` : ''}`);
      setLayoffs(res.data.layoffs || []);
      setMonthlyCount(res.data.severedThisMonth || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoffs(search);
  }, [search]);

  // Submit a new layoff report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.trim()) return;
    setError('');

    try {
      await api.post('/layoffs', {
        company,
        date,
        peopleAffected: Number(peopleAffected) || 0,
        sourceUrl,
        note
      });
      setCompany('');
      setPeopleAffected('');
      setSourceUrl('');
      setNote('');
      setShowAddForm(false);
      fetchLayoffs(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report');
    }
  };

  // Confirm a layoff report
  const handleConfirm = async (id) => {
    try {
      const res = await api.post(`/layoffs/${id}/confirm`);
      setLayoffs((prev) =>
        prev.map((l) => (l._id === id ? { ...l, confirmCount: res.data.confirmCount } : l))
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to confirm');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tracker Header */}
      <div className="p-6 border text-center space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}>
        <h1 className="font-mono text-sm tracking-widest uppercase font-bold" style={{ color: 'var(--muted)' }}>
          THE SEVERED FLOOR
        </h1>
        <div className="flex justify-center my-2">
          <AsciiCustom make={severedCounter} options={{ value: monthlyCount }} size={12} />
        </div>
        <div className="font-mono text-xs uppercase" style={{ color: 'var(--muted)' }}>
          Severed this month: <strong style={{ color: 'var(--text)' }}>{monthlyCount.toLocaleString()}</strong>
        </div>
        <div className="flex justify-center overflow-x-auto pt-2">
          <AsciiCustom make={severedBoard} options={{ rows: layoffs }} size={10} still={true} tone="muted" />
        </div>
      </div>

      {/* Controls: Search and Add Button */}
      <div className="flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder="Search company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 text-xs font-mono border outline-none bg-transparent"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-2 text-xs font-mono uppercase font-semibold border whitespace-nowrap"
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
        >
          {showAddForm ? 'Close' : 'Add Report'}
        </button>
      </div>

      {/* Inline Add Report Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 border space-y-3 font-mono text-xs" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}>
          <h2 className="text-xs uppercase font-bold tracking-wider">Report Workforce Reduction</h2>
          {error && <div className="p-2 border" style={{ borderColor: 'var(--border)' }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input required placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input type="number" placeholder="People Affected (Optional)" value={peopleAffected} onChange={(e) => setPeopleAffected(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
            <input type="url" placeholder="Source URL (Article / Notice)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>
          <textarea placeholder="Brief notes or departments impacted..." value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border outline-none bg-transparent h-16 font-sans text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
          <button type="submit" className="px-4 py-1.5 uppercase font-semibold" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
            Publish Layoff Report
          </button>
        </form>
      )}

      {/* Layoff Rows List */}
      {loading ? (
        <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : layoffs.length === 0 ? (
        <div
          className="p-8 text-center border font-mono text-xs flex flex-col items-center justify-center space-y-3"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--muted)',
            backgroundColor: 'var(--surface)',
            borderRadius: '2px'
          }}
        >
          <AsciiArt piece="empty-no-results" size={12} still={true} tone="muted" />
          <p>No layoffs reported for this query. The work is mysterious and important.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {layoffs.map((l) => (
            <LayoffRow key={l._id} layoff={l} onConfirm={handleConfirm} currentUserId={user?._id} />
          ))}
        </div>
      )}
    </div>
  );
}
