import { useState, useEffect } from 'react';
import api from '../api/api';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import OnboardingCard from '../components/OnboardingCard';
import ErrorState from '../components/ErrorState';
import { Button } from '@/components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';

// Main home feed: onboarding card, composer row, tabs with sort, and PostCard rows
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
      const res = await api.get(`/posts?sort=${sort}&limit=20`);
      let items = res.data.posts || res.data.items || [];
      if (activeTab === 'my-floors' && user) {
        items = items.filter((p) => p.floor && floors.some((f) => f._id === p.floor._id));
      }
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
      const res = await api.get(`/posts?sort=${sort}&limit=20&cursor=${encodeURIComponent(nextCursor)}`);
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
    <div className="max-w-2xl mx-auto text-xs">
      {/* Onboarding card at top for new users */}
      <OnboardingCard joinedCount={floors.length} postCount={posts.length} />

      {/* Composer row */}
      <PostComposer onPostCreated={(newPost) => setPosts((prev) => [newPost, ...prev])} />

      {/* Tabs (For you, My floors) with New / Top sort at right */}
      <div className="flex items-center justify-between px-3 border-b border-[var(--border)] pt-2 pb-1">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2 font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'all'
                ? 'border-[var(--accent)] text-[var(--text)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            For you
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('my-floors')}
            className={`pb-2 font-medium transition-colors border-b-2 cursor-pointer ${
              activeTab === 'my-floors'
                ? 'border-[var(--accent)] text-[var(--text)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--text)]'
            }`}
          >
            My floors
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => setSort('new')}
            className={`cursor-pointer transition-colors ${sort === 'new' ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
          >
            New
          </button>
          <button
            type="button"
            onClick={() => setSort('top')}
            className={`cursor-pointer transition-colors ${sort === 'top' ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
          >
            Top
          </button>
        </div>
      </div>

      {/* PostCard rows */}
      {error ? (
        <ErrorState message={error} onRetry={fetchPosts} />
      ) : loading ? (
        <div className="py-8 text-center text-[var(--muted)]">Loading feed...</div>
      ) : posts.length === 0 ? (
        <div className="py-12 text-center text-[var(--muted)]">No posts found. Write the first one above.</div>
      ) : (
        <div>
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
