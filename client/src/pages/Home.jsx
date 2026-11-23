import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import PostCard from '../components/PostCard';
import OnboardingCard from '../components/OnboardingCard';
import ErrorState from '../components/ErrorState';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

// Main home feed: onboarding card, tabs with sort, and PostCard cards with universal spacing
export default function Home() {
  const { user } = useAuth();
  const { mode } = useMode();
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [sort, setSort] = useState('new');
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      api.get('/floors').then((res) => {
        const all = res.data.floors || [];
        setFloors(all.filter((f) => f.isMember));
      }).catch(() => {});
    }
  }, [user, mode]);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const tabParam = activeTab === 'my-floors' ? '&tab=my-floors' : '';
      const res = await api.get(`/posts?sort=${sort}&limit=20${tabParam}`);
      const items = res.data.posts || res.data.items || [];
      setPosts(items);
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [sort, activeTab, mode]);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const tabParam = activeTab === 'my-floors' ? '&tab=my-floors' : '';
      const res = await api.get(`/posts?sort=${sort}&limit=20&cursor=${encodeURIComponent(nextCursor)}${tabParam}`);
      const items = res.data.posts || res.data.items || [];
      setPosts((prev) => [...prev, ...items]);
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
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

  return (
    <div className={`max-w-3xl w-full mx-auto px-4 pb-12 text-xs ${mode === 'outie' ? 'space-y-0' : 'space-y-4'}`}>
      {/* Static / Sticky Tabs Bar (For you, My floors) with New / Top sort at right */}
      <div className={`sticky top-14 z-30 bg-[var(--bg)] -mx-4 px-4 pt-3 pb-2.5 flex items-center justify-between transition-colors ${
        mode === 'outie' ? 'border-b border-[#1E2D28]' : 'border-b border-[var(--border)]'
      }`}>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-1.5 font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? (mode === 'outie' ? 'border-[#E5E5E5] text-[#E5E5E5] font-semibold' : 'border-[var(--accent)] text-[var(--text)]')
                : (mode === 'outie' ? 'border-transparent text-[#7A8080] hover:text-[#E5E5E5]' : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]')
            }`}
          >
            For you
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-floors')}
            className={`pb-1.5 font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'my-floors'
                ? (mode === 'outie' ? 'border-[#E5E5E5] text-[#E5E5E5] font-semibold' : 'border-[var(--accent)] text-[var(--text)]')
                : (mode === 'outie' ? 'border-transparent text-[#7A8080] hover:text-[#E5E5E5]' : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]')
            }`}
          >
            My floors
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setSort('new')}
            className={`cursor-pointer transition-colors ${
              mode === 'outie'
                ? (sort === 'new' ? 'bg-[#1E2D28] text-[#E5E5E5] font-semibold px-3 py-1 rounded' : 'text-[#7A8080] hover:text-[#E5E5E5] px-2 py-1')
                : (sort === 'new' ? 'bg-[var(--surface)] font-semibold text-[var(--text)] border border-[var(--border)] px-2 py-0.5 rounded' : 'text-[var(--muted)] hover:text-[var(--text)] px-2 py-0.5')
            }`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => setSort('top')}
            className={`cursor-pointer transition-colors ${
              mode === 'outie'
                ? (sort === 'top' ? 'bg-[#1E2D28] text-[#E5E5E5] font-semibold px-3 py-1 rounded' : 'text-[#7A8080] hover:text-[#E5E5E5] px-2 py-1')
                : (sort === 'top' ? 'bg-[var(--surface)] font-semibold text-[var(--text)] border border-[var(--border)] px-2 py-0.5 rounded' : 'text-[var(--muted)] hover:text-[var(--text)] px-2 py-0.5')
            }`}
          >
            Top
          </button>
        </div>
      </div>

      {/* Onboarding card below static tabs bar for new users */}
      <OnboardingCard joinedCount={floors.length} postCount={posts.length} />

      {/* PostCard cards with universal spacing */}
      {error ? (
        <ErrorState message={error} onRetry={fetchPosts} />
      ) : loading ? (
        <div className="py-8 text-center text-[var(--muted)]">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted)] space-y-3">
          <p>
            {activeTab === 'my-floors'
              ? 'No transmissions from your joined floors yet. Join company floors to populate your feed.'
              : 'No transmissions found. Click + New post to start one.'}
          </p>
          {activeTab === 'my-floors' && (
            <div>
              <Button asChild variant="outline" size="sm">
                <Link to="/floors">Explore Floors</Link>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={mode === 'outie' ? 'space-y-0' : 'space-y-4'}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onVote={handleVote}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      )}

      {/* Cursor Pagination */}
      {nextCursor && !loading && (
        <div className="py-6 text-center">
          <Button variant="outline" size="sm" disabled={loadingMore} onClick={handleLoadMore}>
            {loadingMore ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}
