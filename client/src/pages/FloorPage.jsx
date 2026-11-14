import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import PostComposer from '../components/PostComposer';
import PostCard from '../components/PostCard';
import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function FloorPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { isInnie } = useMode();
  const [floor, setFloor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadFloorAndPosts = async () => {
    try {
      const floorRes = await api.get(`/floors/${slug}`);
      const f = floorRes.data.floor;
      setFloor(f);

      const postsRes = await api.get(`/posts?floor=${f._id}`);
      setPosts(postsRes.data.posts || postsRes.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.error || 'Floor not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFloorAndPosts();
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
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to update membership');
    }
  };

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

  const handleDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to delete post');
    }
  };

  if (loading) return <div className="font-mono text-xs text-[var(--muted)] py-4 text-center">Loading floor telemetry...</div>;

  if (error || !floor) {
    return (
      <Card className="p-8 text-center font-mono text-xs space-y-3">
        <AsciiArt piece="empty-no-results" size={12} still={true} tone="muted" />
        <h2 className="text-base font-bold uppercase tracking-wider text-[var(--destructive)]">Sector Not Found</h2>
        <p className="text-[var(--muted)]">{error || 'This floor does not exist or was decommissioned.'}</p>
        <Link to="/floors" className="inline-block mt-2 underline text-[var(--text)]">
          ← Back to Sectors
        </Link>
      </Card>
    );
  }

  const isMember = floor.isMember;

  return (
    <div className="space-y-4">
      <Card className="p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold tracking-tight text-[var(--text)]">
                {isInnie ? `# ${floor.slug}` : floor.name.toUpperCase()}
              </h1>
              <Badge variant={isInnie ? 'default' : 'outline'} className="text-[10px]">
                {floor.memberCount || 0} members
              </Badge>
            </div>
            <p className="text-xs text-[var(--muted)]">
              {floor.description || 'Corporate discussion forum for verified and displaced colleagues.'}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleToggleJoin}
            variant={isMember ? "secondary" : "default"}
            size="sm"
          >
            {isMember ? '✓ Joined Sector' : '+ Join Sector'}
          </Button>
        </div>
      </Card>

      <PostComposer
        defaultFloor={floor._id}
        onPostCreated={(newPost) => setPosts([newPost, ...posts])}
      />

      <div className="space-y-3">
        {posts.length === 0 ? (
          <Card className="p-8 text-center font-mono text-xs flex flex-col items-center justify-center space-y-3 text-[var(--muted)]">
            <AsciiArt piece="empty-cobweb-folder" size={12} still={true} tone="muted" />
            <p className="text-sm">No transmissions yet for this sector. Initiate the first record.</p>
          </Card>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onVote={handleVote}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
