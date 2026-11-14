import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Plus, MessageSquare, Info, TrendingDown } from 'lucide-react';
import api from '../api/api';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import LayoffRow from '../components/LayoffRow';
import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FloorPage() {
  const { slug } = useParams();
  const [floor, setFloor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [layoffs, setLayoffs] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'about' | 'layoffs'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      const [floorRes, layoffsRes] = await Promise.all([
        api.get(`/floors/${slug}`),
        api.get('/layoffs')
      ]);

      const f = floorRes.data.floor;
      setFloor(f);

      const postsRes = await api.get(`/posts?floor=${f._id}`);
      setPosts(postsRes.data.posts || postsRes.data.items || []);

      // Filter layoffs where company matches floor name
      const allLayoffs = layoffsRes.data.layoffs || [];
      const matched = allLayoffs.filter(
        (l) => l.company && l.company.toLowerCase() === f.name.toLowerCase()
      );
      setLayoffs(matched);

      // Save to recent in localStorage
      try {
        const stored = JSON.parse(localStorage.getItem('linkedout:recent') || '[]');
        const updated = [{ title: `#${f.name}`, url: `/floors/${f.slug}` }, ...stored.filter((r) => r.url !== `/floors/${f.slug}`)].slice(0, 5);
        localStorage.setItem('linkedout:recent', JSON.stringify(updated));
      } catch {}
    } catch (err) {
      setError(err.response?.data?.error || 'Floor not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [slug]);

  const handleToggleJoin = async () => {
    try {
      const res = await api.post(`/floors/${slug}/join`);
      setFloor((prev) => ({
        ...prev,
        isMember: res.data.joined,
        memberCount: res.data.memberCount
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update membership');
    }
  };

  const handleVote = async (postId, value) => {
    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, score: res.data.score, userVote: res.data.userVote } : p))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="font-mono text-xs text-[var(--color-text-muted)] py-8 text-center">Loading floor telemetry...</div>;
  if (error || !floor) {
    return (
      <Card className="p-8 text-center font-mono text-xs space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)]">{error || 'Floor does not exist.'}</p>
        <Link to="/floors" className="underline text-[var(--color-primary)]">Return to Floors directory</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-mono text-xs">
      {/* Full-width Banner Strip with numbers-grid pattern */}
      <div
        className="p-6 border border-[var(--color-border)] bg-[var(--color-bg-card)] relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        {/* Subtle Macrodata numbers texture overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-5 font-mono text-[9px] leading-tight select-none overflow-hidden"
        >
          {Array(15).fill('4 8 1 5 1 6 2 3 4 2 0 8 3 7 1 9 5 2 0 3 8 4 7 1 6 2 9 0 5 3').join('\n')}
        </div>

        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
              // DEPARTMENTAL FLOOR
            </span>
            <Badge variant="outline" size="sm" className="text-[9px] uppercase">
              {floor.category || 'Tech'}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
            #{floor.name}
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)] max-w-xl">
            {floor.description || 'Employee exchange and unvarnished communications.'}
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <span className="text-xs text-[var(--color-text-muted)]">
            <strong>{floor.memberCount}</strong> members
          </span>
          <Button
            type="button"
            variant={floor.isMember ? 'outline' : 'default'}
            size="sm"
            onClick={handleToggleJoin}
            className="uppercase font-semibold flex items-center gap-1.5"
          >
            {floor.isMember ? (
              <>
                <Check size={14} /> Joined
              </>
            ) : (
              <>
                <Plus size={14} /> Join Floor
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs: Posts | About | Layoffs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-1 font-mono text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'posts'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <MessageSquare size={13} />
          <span>Posts ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('about')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'about'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Info size={13} />
          <span>About</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layoffs')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'layoffs'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <TrendingDown size={13} />
          <span>Layoffs ({layoffs.length})</span>
        </button>
      </div>

      {/* Tab 1: Posts */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          <PostComposer defaultFloor={floor._id} onPostCreated={(p) => setPosts((prev) => [p, ...prev])} />

          {posts.length === 0 ? (
            <Card className="p-8 text-center text-[var(--color-text-muted)] space-y-2 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <AsciiArt piece="empty-no-results" size={10} still={true} tone="muted" />
              <p>No transmissions posted on #{floor.name} yet. Be the first to post.</p>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onVote={handleVote}
                onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
              />
            ))
          )}
        </div>
      )}

      {/* Tab 2: About */}
      {activeTab === 'about' && (
        <Card className="p-6 space-y-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] font-mono text-xs">
          <div>
            <h2 className="text-sm font-bold uppercase text-[var(--color-text-primary)]">About #{floor.name}</h2>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
              {floor.description || 'Established to provide open communication channels for personnel.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--color-border)]">
            <div className="p-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">MEMBERS</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{floor.memberCount}</span>
            </div>
            <div className="p-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">POSTS</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{posts.length}</span>
            </div>
            <div className="p-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">VERIFIED CUTS</span>
              <span className="text-lg font-bold text-[var(--color-text-primary)]">{layoffs.length}</span>
            </div>
            <div className="p-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]">
              <span className="text-[10px] text-[var(--color-text-muted)] block">SECTOR</span>
              <span className="text-sm font-bold text-[var(--color-text-primary)]">{floor.category || 'Tech'}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Layoffs */}
      {activeTab === 'layoffs' && (
        <div className="space-y-3">
          {layoffs.length === 0 ? (
            <Card className="p-8 text-center text-[var(--color-text-muted)] space-y-2 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              <p>No confirmed layoffs recorded for {floor.name}.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/severed-floor">Submit a Report on the Severed Floor</Link>
              </Button>
            </Card>
          ) : (
            layoffs.map((item) => <LayoffRow key={item._id} layoff={item} />)
          )}
        </div>
      )}
    </div>
  );
}