import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function Floors() {
  const [floors, setFloors] = useState([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { isInnie } = useMode();

  const fetchFloors = async (query = '') => {
    try {
      const res = await api.get(`/floors${query ? `?q=${query}` : ''}`);
      setFloors(res.data.floors || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to load floors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFloors(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to create floor');
    }
  };

  const handleToggleJoin = async (slug) => {
    try {
      await api.post(`/floors/${slug}/join`);
      fetchFloors(search);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to update membership');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-base font-bold uppercase tracking-wider text-[var(--text)]">
          {isInnie ? '# Workplace Channels' : 'SECTORS & COMPANY FLOORS'}
        </h1>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          variant="default"
          size="sm"
        >
          {showCreate ? 'Close Form' : isInnie ? '+ Add Channel' : '+ CREATE SECTOR'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {showCreate && (
        <Card className="p-4 space-y-3">
          <form onSubmit={handleCreate} className="space-y-3">
            <h2 className="font-mono text-xs uppercase tracking-widest font-bold text-[var(--text)]">
              {isInnie ? 'Create New Channel' : 'INITIALIZE COMPANY SECTOR'}
            </h2>
            <div>
              <label className="block text-[11px] font-mono uppercase mb-1 text-[var(--muted)]">Company Name</label>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lumon Industries"
                className="text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase mb-1 text-[var(--muted)]">Mission / Description</label>
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short focus and description of this company floor"
                className="text-xs"
              />
            </div>
            <Button type="submit" variant="default" size="sm">
              {isInnie ? 'Create Channel' : 'CONFIRM SECTOR CREATION'}
            </Button>
          </form>
        </Card>
      )}

      <div>
        <Input
          type="text"
          placeholder={isInnie ? "Search channels by company name..." : "FILTER SECTORS BY ENTERPRISE..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-xs"
        />
      </div>

      {loading ? (
        <p className="font-mono text-xs text-[var(--muted)] py-4 text-center">Loading sectors...</p>
      ) : floors.length === 0 ? (
        <Card className="p-8 text-center font-mono text-xs flex flex-col items-center justify-center space-y-3 text-[var(--muted)]">
          <AsciiArt piece="empty-no-results" size={12} still={true} tone="muted" />
          <p className="text-sm">No floors found matching your criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {floors.map((floor) => {
            const isMember = floor.isMember;
            return (
              <Card key={floor._id} className="p-4 flex flex-col justify-between hover:border-[var(--border-focus)] transition-all">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Link
                      to={`/floors/${floor.slug}`}
                      className={`font-mono text-sm font-bold hover:underline ${
                        isInnie ? 'text-[#4a154b]' : 'text-[#FFFFFF]'
                      }`}
                    >
                      {isInnie ? `# ${floor.slug}` : floor.name.toUpperCase()}
                    </Link>
                    <Badge variant={isInnie ? 'default' : 'outline'} className="text-[10px]">
                      {floor.memberCount || 0} members
                    </Badge>
                  </div>
                  <p className="text-xs line-clamp-2 mb-3 text-[var(--muted)]">
                    {floor.description || 'No description provided.'}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleToggleJoin(floor.slug)}
                  variant={isMember ? "secondary" : "default"}
                  size="xs"
                  className="self-start"
                >
                  {isMember ? '✓ Joined' : '+ Join Floor'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
