import { useState, useEffect } from 'react';
import api from '../api/api';
import LayoffRow from '../components/LayoffRow';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import AsciiCustom from '../components/AsciiCustom';
import AsciiArt from '../components/AsciiArt';
import severedCounter from '../ascii/pieces/severed-counter';
import severedBoard from '../ascii/pieces/severed-board';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SeveredFloor() {
  const [layoffs, setLayoffs] = useState([]);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [company, setCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [peopleAffected, setPeopleAffected] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { isInnie } = useMode();

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
    const timer = setTimeout(() => {
      fetchLayoffs(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to submit report');
    }
  };

  const handleConfirm = async (id) => {
    try {
      const res = await api.post(`/layoffs/${id}/confirm`);
      setLayoffs((prev) =>
        prev.map((l) => (l._id === id ? { ...l, confirmCount: res.data.confirmCount, confirmedByMe: true } : l))
      );
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to confirm');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tracker Header */}
      <Card className="p-6 text-center space-y-3">
        <h1 className="font-mono text-sm tracking-widest uppercase font-bold text-[var(--muted)]">
          {isInnie ? '# Layoff Tracker & Reductions' : 'THE SEVERED FLOOR // DISPLACEMENTS'}
        </h1>
        <div className="flex justify-center my-2">
          <AsciiCustom make={severedCounter} options={{ value: monthlyCount }} size={12} />
        </div>
        <div className="font-mono text-xs uppercase text-[var(--muted)]">
          Severed this cycle: <strong className={`font-black ${isInnie ? 'text-[#4a154b]' : 'text-[#FFC000]'}`}>{monthlyCount.toLocaleString()}</strong>
        </div>
        <div className="flex justify-center overflow-x-auto pt-2">
          <AsciiCustom make={severedBoard} options={{ rows: layoffs }} size={10} still={true} tone="muted" />
        </div>
      </Card>

      {/* Controls: Search and Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder={isInnie ? "Filter by company..." : "SEARCH ENTERPRISE DISPLACEMENTS..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs"
          />
        </div>
        <Button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          variant="default"
          size="sm"
          className="whitespace-nowrap"
        >
          {showAddForm ? 'Close Form' : isInnie ? '+ Log Reduction' : '+ SUBMIT DISPLACEMENT'}
        </Button>
      </div>

      {showAddForm && (
        <Card className="p-4 space-y-3 font-mono text-xs">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-xs uppercase font-bold tracking-wider text-[var(--text)]">
              {isInnie ? 'Log Workforce Reduction' : 'REPORT WORKFORCE CONTRACTION'}
            </h2>
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input required placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} className="text-xs font-mono" />
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs font-mono" />
              <Input type="number" placeholder="People Affected (headcount)" value={peopleAffected} onChange={(e) => setPeopleAffected(e.target.value)} className="text-xs font-mono" />
              <Input type="url" placeholder="Source URL (Article / SEC Filing)" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className="text-xs font-mono" />
            </div>
            <Textarea rows={3} placeholder="Impacted divisions or severance package details..." value={note} onChange={(e) => setNote(e.target.value)} className="text-xs" />
            <Button type="submit" variant="default" size="sm">
              {isInnie ? 'Publish Layoff Report' : 'CONFIRM REPORT SUBMISSION'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="font-mono text-xs text-[var(--muted)] py-4 text-center">Loading reduction logs...</div>
      ) : layoffs.length === 0 ? (
        <Card className="p-8 text-center font-mono text-xs flex flex-col items-center justify-center space-y-3 text-[var(--muted)]">
          <AsciiArt piece="empty-no-results" size={12} still={true} tone="muted" />
          <p className="text-sm">No reductions found matching this criteria.</p>
        </Card>
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
