import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Avatar from '../components/Avatar';
import CommentItem from '../components/CommentItem';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Share2, Bookmark, ArrowBigUp, ArrowBigDown, Trash2, Pencil, X, ArrowLeft } from 'lucide-react';

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 52) return `${weeks}w ago`;
  const years = Math.floor(weeks / 52);
  return `${years}y ago`;
};

// Full transmission view with author line, comment composer, and 40px indented replies
export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isInnie } = useMode();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDeletePostConfirm, setShowDeletePostConfirm] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [showEditPostModal, setShowEditPostModal] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostBody, setEditPostBody] = useState('');
  const [isSavingPostEdit, setIsSavingPostEdit] = useState(false);

  const handleSavePostEdit = async (e) => {
    e.preventDefault();
    if (!editPostTitle.trim() || !editPostBody.trim()) return;
    setIsSavingPostEdit(true);
    try {
      const res = await api.put(`/posts/${post._id}`, {
        title: editPostTitle.trim(),
        body: editPostBody.trim()
      });
      setPost((prev) => ({
        ...prev,
        title: res.data.post.title,
        body: res.data.post.body
      }));
      setShowEditPostModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update post');
    } finally {
      setIsSavingPostEdit(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    setIsDeletingPost(true);
    try {
      await api.delete(`/posts/${post._id}`);
      setShowDeletePostConfirm(false);
      navigate('/', { replace: true });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const loadData = async () => {
    try {
      const [pRes, cRes] = await Promise.all([api.get(`/posts/${id}`), api.get(`/posts/${id}/comments`)]);
      setPost(pRes.data.post);
      setIsSaved(Boolean(pRes.data.post?.isSaved));
      setComments(cRes.data.comments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleVote = async (val) => {
    try {
      const res = await api.post(`/posts/${id}/vote`, { value: val });
      setPost((prev) => ({ ...prev, score: res.data.score, userVote: res.data.userVote }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${id}/comments`, { body: commentText.trim(), isInnie });
      setComments((prev) => [...prev, res.data.comment]);
      setCommentText('');
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentVote = async (cId, val) => {
    try {
      const res = await api.post(`/comments/${cId}/vote`, { value: val });
      setComments((prev) => prev.map((c) => (c._id === cId ? { ...c, score: res.data.score, userVote: res.data.userVote } : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommentReply = async (pId, body) => {
    try {
      const res = await api.post(`/posts/${id}/comments`, { body, parentId: pId, isInnie });
      setComments((prev) => [...prev, res.data.comment]);
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to reply');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId && c.parent !== commentId));
      setPost((prev) => ({ ...prev, commentCount: Math.max((prev.commentCount || 1) - 1, 0) }));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete comment');
    }
  };

  if (loading) return <div className="py-8 text-center text-xs text-[var(--muted)]">Loading post...</div>;
  if (!post) return <div className="py-8 text-center text-xs text-[var(--muted)]">Post not found.</div>;

  const authorName = post.author?.name || post.author?.username || 'Employee';
  const myHandle = isInnie ? user?.innieHandle : (user?.name || `@${user?.username || 'user'}`);
  const topLevelComments = comments.filter((c) => !c.parent);

  // Strict role-based ownership: only the true author of this post can edit or delete
  const currentUserId = user?._id || user?.id;
  const authorId = post.author?._id || post.author;
  const isPostOwner = Boolean(
    user && (
      (currentUserId && authorId && currentUserId.toString() === authorId.toString()) ||
      (post.author?.username && user.username === post.author.username) ||
      (post.isInnie && user.innieHandle && post.innieHandle === user.innieHandle)
    )
  );

  return (
    <div className="max-w-3xl w-full mx-auto p-4 text-xs space-y-4">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(post.floor ? `/floors/${post.floor.slug}` : '/'))}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Full post */}
      <article className={`pb-6 space-y-3 ${isInnie ? 'border-b border-[var(--border)]' : 'border-b border-[#1E2D28]'}`}>
        <div className="flex items-center gap-3">
          <Avatar user={post.author} handle={post.innieHandle} className="w-10 h-10 text-xs shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${isInnie ? 'text-[var(--text)]' : 'text-[#7A8080]'}`}>
                {post.isInnie ? (post.innieHandle || 'Innie-0000') : (post.author?.name || (post.author?.username ? `@${post.author.username}` : 'Employee'))}
              </span>
              {post.floor && (
                <Link to={`/floors/${post.floor.slug}`} className={`text-xs hover:underline ${isInnie ? 'text-[var(--accent)]' : 'text-[#7A8080]'}`}>
                  #{post.floor.name}
                </Link>
              )}
            </div>
            <div className="text-[11px] text-[var(--muted)] font-meta mt-0.5">
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>

        <h1 className={`text-xl sm:text-2xl font-bold leading-tight font-head ${isInnie ? 'text-[var(--text)]' : 'text-[#5A7EE6]'}`}>
          {post.title}
        </h1>

        <div className={`text-[14px] leading-relaxed whitespace-pre-wrap ${isInnie ? 'text-[var(--text)]' : 'text-[#E5E5E5] font-mono'}`}>
          {post.body}
        </div>

        <div className="flex items-center gap-4 text-xs text-[var(--muted)] pt-3">
          <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-1 py-0.5 tabular-nums font-medium">
            <button
              onClick={() => handleVote(post.userVote === 1 ? 0 : 1)}
              className={`p-1 rounded cursor-pointer ${post.userVote === 1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
              title="Upvote"
            >
              <ArrowBigUp size={16} fill={post.userVote === 1 ? 'currentColor' : 'none'} />
            </button>
            <span className={`px-1 text-xs font-semibold ${post.userVote !== 0 ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
              {post.score || 0}
            </span>
            <button
              onClick={() => handleVote(post.userVote === -1 ? 0 : -1)}
              className={`p-1 rounded cursor-pointer ${post.userVote === -1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
              title="Downvote"
            >
              <ArrowBigDown size={16} fill={post.userVote === -1 ? 'currentColor' : 'none'} />
            </button>
          </div>
          <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.commentCount || 0} comments</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="hover:text-[var(--text)] cursor-pointer flex items-center gap-1"
          >
            <Share2 size={14} /> {copied ? 'Copied' : 'Share'}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await api.post(`/posts/${post._id}/save`);
                setIsSaved(res.data.isSaved);
              } catch (err) {
                if (err.response?.status === 401) {
                  alert('Please sign in to save posts.');
                } else {
                  alert(err.response?.data?.error || 'Failed to update bookmark.');
                }
              }
            }}
            className={`hover:text-[var(--text)] cursor-pointer flex items-center gap-1 ${isSaved ? 'text-[var(--accent)] font-medium' : ''}`}
          >
            <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Saved' : 'Save'}
          </button>

          {isPostOwner && (
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setEditPostTitle(post.title);
                  setEditPostBody(post.body);
                  setShowEditPostModal(true);
                }}
                className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer flex items-center gap-1 font-medium transition-colors"
                title="Edit post"
              >
                <Pencil size={13} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeletePostConfirm(true)}
                className="text-red-400 hover:text-red-300 cursor-pointer flex items-center gap-1 font-medium transition-colors"
                title="Delete post"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </article>

      {/* Post Edit Modal */}
      {showEditPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Edit Post
              </span>
              <button
                type="button"
                onClick={() => setShowEditPostModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSavePostEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Body</label>
                <textarea
                  required
                  rows={5}
                  maxLength={2000}
                  value={editPostBody}
                  onChange={(e) => setEditPostBody(e.target.value)}
                  className="w-full p-3 text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] font-mono resize-y"
                />
                <div className="flex justify-end">
                  <span className={`text-[11px] font-mono tabular-nums ${editPostBody.length > 1900 ? 'text-amber-400 font-semibold' : 'text-[var(--muted)]'}`}>
                    {editPostBody.length} / 2000
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditPostModal(false)}
                  disabled={isSavingPostEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSavingPostEdit || editPostBody.length > 2000}
                  className="bg-[var(--accent)] text-[var(--accent-ink)] font-bold rounded-full px-4"
                >
                  {isSavingPostEdit ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Post Delete Confirmation Popup Modal */}
      {showDeletePostConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-sm p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Delete Post
              </span>
              <button
                type="button"
                onClick={() => setShowDeletePostConfirm(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-[var(--text)] leading-relaxed">
              Do you want to delete this post? This action will permanently remove it from the database and cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeletePostConfirm(false)}
                disabled={isDeletingPost}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeletePost}
                disabled={isDeletingPost}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeletingPost ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comment composer */}
      <form onSubmit={handleCreateComment} className={
        isInnie
          ? "p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2"
          : "py-4 px-1 bg-transparent border-0 border-b border-[#1E2D28] space-y-2"
      }>
        <span className="text-xs text-[var(--muted)] block">Commenting as {myHandle}</span>
        <Textarea
          rows={3}
          placeholder="Say it plainly."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className={!isInnie ? "bg-[#141414] border-[#1E2D28] text-[#E5E5E5] font-mono resize-y" : ""}
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--muted)]">No phone numbers, emails or names of private people.</span>
          <Button
            type="submit"
            disabled={submitting}
            variant="default"
            size="sm"
            className={!isInnie ? "bg-[#B0E4CC] text-[#091413] font-bold rounded-full px-4 hover:opacity-90" : ""}
          >
            {submitting ? 'Commenting...' : 'Comment'}
          </Button>
        </div>
      </form>

      {/* Comments list with 1 level indented 40px (no left border) */}
      <div className="space-y-1 pt-2">
        {topLevelComments.map((c) => (
          <CommentItem
            key={c._id}
            comment={c}
            replies={comments.filter((r) => r.parent === c._id)}
            onVote={handleCommentVote}
            onAddReply={handleCommentReply}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}
