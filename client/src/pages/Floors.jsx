import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

// Floors page: list, search, create, and join company communities
export default function Floors() {
  const [floors, setFloors] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  // Load floors list with search filter
  const fetchFloors = async (query = '') => {
    try {
      const res = await api.get(`/floors${query ? `?q=${query}` : ''}`);
      setFloors(res.data.floors);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloors(search);
  }, [search]);

  // Handle floor creation
  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/floors', { name, description });
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchFloors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create floor');
    }
  };

  // Toggle join/leave on a floor
  const handleToggleJoin = async (slug) => {
    try {
      await api.post(`/floors/${slug}/join`);
      fetchFloors(search);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update membership');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Create Button */}
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-base font-bold uppercase tracking-wider">FLOORS</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-3 py-1.5 font-mono text-xs uppercase tracking-wider border"
          style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
        >
          {showCreate ? 'Close' : 'Create Floor'}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-2 text-xs border font-mono" style={{ borderColor: 'var(--border)' }}>
          {error}
        </div>
      )}

      {/* Inline Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="p-4 border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="font-mono text-xs uppercase tracking-widest font-bold">New Company Floor</h2>
          <div>
            <label className="block text-[11px] font-mono uppercase mb-1" style={{ color: 'var(--muted)' }}>Company Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lumon Industries"
              className="w-full p-2 text-xs border outline-none bg-transparent"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase mb-1" style={{ color: 'var(--muted)' }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this corporate floor"
              className="w-full p-2 text-xs border outline-none bg-transparent h-16"
              style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
            />
          </div>
          <button type="submit" className="px-4 py-1.5 font-mono text-xs uppercase font-semibold" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>
            Publish Floor
          </button>
        </form>
      )}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search company floors..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 text-xs border font-mono outline-none bg-transparent"
        style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
      />

      {/* Floors List */}
      {loading ? (
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</p>
      ) : floors.length === 0 ? (
        <div className="p-8 text-center border font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          No floors found. The work is mysterious and important.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {floors.map((floor) => {
            const isMember = floor.members?.includes(user?._id);
            return (
              <div key={floor._id} className="p-4 border flex flex-col justify-between" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Link to={`/floors/${floor.slug}`} className="font-mono text-sm font-bold hover:underline" style={{ color: 'var(--text)' }}>
                      {floor.name}
                    </Link>
                    <span className="font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                      {floor.members?.length || 0} members
                    </span>
                  </div>
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--muted)' }}>
                    {floor.description || 'No description provided.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleJoin(floor.slug)}
                  className="self-start px-3 py-1 font-mono text-xs border uppercase"
                  style={{
                    backgroundColor: isMember ? 'transparent' : 'var(--text)',
                    color: isMember ? 'var(--text)' : 'var(--bg)',
                    borderColor: 'var(--border)'
                  }}
                >
                  {isMember ? 'Leave' : 'Join'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
