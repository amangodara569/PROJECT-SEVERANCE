import { useState, useEffect } from 'react';
import api from '../api/api';
import LayoffRow from '../components/LayoffRow';
import { useAuth } from '../context/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, ArrowUpDown, TrendingDown } from 'lucide-react';

export default function SeveredFloor() {
  const [layoffs, setLayoffs] = useState([]);
  const [overview, setOverview] = useState({ severedThisMonth: 0, topCompanies: [] });
  const [timeFilter, setTimeFilter] = useState('30d'); // '7d' | '30d' | 'all'
  const [search, setSearch] = useState('');
  const [sortByPeople, setSortByPeople] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [company, setCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [peopleAffected, setPeopleAffected] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [layoffsRes, statsRes] = await Promise.all([
        api.get('/layoffs'),
        api.get('/stats/overview')
      ]);

      setLayoffs(layoffsRes.data.layoffs || []);
      setOverview(statsRes.data || { severedThisMonth: 0, topCompanies: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company.trim()) return;
    setError('');

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
      setError(err.response?.data?.error || 'Failed to submit report');
    }
  };

  // Filter & sort layoffs
  const filteredLayoffs = layoffs
    .filter((l) => {
      // Company search
      if (search && !l.company.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // Time filter
      if (timeFilter !== 'all') {
        const itemDate = new Date(l.date || l.createdAt).getTime();
        const days = timeFilter === '7d' ? 7 : 30;
        const diffMs = Date.now() - itemDate;
        if (diffMs > days * 86400 * 1000) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortByPeople) {
        return (b.people || b.peopleAffected || 0) - (a.people || a.peopleAffected || 0);
      }
      return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });

  // Calculate monthly distribution for the right-hand bar chart
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthTotals = {};
  layoffs.forEach((l) => {
    const d = new Date(l.date || l.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
    monthTotals[key] = (monthTotals[key] || 0) + (parseInt(l.people || l.peopleAffected, 10) || 0);
  });
  const monthEntries = Object.entries(monthTotals).slice(-6);
  const maxMonthVal = Math.max(...Object.values(monthTotals), 1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
      {/* Page Title & Submission Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
            // THE SEVERED FLOOR // WORKFORCE REDUCTION LEDGER
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Crowdsourced, cryptographic ledger of workforce cuts and severance telemetry.
          </p>
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="uppercase font-semibold flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>{showAddForm ? 'Close' : 'Report New Layoff'}</span>
        </Button>
      </div>

      {/* Submission Form */}
      {showAddForm && (
        <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h3 className="font-bold text-xs uppercase text-[var(--color-text-primary)]">
              Transmit Workforce Reduction Report
            </h3>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Company</label>
                <Input required placeholder="e.g. MegaCorp" value={company} onChange={(e) => setCompany(e.target.value)} className="text-xs font-mono" />
              </div>
              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Effective Date</label>
                <Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs font-mono" />
              </div>
              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">People Affected</label>
                <Input required type="number" placeholder="Approx headcount" value={peopleAffected} onChange={(e) => setPeopleAffected(e.target.value)} className="text-xs font-mono" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">News / Source URL (Optional)</label>
                <Input type="url" placeholder="https://..." value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="text-xs font-mono" />
              </div>
              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Internal Context / Notes</label>
                <Input placeholder="Restructuring, department closure, etc." value={note} onChange={(e) => setNote(e.target.value)} className="text-xs font-mono" />
              </div>
            </div>

            <Button type="submit" variant="default" size="sm" className="uppercase font-semibold">
              Commit Report
            </Button>
          </form>
        </Card>
      )}

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column: Big Counter & Full Table */}
        <div className="space-y-4">
          {/* Big Counter Banner */}
          <Card className="p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
                // VERIFIED SEVERANCES THIS MONTH
              </span>
              <div className="text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] mt-1">
                {overview.severedThisMonth.toLocaleString()}
                <span className="text-sm font-normal text-[var(--color-text-muted)] ml-2">personnel</span>
              </div>
            </div>
            <Badge variant="outline" size="sm" className="text-xs font-bold text-[#E01E5A] border-[#E01E5A]/40 px-2 py-1">
              <TrendingDown size={14} className="mr-1 inline" /> TELEMETRY ACTIVE
            </Badge>
          </Card>

          {/* Table Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2 border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-2.5 top-2.5 text-[var(--color-text-muted)]" />
              <Input
                placeholder="Search company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-7 h-8 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* 7d | 30d | All */}
              <div className="flex items-center border border-[var(--color-border)] rounded-sm bg-[var(--color-bg-subtle)] p-0.5 text-[10px]">
                {['7d', '30d', 'all'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setTimeFilter(f)}
                    className={`px-2 py-0.5 uppercase transition-colors ${
                      timeFilter === f
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Sort by people affected */}
              <button
                type="button"
                onClick={() => setSortByPeople(!sortByPeople)}
                className={`p-1.5 border border-[var(--color-border)] hover:border-[var(--color-primary)] rounded-sm flex items-center gap-1 text-[10px] uppercase transition-colors ${
                  sortByPeople ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold' : 'text-[var(--color-text-muted)]'
                }`}
                title="Sort by number of people affected"
              >
                <ArrowUpDown size={12} />
                <span>Headcount</span>
              </button>
            </div>
          </div>

          {/* Table Rows */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-14 border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse" />
              ))}
            </div>
          ) : filteredLayoffs.length === 0 ? (
            <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              No workforce reductions match the selected filters.
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredLayoffs.map((item) => (
                <LayoffRow key={item._id} layoff={item} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Top Companies & By-Month Chart */}
        <div className="space-y-4">
          {/* Top Companies Leaderboard */}
          <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
              // TOP COMPANIES THIS MONTH
            </span>
            <div className="space-y-2">
              {(overview.topCompanies || []).map((c, idx) => (
                <div key={c.company} className="flex items-center justify-between text-xs border-b border-[var(--color-border)] pb-1.5 last:border-b-0">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] text-[var(--color-text-muted)] font-mono w-4">{idx + 1}.</span>
                    <span className="font-semibold text-[var(--color-text-primary)] truncate">{c.company}</span>
                  </div>
                  <Badge variant="outline" size="sm" className="shrink-0 text-[10px]">
                    -{c.count.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* By-Month Bar Chart */}
          <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">
              // HISTORICAL HEADCOUNT REDUCTIONS
            </span>
            <div className="space-y-2.5 pt-1">
              {monthEntries.map(([m, total]) => {
                const percent = Math.min(Math.round((total / maxMonthVal) * 100), 100);
                return (
                  <div key={m} className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[var(--color-text-primary)] font-bold">{m}</span>
                      <span className="text-[var(--color-text-muted)]">{total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--color-bg-subtle)] border border-[var(--color-border)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--color-primary)] transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}