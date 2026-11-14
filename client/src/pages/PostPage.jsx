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
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleAddComment = async (parentId = null, text = null) => {
    const body = text || commentText;
    if (!body?.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, {
        body,
        parentId,
        isInnie
      });
      setComments((prev) => [...prev, res.data.comment]);
      if (!parentId) setCommentText('');
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.error?.message || err.response?.data?.error || 'Failed to add comment');
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

  if (loading) return <div className="font-mono text-xs text-[var(--muted)] py-4 text-center">Loading transmission record...</div>;
  if (!post) {
    return (
      <Card className="p-8 text-center font-mono text-xs space-y-3">
        <p className="text-[var(--muted)]">This post does not exist or has been removed.</p>
        <Link to="/" className="inline-block mt-2">
          <Button variant="outline" size="sm">
            Back to feed
          </Button>
        </Link>
      </Card>
    );
  }

  const rootComments = comments.filter((c) => !c.parent);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent) {
      acc[c.parent] = acc[c.parent] || [];
      acc[c.parent].push(c);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <PostCard post={post} onVote={handlePostVote} onDelete={handlePostDelete} />

      <Card className="p-4 space-y-3 font-mono text-xs">
        <form
          onSubmit={(e) => { e.preventDefault(); handleAddComment(); }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-[var(--text)]">
              {isInnie ? 'Add to thread' : 'RECORD TRANSMISSION RESPONSE'}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              Responding as: <strong className="text-[var(--text)]">{isInnie ? user?.innieHandle : `@${user?.username}`}</strong>
            </span>
          </div>
          <Textarea
            required
            rows={3}
            placeholder={isInnie ? "Reply to thread..." : "Record telemetry response..."}
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
            >
              {submitting ? 'Transmitting...' : isInnie ? 'Send Reply' : 'DISPATCH RESPONSE'}
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3 pt-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--muted)]">
          {isInnie ? `# Thread Replies (${comments.length})` : `TRANSMISSION THREAD (${comments.length})`}
        </h3>
        {rootComments.length === 0 ? (
          <Card className="p-6 text-center font-mono text-xs text-[var(--muted)]">
            <p className="text-sm">No comments recorded yet. Initiate the response log.</p>
          </Card>
        ) : (
          rootComments.map((root) => (
            <CommentItem
              key={root._id}
              comment={root}
              replies={repliesByParent[root._id] || []}
              onVote={handleCommentVote}
              onAddReply={(parentId, text) => handleAddComment(parentId, text)}
            />
          ))
        )}
      </div>
    </div>
  );
}
