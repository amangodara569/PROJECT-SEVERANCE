import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import PostCard from '../components/PostCard';
import CommentItem from '../components/CommentItem';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';

// PostPage: displays full post, comment form, and threaded comments
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

  // Load post and comments
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

  // Vote on post
  const handlePostVote = async (postId, value) => {
    try {
      const res = await api.post(`/posts/${postId}/vote`, { value });
      setPost((prev) => ({ ...prev, score: res.data.score, userVote: res.data.userVote }));
    } catch (err) {
      console.error(err);
    }
  };

  // Delete post
  const handlePostDelete = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${postId}`);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  // Add top-level or reply comment
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
      alert(err.response?.data?.error || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  // Vote on comment
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

  if (loading) return <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>;
  if (!post) {
    return (
      <div className="p-8 text-center border font-mono text-xs space-y-3" style={{ borderColor: 'var(--border)' }}>
        <p style={{ color: 'var(--muted)' }}>This post does not exist.</p>
        <Link to="/" className="underline" style={{ color: 'var(--text)' }}>Back to feed</Link>
      </div>
    );
  }

  // Group top-level comments and 1-level replies
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
      {/* Full post */}
      <PostCard post={post} onVote={handlePostVote} onDelete={handlePostDelete} />

      {/* Comment Composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleAddComment(); }}
        className="p-4 border space-y-3 font-mono text-xs"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}
      >
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider">Leave a Comment</span>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            Commenting as: <strong style={{ color: 'var(--text)' }}>{isInnie ? user?.innieHandle : `@${user?.username}`}</strong>
          </span>
        </div>
        <textarea
          required
          placeholder="Speak your mind..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="w-full p-2 text-xs font-sans border outline-none bg-transparent h-20"
          style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-1.5 uppercase font-semibold tracking-wider"
            style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
          >
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
        {isInnie && (
          <p className="font-mono text-[11px] leading-relaxed pt-1" style={{ color: 'var(--muted)' }}>
            Innie hides your name from other users. It does not hide you from the platform. Never post details that identify you.
          </p>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
          Discussion ({comments.length})
        </h3>
        {rootComments.length === 0 ? (
          <div className="p-6 text-center border font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            No comments yet. Start the conversation.
          </div>
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
