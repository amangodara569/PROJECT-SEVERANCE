import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import api from '../api/api';
import LayoffRow from '../components/LayoffRow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Renders 30-day sparkline only if daily data points are returned by API
const renderSparkline = (numbers = []) => {
  if (!numbers || numbers.length === 0) return null;
  const max = Math.max(...numbers, 1);
  const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  return numbers.slice(-30).map((v) => blocks[Math.min(Math.floor((v / max) * blocks.length), blocks.length - 1)]).join('');
};

// Severed floor tracker showing workforce reduction ledger and confirmation state
export default function SeveredFloor() {
  const [layoffs, setLayoffs] = useState([]);
  const [overview, setOverview] = useState({ severedThisMonth: 0, severedByDay: [] });
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

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
    if (!company.trim()) return;
    try {
      await api.post('/layoffs', {
        company: company.trim(),
        date,
        peopleAffected: parseInt(peopleAffected, 10) || 0,
        sourceUrl,
        note
      });
      setCompany('');
      setPeopleAffected('');
      setSourceUrl('');
      setNote('');
      setShowAddForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await api.post(`/layoffs/${id}/confirm`);
      setLayoffs((prev) => prev.map((l) => (l._id === id ? { ...l, confirmedByMe: true, confirmCount: (l.confirmCount || 0) + 1 } : l)));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to confirm');
    }
  };

  const filtered = layoffs.filter((l) => !search || l.company.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 text-xs">
      {/* Header: count as 42px tabular number, label in sentence case */}
      <section className="space-y-1 pb-4 border-b border-[var(--border)]">
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

      {/* Toolbar: search input on --surface, plus one accent button "Add report" */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--muted)]" />
          <Input
            placeholder="Search company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="default" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={14} /> Add report
        </Button>
      </div>

      {/* Add-report form: inline panel on --surface, sentence-case labels */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Company</label>
              <Input required value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Date</label>
              <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">People affected</label>
              <Input required type="number" value={peopleAffected} onChange={(e) => setPeopleAffected(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Source link</label>
              <Input type="url" placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Note</label>
              <Input placeholder="Department or context" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <Button type="submit" variant="default" size="sm">Submit</Button>
        </form>
      )}

      {/* Main Two-Column View with Right Rail */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 items-start">
        {/* List: hairline rows */}
        <div>
          {loading ? (
            <div className="py-8 text-center text-[var(--muted)]">Loading ledger...</div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-[var(--muted)]">No reports match your search.</div>
          ) : (
            filtered.map((item) => (
              <LayoffRow key={item._id} layoff={item} onConfirm={handleConfirm} />
            ))
          )}
        </div>

        {/* Right Rail: Need to talk? with a link to Wellness */}
        <aside className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
          <h3 className="font-semibold text-xs text-[var(--text)]">Need to talk?</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Support hotlines and career transition guides are available in our Wellness session.
          </p>
          <div className="pt-1">
            <Button asChild variant="outline" size="xs" className="w-full">
              <Link to="/wellness">Wellness</Link>
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
