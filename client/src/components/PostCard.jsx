import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Share2, Bookmark, ArrowBigUp, ArrowBigDown, Trash2, Pencil, X } from 'lucide-react';
import Avatar from './Avatar';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Button } from '@/components/ui/button';

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

// PostCard: Decoupled architecture supporting Outie (OLED borderless) and Innie (Lumon framed)
export default function PostCard({ post, onVote, onDelete }) {
  const { user } = useAuth();
  const { mode } = useMode();
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [copied, setCopied] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editBody, setEditBody] = useState(post.body);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const currentVote = post.userVote ?? post.myVote ?? 0;
  const isOutieMode = mode === 'outie';

  // Role-based ownership check
  const currentUserId = user?._id || user?.id;
  const authorId = post.author?._id || post.author;
  const isOwner = Boolean(
    user && (
      (currentUserId && authorId && currentUserId.toString() === authorId.toString()) ||
      (post.author?.username && user.username && post.author.username === user.username) ||
      (post.isInnie && user.innieHandle && post.innieHandle === user.innieHandle)
    )
  );

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editBody.trim() || editBody.length > 2000) return;
    setIsSavingEdit(true);
    try {
      const res = await api.put(`/posts/${post._id}`, {
        title: editTitle.trim(),
        body: editBody.trim()
      });
      setTitle(res.data.post.title);
      setBody(res.data.post.body);
      setShowEditModal(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update post');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      setShowDeleteConfirm(false);
      if (onDelete) onDelete(post._id);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const authorDisplayName = post.isInnie
    ? (post.innieHandle || 'Innie-0000')
    : (post.author?.name || (post.author?.username ? `@${post.author.username}` : 'Employee'));

  const handleShare = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = async (e) => {
    e.preventDefault();
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
  };

  return (
    <>
      {isOutieMode ? (
        /* ================= OUTIE ARCHITECTURE (OLED Black, Borderless, Periwinkle Titles) ================= */
        <article className="py-5 px-1 border-b border-[#1E2D28] space-y-3 text-xs bg-transparent">
          {/* Header Row */}
          <div className="flex items-center gap-3">
            <Avatar user={post.author} handle={post.innieHandle} className="w-8 h-8 text-xs shrink-0 bg-[#262A2A] text-[#E5E5E5]" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7A8080] font-medium truncate">
                  {authorDisplayName}
                </span>
                {post.floor && (
                  <Link
                    to={`/floors/${post.floor.slug}`}
                    className="text-xs text-[#5A7EE6] hover:underline truncate font-medium"
                  >
                    #{post.floor.name}
                  </Link>
                )}
              </div>
              <div className="text-[11px] text-[#7A8080] font-meta mt-0.5">
                {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          {/* Post Title: LUMON FOREST GREEN #2A835F */}
          <h2>
            <Link
              to={`/post/${post._id}`}
              className="text-[16px] sm:text-[17px] leading-snug font-bold text-[#2A835F] hover:underline transition-colors font-head block"
            >
              {title}
            </Link>
          </h2>

          {/* Post Content Body: Monospace in #E5E5E5 */}
          <p className="text-[13.5px] leading-relaxed text-[#E5E5E5] font-mono whitespace-pre-wrap">
            {body}
          </p>

          {/* Media slot */}
          {post.mediaUrl && (
            <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[#1E2D28] max-h-96 bg-[#0a0a0a]">
              <img src={post.mediaUrl} alt="" className="w-full object-cover" />
            </div>
          )}

          {/* Engagement Section: Borderless inline items */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-[#7A8080]">
            <div className="flex items-center gap-5">
              {/* Upvote / Downvote */}
              <div className="flex items-center gap-1.5 text-xs text-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => onVote && onVote(post._id, currentVote === 1 ? 0 : 1)}
                  className={`cursor-pointer transition-colors ${currentVote === 1 ? 'text-[#B0E4CC]' : 'hover:text-white'}`}
                  title="Upvote"
                  aria-label="Upvote"
                >
                  <ArrowBigUp size={16} fill={currentVote === 1 ? 'currentColor' : 'none'} />
                </button>
                <span className={currentVote !== 0 ? 'text-[#B0E4CC] font-semibold' : 'text-[#E5E5E5]'}>
                  {post.score || 0}
                </span>
                <button
                  type="button"
                  onClick={() => onVote && onVote(post._id, currentVote === -1 ? 0 : -1)}
                  className={`cursor-pointer transition-colors ${currentVote === -1 ? 'text-[#B0E4CC]' : 'hover:text-white'}`}
                  title="Downvote"
                  aria-label="Downvote"
                >
                  <ArrowBigDown size={16} fill={currentVote === -1 ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Comments Link */}
              <Link
                to={`/post/${post._id}`}
                className="flex items-center gap-1.5 hover:text-[#E5E5E5] transition-colors"
              >
                <MessageSquare size={14} />
                <span>{post.commentCount || 0} comments</span>
              </Link>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-[#E5E5E5] cursor-pointer transition-colors"
              >
                <Share2 size={14} />
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              {/* Save / Bookmark Button */}
              <button
                type="button"
                onClick={handleToggleSave}
                className={`flex items-center gap-1.5 hover:text-[#E5E5E5] cursor-pointer transition-colors ${isSaved ? 'text-[#B0E4CC] font-medium' : ''}`}
              >
                <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {/* Author Edit / Delete */}
            {isOwner && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditTitle(title);
                    setEditBody(body);
                    setShowEditModal(true);
                  }}
                  className="hover:text-[#E5E5E5] cursor-pointer transition-colors flex items-center gap-1 font-medium"
                  title="Edit post"
                >
                  <Pencil size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 cursor-pointer transition-colors flex items-center gap-1 font-medium"
                  title="Delete post"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </article>
      ) : (
        /* ================= INNIE ARCHITECTURE (Lumon Light Mode, Framed Cards) ================= */
        <article className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] hover:border-[var(--muted)] transition-all space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <Avatar user={post.author} handle={post.innieHandle} className="w-9 h-9 text-xs shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[var(--text)] truncate">
                  {authorDisplayName}
                </span>
                {post.floor && (
                  <Link
                    to={`/floors/${post.floor.slug}`}
                    className="text-xs text-[var(--accent)] hover:underline truncate"
                  >
                    #{post.floor.name}
                  </Link>
                )}
              </div>
              <div className="text-[11px] text-[var(--muted)] font-meta mt-0.5">
                {timeAgo(post.createdAt)}
              </div>
            </div>
          </div>

          <h2>
            <Link
              to={`/post/${post._id}`}
              className="text-[16px] sm:text-[17px] leading-snug font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors font-head block"
            >
              {title}
            </Link>
          </h2>

          <p className="text-[14px] leading-relaxed text-[var(--text)] line-clamp-3 whitespace-pre-wrap">
            {body}
          </p>

          {post.mediaUrl && (
            <div className="rounded-[var(--radius-sm)] overflow-hidden border border-[var(--border)] max-h-96 bg-[var(--bg)]">
              <img src={post.mediaUrl} alt="" className="w-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-0.5 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] px-1 py-0.5 tabular-nums font-medium">
                <button
                  type="button"
                  onClick={() => onVote && onVote(post._id, currentVote === 1 ? 0 : 1)}
                  className={`p-1 rounded cursor-pointer transition-colors ${currentVote === 1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
                  title="Upvote"
                >
                  <ArrowBigUp size={16} fill={currentVote === 1 ? 'currentColor' : 'none'} />
                </button>
                <span className={`px-1 text-xs font-semibold ${currentVote !== 0 ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                  {post.score || 0}
                </span>
                <button
                  type="button"
                  onClick={() => onVote && onVote(post._id, currentVote === -1 ? 0 : -1)}
                  className={`p-1 rounded cursor-pointer transition-colors ${currentVote === -1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
                  title="Downvote"
                >
                  <ArrowBigDown size={16} fill={currentVote === -1 ? 'currentColor' : 'none'} />
                </button>
              </div>

              <Link to={`/post/${post._id}`} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--hover)] hover:text-[var(--text)] transition-colors">
                <MessageSquare size={14} />
                <span>{post.commentCount || 0} comments</span>
              </Link>

              <button type="button" onClick={handleShare} className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--hover)] hover:text-[var(--text)] cursor-pointer transition-colors">
                <Share2 size={14} />
                <span>{copied ? 'Copied' : 'Share'}</span>
              </button>

              <button type="button" onClick={handleToggleSave} className={`flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[var(--hover)] cursor-pointer transition-colors ${isSaved ? 'text-[var(--accent)] font-medium' : 'hover:text-[var(--text)]'}`}>
                <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditTitle(title);
                    setEditBody(body);
                    setShowEditModal(true);
                  }}
                  className="px-2 py-1 text-[var(--muted)] hover:text-[var(--text)] rounded hover:bg-[var(--hover)] cursor-pointer transition-colors flex items-center gap-1 font-medium"
                >
                  <Pencil size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-2 py-1 text-red-400 hover:text-red-300 rounded hover:bg-[var(--hover)] cursor-pointer transition-colors flex items-center gap-1 font-medium"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </article>
      )}

      {/* Edit Post Modal with 2000-char limit */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-lg p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Edit Post
              </span>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[var(--muted)] mb-1">Body</label>
                <textarea
                  required
                  rows={5}
                  maxLength={2000}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full p-3 text-xs bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] font-mono resize-y"
                />
                <div className="flex justify-end">
                  <span className={`text-[11px] font-mono tabular-nums ${editBody.length > 1900 ? 'text-amber-400 font-semibold' : 'text-[var(--muted)]'}`}>
                    {editBody.length} / 2000
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                  disabled={isSavingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  disabled={isSavingEdit || editBody.length > 2000}
                  className="bg-[var(--accent)] text-[var(--accent-ink)] font-bold rounded-full px-4"
                >
                  {isSavingEdit ? 'Saving...' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-sm p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Delete Post
              </span>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
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
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
