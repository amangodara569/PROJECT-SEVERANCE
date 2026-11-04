import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import AsciiArt from '../components/AsciiArt';

// FloorPage shows details for a specific company floor and its posts
export default function FloorPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [floor, setFloor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load floor details and associated posts
  const loadFloorAndPosts = async () => {
    try {
      const floorRes = await api.get(`/floors/${slug}`);
      const f = floorRes.data.floor;
      setFloor(f);

      const postsRes = await api.get(`/posts?floor=${f._id}`);
      setPosts(postsRes.data.posts || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Floor not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloorAndPosts();
  }, [slug]);

  // Toggle join/leave
  const handleToggleJoin = async () => {
    try {
      const res = await api.post(`/floors/${slug}/join`);
      setFloor((prev) => ({
        ...prev,
        members: res.data.joined
          ? [...(prev.members || []), user?._id]
          : (prev.members || []).filter((id) => id !== user?._id)
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update membership');
    }
  };

  // Vote on a floor post
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

  if (loading) return <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>;

  if (error || !floor) {
    return (
      <div className="p-8 text-center border font-mono text-xs space-y-3" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--muted)' }}>This floor does not exist.</p>
        <Link to="/floors" className="underline" style={{ color: 'var(--text)' }}>Back to Floors</Link>
      </div>
    );
  }

  const isMember = floor.members?.some((m) => m === user?._id || m?._id === user?._id);

  return (
    <div className="space-y-4">
      {/* Floor Header */}
      <div className="p-4 border" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}>
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <h1 className="font-mono text-base font-bold uppercase tracking-wider">
            FLOOR: {floor.name}
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
              {floor.members?.length || 0} members
            </span>
            <button
              type="button"
              onClick={handleToggleJoin}
              className="px-3 py-1 font-mono text-xs uppercase border"
              style={{
                backgroundColor: isMember ? 'transparent' : 'var(--text)',
                color: isMember ? 'var(--text)' : 'var(--bg)',
                borderColor: 'var(--border)'
              }}
            >
              {isMember ? 'Leave' : 'Join'}
            </button>
          </div>
        </div>
        {floor.description && <p className="text-xs" style={{ color: 'var(--muted)' }}>{floor.description}</p>}
      </div>

      {/* Composer preselected with this floor */}
      <PostComposer
        defaultFloor={floor._id}
        onPostCreated={(p) => setPosts((prev) => [p, ...prev])}
      />

      {/* Posts */}
      {posts.length === 0 ? (
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
          <p>No posts in this floor yet. Be the first to share.</p>
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
