import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="max-w-2xl mx-auto text-xs">
      <div className="py-4 px-3 border-b border-[var(--border)]">
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
        <div>
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
