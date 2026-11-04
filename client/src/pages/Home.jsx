import { useState, useEffect } from 'react';
import api from '../api/api';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import AsciiArt from '../components/AsciiArt';
import ErrorState from '../components/ErrorState';

// Home page: main post feed with New/Top sorting and composer
export default function Home() {
  const [posts, setPosts] = useState([]);
  const [sort, setSort] = useState('new');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch feed posts based on sort order
  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts?sort=${sort}`);
      setPosts(res.data.posts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort]);

  // Handle post created by composer
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Cast vote on a post
  const handleVote = async (postId, value) => {
    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, score: res.data.score, userVote: res.data.userVote } : p
        )
      );
    } catch (err) {
      console.error('Vote failed:', err.message);
    }
  };

  // Delete own post
  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    }
  };

  return (
    <div className="space-y-4">
      {/* Post Composer */}
      <PostComposer onPostCreated={handlePostCreated} />

      {/* Sort switcher */}
      <div className="flex items-center justify-between border-b pb-2 font-mono text-xs" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSort('new')}
            className={`border-none bg-transparent uppercase tracking-wider ${
              sort === 'new' ? 'font-bold' : 'hover:opacity-75'
            }`}
            style={{ color: sort === 'new' ? 'var(--text)' : 'var(--muted)' }}
          >
            NEW
          </button>
          <span style={{ color: 'var(--border)' }}>|</span>
          <button
            type="button"
            onClick={() => setSort('top')}
            className={`border-none bg-transparent uppercase tracking-wider ${
              sort === 'top' ? 'font-bold' : 'hover:opacity-75'
            }`}
            style={{ color: sort === 'top' ? 'var(--text)' : 'var(--muted)' }}
          >
            TOP
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <ErrorState message={error} onRetry={fetchPosts} />
      )}

      {/* Posts List */}
      {loading ? (
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</p>
      ) : posts.length === 0 ? (
        <div
          className="p-8 text-center border font-mono text-xs flex flex-col items-center justify-center space-y-3"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--muted)',
            backgroundColor: 'var(--surface)',
            borderRadius: '2px'
          }}
        >
          <AsciiArt piece="empty-cobweb-folder" size={12} still={true} tone="muted" />
          <p>Nothing here yet. The work is mysterious and important.</p>
        </div>
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
        </div>
      )}
    </div>
  );
}
