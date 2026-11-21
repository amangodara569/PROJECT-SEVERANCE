import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import { Button } from '@/components/ui/button';

// Floor detail page with plain header section, composer, sort, and post rows
export default function FloorPage() {
  const { slug } = useParams();
  const [floor, setFloor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [layoffs, setLayoffs] = useState([]);
  const [hiring, setHiring] = useState([]);
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFloor = async () => {
      try {
        const [fRes, lRes, jRes] = await Promise.all([
          api.get(`/floors/${slug}`),
          api.get('/layoffs'),
          api.get('/jobs')
        ]);
        const f = fRes.data.floor;
        setFloor(f);

        const pRes = await api.get(`/posts?floor=${f._id}&sort=${sort}`);
        setPosts(pRes.data.posts || pRes.data.items || []);

        const matchedLayoffs = (lRes.data.layoffs || []).filter(
          (l) => l.company && l.company.toLowerCase() === f.name.toLowerCase()
        );
        setLayoffs(matchedLayoffs);

        const matchedJobs = (jRes.data.jobs || []).filter(
          (j) => j.company && j.company.toLowerCase() === f.name.toLowerCase()
        );
        setHiring(matchedJobs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFloor();
  }, [slug, sort]);

  const handleToggleJoin = async () => {
    try {
      const res = await api.post(`/floors/${slug}/join`);
      setFloor((prev) => ({ ...prev, isMember: res.data.joined, memberCount: res.data.memberCount }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update membership');
    }
  };

  const handleVote = async (postId, value) => {
    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPosts((prev) => prev.map((p) => (p._id === postId ? { ...p, score: res.data.score, userVote: res.data.userVote } : p)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="py-8 text-center text-xs text-[var(--muted)]">Loading floor...</div>;
  if (!floor) return <div className="py-8 text-center text-xs text-[var(--muted)]">This floor does not exist.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6 items-start">
        {/* Main Feed Column */}
        <div className="space-y-4">
          {/* Plain header section (no boxed card): floor name, description, member count, Join */}
          <section className="space-y-2 pb-4 border-b border-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-[var(--text)] font-head">#{floor.name}</h1>
                <p className="text-xs text-[var(--muted)] mt-1">{floor.description || 'Corporate community exchange.'}</p>
                <span className="text-xs text-[var(--muted)] tabular-nums mt-1 block">{floor.memberCount} members</span>
              </div>
              <Button
                variant={floor.isMember ? 'outline' : 'default'}
                size="sm"
                onClick={handleToggleJoin}
              >
                {floor.isMember ? 'Joined' : 'Join'}
              </Button>
            </div>
          </section>

          {/* Composer */}
          <PostComposer defaultFloor={floor._id} onPostCreated={(p) => setPosts((prev) => [p, ...prev])} />

          {/* New / Top sort */}
          <div className="flex items-center justify-end gap-3 px-3 py-1 border-b border-[var(--border)]">
            <button
              onClick={() => setSort('new')}
              className={`cursor-pointer ${sort === 'new' ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              New
            </button>
            <button
              onClick={() => setSort('top')}
              className={`cursor-pointer ${sort === 'top' ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
            >
              Top
            </button>
          </div>

          {/* Post rows */}
          <div>
            {posts.length === 0 ? (
              <div className="py-12 text-center text-[var(--muted)]">No posts on this floor yet. Write the first one.</div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onVote={handleVote} onDelete={(id) => setPosts((p) => p.filter((x) => x._id !== id))} />
              ))
            )}
          </div>
        </div>

        {/* Right rail: About, Severed at this floor, Hiring now */}
        <aside className="space-y-6">
          <section className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
            <h2 className="font-semibold text-xs text-[var(--text)]">About</h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{floor.description || 'Community floor for personnel.'}</p>
          </section>

          <section className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
            <h2 className="font-semibold text-xs text-[var(--text)]">Severed at this floor</h2>
            {layoffs.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">No recorded reports.</p>
            ) : (
              layoffs.slice(0, 3).map((l) => (
                <div key={l._id} className="text-xs border-b border-[var(--border)] pb-1 last:border-b-0">
                  <span className="font-medium text-[var(--text)]">{l.peopleAffected || 0} affected</span>
                  <span className="text-[10px] text-[var(--muted)] block">{new Date(l.date).toLocaleDateString()}</span>
                </div>
              ))
            )}
          </section>

          <section className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
            <h2 className="font-semibold text-xs text-[var(--text)]">Hiring now</h2>
            {hiring.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">No open positions reported.</p>
            ) : (
              hiring.slice(0, 3).map((j) => (
                <div key={j._id} className="text-xs border-b border-[var(--border)] pb-1 last:border-b-0">
                  <a href={j.link} target="_blank" rel="noreferrer" className="font-medium text-[var(--text)] hover:underline block">{j.title}</a>
                  <span className="text-[10px] text-[var(--muted)] block">{j.location || 'Remote'}</span>
                </div>
              ))
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
