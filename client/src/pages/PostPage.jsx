import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isInnie } = useMode();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [postRes, commRes] = await Promise.all([
        api.get(`/posts/${id}`),
        api.get(`/posts/${id}/comments`)
      ]);
      setPost(postRes.data.post);
      setComments(commRes.data.comments || []);

      if (postRes.data.post) {
        const p = postRes.data.post;
        try {
          const stored = JSON.parse(localStorage.getItem('linkedout:recent') || '[]');
          const updated = [{ title: p.title, url: `/post/${p._id}` }, ...stored.filter((r) => r.url !== `/post/${p._id}`)].slice(0, 5);
          localStorage.setItem('linkedout:recent', JSON.stringify(updated));
        } catch {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handlePostVote = async (postId, value) => {
    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPost((prev) => ({ ...prev, score: res.data.score, userVote: res.data.userVote }));
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/posts/${id}/comments`, {
        body: commentText.trim(),
        isInnie
      });

      setComments((prev) => [...prev, res.data.comment]);
      setCommentText('');
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to publish comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentVote = async (commentId, value) => {
    try {
      const res = await api.post(`/comments/${commentId}/vote`, { value });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, score: res.data.score, userVote: res.data.userVote } : c
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentReply = async (parentId, replyText) => {
    try {
      const res = await api.post(`/posts/${id}/comments`, {
        body: replyText,
        parent: parentId,
        isInnie
      });
      setComments((prev) => [...prev, res.data.comment]);
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post reply');
    }
  };

  const handleCommentDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setPost((prev) => ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 1) - 1) }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  if (loading) return <div className="font-mono text-xs text-[var(--color-text-muted)] py-8 text-center">Loading transmission details...</div>;
  if (!post) {
    return (
      <Card className="p-8 text-center font-mono text-xs space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <p className="text-[var(--color-text-muted)]">Transmission record not found or was severed.</p>
        <Link to="/" className="underline text-[var(--color-primary)]">Return to Feed</Link>
      </Card>
    );
  }

  const rootComments = comments.filter((c) => !c.parent);

  return (
    <div className="space-y-4 max-w-3xl mx-auto font-mono text-xs">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Primary Post Card */}
      <PostCard
        post={post}
        onVote={handlePostVote}
        onDelete={handlePostDelete}
        density="comfortable"
      />

      {/* Comment Composer Box */}
      <Card className="p-4 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
          <span>Leave a reply / reflection</span>
          <span>
            Replying as <strong className="text-[var(--color-text-primary)]">{isInnie ? user?.innieHandle : `@${user?.username}`}</strong>
          </span>
        </div>

        <form onSubmit={handleCreateComment} className="space-y-2.5">
          <Textarea
            required
            rows={3}
            placeholder="Share professional reflection or context (no personal contact data)..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="text-xs"
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting}
              variant="default"
              size="sm"
              className="uppercase font-semibold text-xs"
            >
              {submitting ? 'Submitting...' : 'Comment'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-[var(--color-text-muted)]">
          // RESPONSES ({comments.length})
        </h3>

        {rootComments.length === 0 ? (
          <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            No reflections added yet. Speak first.
          </Card>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              allComments={comments}
              onVote={handleCommentVote}
              onReply={handleCommentReply}
              onDelete={handleCommentDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}