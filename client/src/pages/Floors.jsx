import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Search, TrendingUp, Users, Sparkles } from 'lucide-react';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const CATEGORIES = ['All', 'Tech', 'Finance', 'Retail', 'Startup', 'Manufacturing', 'Other'];

export default function Floors() {
  const [floors, setFloors] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [floorCategory, setFloorCategory] = useState('Tech');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  const fetchFloors = async () => {
    try {
      const catParam = category !== 'All' ? `category=${category}` : '';
      const qParam = search ? `q=${encodeURIComponent(search)}` : '';
      const query = [catParam, qParam].filter(Boolean).join('&');

      const res = await api.get(`/floors?${query}`);
      setFloors(res.data.floors || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFloors();
    }, 200);
    return () => clearTimeout(timer);
  }, [category, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/floors', { name, description, category: floorCategory });
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchFloors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create floor');
    }
  };

  const handleToggleJoin = async (id, slug) => {
    try {
      await api.post(`/floors/${slug}/join`);
      setFloors((prev) =>
        prev.map((f) => {
          if (f._id !== id) return f;
          const nextState = !f.isMember;
          return {
            ...f,
            isMember: nextState,
            memberCount: f.memberCount + (nextState ? 1 : -1)
          };
        })
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update membership');
    }
  };

  // Grouped sections for Explore view
  const mostActive = [...floors].sort((a, b) => (b.postsToday || 0) - (a.postsToday || 0)).slice(0, 3);
  const biggest = [...floors].sort((a, b) => (b.memberCount || 0) - (a.memberCount || 0)).slice(0, 3);
  const newest = [...floors].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);

  // Render individual floor card
  const renderFloorCard = (f) => {
    const initials = f.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return (
      <Card
        key={f._id}
        className="p-3.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all flex flex-col justify-between space-y-3 font-mono text-xs shadow-xs"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 flex items-center justify-center font-bold text-xs bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                style={{ borderRadius: 'var(--radius-btn)' }}
              >
                {initials}
              </div>
              <div>
                <Link to={`/floors/${f.slug}`} className="font-bold text-sm text-[var(--color-text-primary)] hover:underline truncate block">
                  #{f.name}
                </Link>
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  {f.memberCount} members · {f.postsToday || 0} posts today
                </span>
              </div>
            </div>

            <Badge variant="outline" size="sm" className="text-[9px] uppercase">
              {f.category || 'Tech'}
            </Badge>
          </div>

          <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
            {f.description || 'Corporate community sector.'}
          </p>
        </div>

        <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
          <Link to={`/floors/${f.slug}`} className="text-[11px] text-[var(--color-primary)] hover:underline">
            Visit Floor →
          </Link>

          {f.isMember ? (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => handleToggleJoin(f._id, f.slug)}
              className="text-[10px] uppercase font-mono text-[var(--color-text-muted)] hover:text-[#E01E5A]"
            >
              <Check size={11} className="mr-1" /> Joined
            </Button>
          ) : (
            <Button
              type="button"
              variant="default"
              size="xs"
              onClick={() => handleToggleJoin(f._id, f.slug)}
              className="text-[10px] uppercase font-mono font-semibold"
            >
              Join
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-3">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
            // EXPLORE COMPANY FLOORS
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Join departmental networks to read unvarnished employee communications.
          </p>
        </div>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="uppercase font-semibold flex items-center gap-1.5"
        >
          <Plus size={14} />
          <span>{showCreate ? 'Close Form' : 'Create Floor'}</span>
        </Button>
      </div>

      {/* Floor Creation Form */}
      {showCreate && (
        <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3 shadow-lg">
          <form onSubmit={handleCreate} className="space-y-3">
            <h3 className="font-bold text-xs uppercase text-[var(--color-text-primary)]">Establish New Corporate Floor</h3>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Company Name</label>
                <Input required placeholder="e.g. TechNova" value={name} onChange={(e) => setName(e.target.value)} className="text-xs font-mono" />
              </div>

              <div>
                <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Sector Category</label>
                <select
                  value={floorCategory}
                  onChange={(e) => setFloorCategory(e.target.value)}
                  className="w-full h-9 p-2 text-xs font-mono bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
                  style={{ borderRadius: 'var(--radius-input)' }}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Description</label>
              <Textarea rows={2} placeholder="Mandate, employee scope, restructuring history..." value={description} onChange={(e) => setDescription(e.target.value)} className="text-xs" />
            </div>

            <Button type="submit" variant="default" size="sm" className="uppercase font-semibold">
              Commission Floor
            </Button>
          </form>
        </Card>
      )}

      {/* Search and Category Filter Chips */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Filter floors by company name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-xs uppercase font-bold transition-colors border ${
                category === cat
                  ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] border-[var(--color-primary)]'
                  : 'bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
              }`}
              style={{ borderRadius: 'var(--radius-btn)' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4 border border-[var(--color-border)] bg-[var(--color-bg-card)] space-y-2 animate-pulse h-36" />
          ))}
        </div>
      )}

      {/* Filtered Grid or Grouped Sections */}
      {!loading && (
        search || category !== 'All' ? (
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] mb-3 block">
              // SEARCH RESULTS ({floors.length})
            </span>
            {floors.length === 0 ? (
              <Card className="p-8 text-center text-[var(--color-text-muted)]">
                No corporate floors found matching your criteria.
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {floors.map(renderFloorCard)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section 1: Most Active Today */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <TrendingUp size={13} /> // MOST ACTIVE TODAY
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mostActive.map(renderFloorCard)}
              </div>
            </div>

            {/* Section 2: Biggest Communities */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Users size={13} /> // LARGEST OPERATIONAL FLOORS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {biggest.map(renderFloorCard)}
              </div>
            </div>

            {/* Section 3: New Floors */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1.5">
                <Sparkles size={13} /> // RECENTLY ESTABLISHED
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {newest.map(renderFloorCard)}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}