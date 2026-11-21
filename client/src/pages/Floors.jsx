import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import api from '../api/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMode } from '../context/ModeContext';

// Directory of company floors with search, create modal, and hairline rows
export default function Floors() {
  const { mode } = useMode();
  const [floors, setFloors] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFloors = async () => {
    try {
      const q = search ? `q=${encodeURIComponent(search)}` : '';
      const res = await api.get(`/floors?${q}`);
      setFloors(res.data.floors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchFloors(), 200);
    return () => clearTimeout(t);
  }, [search, mode]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await api.post('/floors', { name: name.trim(), description });
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchFloors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create floor');
    }
  };

  const handleToggleJoin = async (id, slug) => {
    try {
      await api.post(`/floors/${slug}/join`);
      setFloors((prev) =>
        prev.map((f) => {
          if (f._id !== id) return f;
          const nextState = !f.isMember;
          return { ...f, isMember: nextState, memberCount: f.memberCount + (nextState ? 1 : -1) };
        })
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update membership');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 text-xs space-y-4">
      {/* Search input plus Create floor accent button */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--muted)]" />
          <Input
            placeholder="Search company floors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="default" size="sm" onClick={() => setShowCreate(!showCreate)}>
          <Plus size={14} /> Create floor
        </Button>
      </div>

      {/* Create floor inline form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-3">
          <h2 className="font-semibold text-sm text-[var(--text)]">Create a floor</h2>
          <Input required placeholder="Company or department name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" variant="default" size="sm">Create floor</Button>
        </form>
      )}

      {/* List of floors as hairline rows */}
      <div className="border-t border-[var(--border)]">
        {loading ? (
          <div className="py-8 text-center text-[var(--muted)]">Loading floors...</div>
        ) : floors.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)]">No company floors found.</div>
        ) : (
          floors.map((f) => {
            const initials = f.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
            return (
              <div
                key={f._id}
                className="py-3 px-2 border-b border-[var(--border)] flex items-center justify-between gap-3 hover:bg-[var(--hover)] transition-colors"
              >
                <Link
                  to={`/floors/${f.slug}`}
                  className="flex items-center gap-3 min-w-0 group cursor-pointer flex-1"
                >
                  <div className="w-9 h-9 border border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center font-medium text-xs bg-[var(--accent-soft)] text-[var(--accent)] rounded-[var(--radius-sm)] shrink-0 transition-colors">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate block">
                      #{f.name}
                    </span>
                    <span className="text-xs text-[var(--muted)] block tabular-nums">
                      {f.memberCount} members
                    </span>
                  </div>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleToggleJoin(f._id, f.slug)}
                >
                  {f.isMember ? 'Joined' : 'Join'}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
