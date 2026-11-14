import { useState, useEffect } from 'react';
import api from '../api/api';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import AsciiArt from '../components/AsciiArt';
import ErrorState from '../components/ErrorState';
import { useMode } from '../context/ModeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const { isInnie } = useMode();

  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/posts?sort=${sort}&limit=20`);
      const items = res.data.posts || res.data.items || [];
      setPosts(items);
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await api.get(`/posts?sort=${sort}&limit=20&cursor=${encodeURIComponent(nextCursor)}`);
      const items = res.data.posts || res.data.items || [];
      setPosts((prev) => [...prev, ...items]);
      setNextCursor(res.data.nextCursor || null);
    } catch (err) {
      console.error('Failed to load more posts:', err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handleVote = async (postId, value) => {
    const previousPosts = [...posts];

    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p;
        const currentVote = p.userVote || p.myVote || 0;
        let delta = 0;
        let nextVote = 0;
        if (currentVote === value) {
          delta = -value;
          nextVote = 0;
        } else {
          delta = value - currentVote;
          nextVote = value;
        }
        return {
          ...p,
          score: (p.score || 0) + delta,
          myVote: nextVote,
          userVote: nextVote
        };
      })
    );

    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId
            ? { ...p, score: res.data.score, userVote: res.data.userVote, myVote: res.data.userVote }
            : p
        )
      );
    } catch (err) {
      setPosts(previousPosts);
      console.error('Vote failed:', err.message);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to delete post');
    }
  };

  return (
    <div className="space-y-4">
      <PostComposer onPostCreated={handlePostCreated} />

      <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant={sort === 'new' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setSort('new')}
            className="uppercase tracking-wider font-bold"
          >
            {isInnie ? 'Recent' : '⚡ LATEST'}
          </Button>
          <Button
            type="button"
            variant={sort === 'top' ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setSort('top')}
            className="uppercase tracking-wider font-bold"
          >
            {isInnie ? 'Popular' : '🔥 TOP SCORE'}
          </Button>
        </div>

        <span className="text-[10px] text-[var(--muted)]">
          {isInnie ? 'Viewing #general' : 'STREAM: REALTIME'}
        </span>
      </div>

      {error && (
        <ErrorState message={error} onRetry={fetchPosts} />
      )}

      {loading ? (
        <p className="font-mono text-xs text-[var(--muted)] py-4 text-center">Loading transmissions...</p>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center flex flex-col items-center justify-center space-y-3 font-mono text-xs text-[var(--muted)]">
          <AsciiArt piece="empty-cobweb-folder" size={12} still={true} tone="muted" />
          <p className="text-sm">Nothing here yet. The work is mysterious and important.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onVote={handleVote}
              onDelete={handleDelete}
            />
          ))}

          {nextCursor && (
            <div className="pt-2 text-center">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="font-mono text-xs tracking-wider"
              >
                {loadingMore ? 'FETCHING OLDER TRANSMISSIONS...' : 'LOAD MORE TRANSMISSIONS ↓'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
