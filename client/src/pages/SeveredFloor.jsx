import { useState, useEffect } from 'react';
import { Search, Plus, X } from 'lucide-react';
import api from '../api/api';
import LayoffRow from '../components/LayoffRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMode } from '../context/ModeContext';

// Renders 30-day sparkline only if daily data points are returned by API
const renderSparkline = (numbers = []) => {
  if (!numbers || numbers.length === 0) return null;
  const max = Math.max(...numbers, 1);
  const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return numbers.slice(-30).map((v) => blocks[Math.min(Math.floor((v / max) * blocks.length), blocks.length - 1)]).join('');
};

// Severed floor workforce reduction ledger with cards, modal submission, and no wellness clutter
export default function SeveredFloor() {
  const { mode } = useMode();
  const [layoffs, setLayoffs] = useState([]);
  const [overview, setOverview] = useState({ severedThisMonth: 0, severedByDay: [] });
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [company, setCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [peopleAffected, setPeopleAffected] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [note, setNote] = useState('');

  const loadData = async () => {
    try {
      const [lRes, sRes] = await Promise.all([api.get('/layoffs'), api.get('/stats/overview')]);
      setLayoffs(lRes.data.layoffs || []);
      setOverview(sRes.data || { severedThisMonth: 0, severedByDay: [] });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.post('/layoffs', {
        company: company.trim(),
        date,
        peopleAffected: parseInt(peopleAffected, 10) || 0,
        sourceUrl: sourceUrl.trim(),
        note: note.trim()
      });
      setCompany('');
      setPeopleAffected('');
      setSourceUrl('');
      setNote('');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.post(`/layoffs/${id}/confirm`);
      setLayoffs((prev) =>
        prev.map((l) =>
          l._id === id
            ? { ...l, confirmedByMe: true, confirmCount: (l.confirmCount || 0) + 1 }
            : l
        )
      );
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to confirm');
    }
  };

  const filtered = layoffs.filter((l) => !search || l.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4 text-xs">
      {/* Header: count as 42px tabular number with sparkline */}
      <section className={`space-y-1 pb-4 ${mode === 'outie' ? 'border-b border-[#1E2D28]' : 'border-b border-[var(--border)]'}`}>
        <div className="text-[42px] leading-tight font-semibold tabular-nums text-[var(--text)] font-head">
          {overview.severedThisMonth.toLocaleString()}
        </div>
        <p className="text-xs text-[var(--muted)]">Severed this month</p>
        {overview.severedByDay && overview.severedByDay.length > 0 && (
          <div className="text-xs tracking-wider text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap pt-1 font-mono">
            {renderSparkline(overview.severedByDay)}
          </div>
        )}
      </section>

      {/* Toolbar: search input + Add report button */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--muted)]" />
          <Input
            placeholder="Search company records"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 h-9 ${mode === 'outie' ? 'bg-[#141414] border-[#1E2D28] text-[#E5E5E5]' : ''}`}
          />
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className={mode === 'outie' ? 'bg-[#B0E4CC] text-[#091413] hover:opacity-90 font-bold rounded-full' : ''}
        >
          <Plus size={14} /> Add report
        </Button>
      </div>

      {/* Separate Add Report Modal Window with "X" close button */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-lg p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Record Workforce Reduction Report
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Company</label>
                  <Input
                    required
                    placeholder="e.g. Lumon Industries"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Date</label>
                  <Input
                    required
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">People affected</label>
                <Input
                  required
                  type="number"
                  placeholder="e.g. 150"
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Source URL</label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Note / Department context</label>
                <Input
                  placeholder="e.g. Engineering & Operations"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} variant="default" size="sm">
                  {submitting ? 'Submitting...' : 'Submit report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reports List formatted as spaced cards (Innie) or borderless rows with single horizontal divider (Outie) */}
      <div className={mode === 'outie' ? 'space-y-0' : 'space-y-4'}>
        {loading ? (
          <div className="py-12 text-center text-[var(--muted)]">Loading reduction ledger...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted)]">No reduction reports match your search.</div>
        ) : (
          filtered.map((item) => (
            <LayoffRow key={item._id} layoff={item} onConfirm={handleConfirm} />
          ))
        )}
      </div>
    </div>
  );
}