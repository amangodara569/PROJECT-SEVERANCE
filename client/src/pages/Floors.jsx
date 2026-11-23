import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, X, Users, ArrowLeft, Radio } from 'lucide-react';
import api from '../api/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useMode } from '../context/ModeContext';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w ago`;
  const years = Math.floor(weeks / 52);
  return `${years}y ago`;
};

// Directory of company floors formatted as rich Severance corporate cards
export default function Floors() {
  const { mode } = useMode();
  const navigate = useNavigate();
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
      const res = await api.post('/floors', { name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchFloors();
      if (res.data.floor) {
        window.dispatchEvent(
          new CustomEvent('linkedout:floor-joined', {
            detail: { floorId: res.data.floor._id, slug: res.data.floor.slug, name: res.data.floor.name, joined: true }
          })
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create floor');
    }
  };

  const handleToggleJoin = async (id, slug) => {
    try {
      const res = await api.post(`/floors/${slug}/join`);
      const target = floors.find((f) => f._id === id);
      const isJoined = res.data.joined;
      setFloors((prev) =>
        prev.map((f) => {
          if (f._id !== id) return f;
          return { ...f, isMember: isJoined, memberCount: res.data.memberCount };
        })
      );
      window.dispatchEvent(
        new CustomEvent('linkedout:floor-joined', {
          detail: { floorId: id, slug, name: target?.name, joined: isJoined }
        })
      );
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update membership');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 text-xs space-y-4">
      {/* Top back navigation */}
      <div>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to feed</span>
        </button>
      </div>

      {/* Search input plus Create floor accent button */}
      <div className={`flex items-center justify-between gap-3 pb-3 ${mode === 'outie' ? 'border-b border-[#1E2D28]' : 'border-b border-[var(--border)]'}`}>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-[var(--muted)]" />
          <Input
            placeholder="Search company floors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 h-9 ${mode === 'outie' ? 'bg-[#141414] border-[#1E2D28] text-[#E5E5E5]' : ''}`}
          />
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowCreate(true)}
          className={mode === 'outie' ? 'bg-[#B0E4CC] text-[#091413] hover:opacity-90 font-bold rounded-full' : ''}
        >
          <Plus size={14} /> Create floor
        </Button>
      </div>

      {/* Clean Create Floor Modal Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="w-full max-w-md p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Create a floor
              </span>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Company or Department Name</label>
                <Input
                  required
                  placeholder="e.g. Lumon Industries or Data Refinement"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Short Description</label>
                <Input
                  placeholder="Briefly describe what happens on this floor..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowCreate(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  className={mode === 'outie' ? 'bg-[#B0E4CC] text-[#091413] font-bold rounded-full' : ''}
                >
                  Create floor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory of Floors: Borderless with single horizontal divider line in Outie mode */}
      <div className={mode === 'outie' ? 'space-y-0' : 'space-y-4'}>
        {loading ? (
          <div className="py-12 text-center text-[var(--muted)]">Loading company floors...</div>
        ) : floors.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted)]">No company floors found. Click + Create floor to start one.</div>
        ) : (
          floors.map((f) => {
            const initials = f.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
            const creatorUsername = f.createdBy?.username || 'lumon_admin';
            return (
              <div
                key={f._id}
                className={
                  mode === 'outie'
                    ? "py-5 px-1 border-b border-[#1E2D28] space-y-3 bg-transparent transition-colors"
                    : "p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-3 shadow-sm hover:border-[var(--border-strong,var(--accent))] transition-all"
                }
              >
                {/* Floor Header Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-9 h-9 flex items-center justify-center font-bold text-xs shrink-0 rounded-[6px] ${
                      mode === 'outie'
                        ? 'bg-[#262A2A] text-[#E5E5E5]'
                        : 'border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)] rounded-[var(--radius-sm)]'
                    }`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/floors/${f.slug}`}
                          className={`font-semibold text-sm transition-colors truncate ${
                            mode === 'outie' ? 'text-[#5A7EE6] hover:underline' : 'text-[var(--text)] hover:text-[var(--accent)]'
                          }`}
                        >
                          #{f.name}
                        </Link>
                        {f.category && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
                            {f.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] mt-1 font-meta flex-wrap">
                        <span>Created by</span>
                        <Link
                          to={`/u/${creatorUsername}`}
                          className="text-[var(--text)] hover:underline font-medium"
                        >
                          @{creatorUsername}
                        </Link>
                        <span>•</span>
                        <span>{timeAgo(f.createdAt) || 'recently'}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant={f.isMember ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleToggleJoin(f._id, f.slug)}
                    className={`shrink-0 ${
                      mode === 'outie' && !f.isMember ? 'bg-[#B0E4CC] text-[#091413] hover:opacity-90 font-bold rounded-full' : ''
                    }`}
                  >
                    {f.isMember ? 'Joined' : '+ Join'}
                  </Button>
                </div>

                {/* Floor Description */}
                <p className={`text-xs leading-relaxed ${mode === 'outie' ? 'text-[#E5E5E5]/90 font-mono' : 'text-[var(--muted)]'}`}>
                  {f.description || 'Corporate department and community exchange floor for verified personnel.'}
                </p>

                {/* Floor Stats Footer */}
                <div className={`flex items-center gap-4 text-[11px] text-[var(--muted)] ${mode === 'outie' ? 'pt-1' : 'pt-2 border-t border-[var(--border)]'}`}>
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-[var(--muted)]" />
                    <span className="tabular-nums font-medium text-[var(--text)]">{f.memberCount || 0}</span>
                    <span>members enrolled</span>
                  </div>
                  {typeof f.postsToday === 'number' && f.postsToday > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Radio size={13} className="text-[var(--accent)]" />
                      <span className="tabular-nums font-medium text-[var(--text)]">{f.postsToday}</span>
                      <span>transmissions today</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
