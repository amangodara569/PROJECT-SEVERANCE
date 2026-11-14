import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft } from 'lucide-react';
import api from '../api/api';
import PostCard from '../components/PostCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Saved() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  return (
    <div className="space-y-4 max-w-2xl mx-auto font-mono text-xs">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] flex items-center gap-1.5">
            <Bookmark size={15} /> // SAVED TRANSMISSIONS
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            Private bookmarks saved to your account.
          </p>
        </div>
        <Button asChild variant="outline" size="xs">
          <Link to="/">Back to Feed</Link>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 border border-[var(--color-border)] bg-[var(--color-bg-card)] animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-2">
          <Bookmark size={24} className="mx-auto opacity-30" />
          <p>No transmissions saved yet.</p>
          <span className="text-[11px] block">Click [ Save ] on any post to bookmark it here for quick reference.</span>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}