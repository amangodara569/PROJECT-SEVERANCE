import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../api/api';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';
import { useMode } from '../context/ModeContext';

// Saved bookmarks feed using PostCard rows and empty state
export default function Saved() {
  const { mode } = useMode();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSaved = async () => {
    try {
      const res = await api.get('/me/saved');
      setPosts(res.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, [mode]);

  const handleUnsave = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="max-w-2xl mx-auto p-4 text-xs space-y-4">
      {/* Back button */}
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

      <div className={`pb-3 ${mode === 'outie' ? 'border-b border-[#1E2D28]' : 'border-b border-[var(--border)]'}`}>
        <h1 className="text-xl font-semibold text-[var(--text)] font-head">
          Saved
        </h1>
      </div>

      {loading ? (
        <div className="py-8 text-center text-[var(--muted)]">Loading saved transmissions...</div>
      ) : posts.length === 0 ? (
        <EmptyState
          message="Nothing saved yet. Select Save on a post to keep it here."
          actionLabel="Browse the feed"
          onAction={() => navigate('/')}
        />
      ) : (
        <div className={mode === 'outie' ? 'space-y-0' : 'space-y-4 p-3'}>
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={{ ...post, isSaved: true }}
              onDelete={handleUnsave}
            />
          ))}
        </div>
      )}
    </div>
  );
}
