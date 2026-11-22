import { useState } from 'react';
import { ArrowBigUp, ArrowBigDown, Trash2, Pencil, X } from 'lucide-react';
import Avatar from './Avatar';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Textarea } from '@/components/ui/textarea';
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

// Comment item with Avatar, reply-to indication, arrow voting, owner edit/delete with confirmation modal, and threaded replies
export default function CommentItem({ comment, replies = [], onVote, onAddReply, onDeleteComment }) {
  const { user } = useAuth();
  const [body, setBody] = useState(comment.body);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [isSaving, setIsSaving] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const authorDisplayName = comment.isInnie
    ? (comment.innieHandle || 'Innie-0000')
    : (comment.author?.name || (comment.author?.username ? `@${comment.author.username}` : 'Employee'));

  // Strict role-based ownership: only the true author of this comment can edit or delete
  const currentUserId = user?._id || user?.id;
  const authorId = comment.author?._id || comment.author;
  const isOwner = Boolean(
    user && (
      (currentUserId && authorId && currentUserId.toString() === authorId.toString()) ||
      (comment.author?.username && user.username === comment.author.username) ||
      (comment.isInnie && user.innieHandle && comment.innieHandle === user.innieHandle)
    )
  );

  const handleSaveCommentEdit = async (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    setIsSaving(true);
    try {
      const res = await api.put(`/comments/${comment._id}`, { body: editText.trim() });
      setBody(res.data.comment.body);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update comment');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddReply(comment._id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDeleteComment) {
        await onDeleteComment(comment._id);
      } else {
        await api.delete(`/comments/${comment._id}`);
      }
      setShowDeleteConfirm(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3 py-3 border-b border-[var(--border)] text-xs">
      <div className="flex gap-3">
        <Avatar user={comment.author} handle={comment.innieHandle} className="w-8 h-8 text-xs shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 text-xs font-meta">
            <span className="font-semibold text-[var(--text)]">
              {authorDisplayName}
            </span>
            {comment.replyToUser && (
              <span className="text-[11px] text-[var(--accent)] font-medium">
                replying to @{comment.replyToUser}
              </span>
            )}
            <span className="text-[11px] text-[var(--muted)]">{timeAgo(comment.createdAt)}</span>
          </div>

          {/* Comment Body or Inline Editor */}
          {isEditing ? (
            <form onSubmit={handleSaveCommentEdit} className="my-2 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
              <span className="text-[11px] text-[var(--muted)] font-medium block">Editing comment</span>
              <Textarea
                required
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    setEditText(body);
                    setIsEditing(false);
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="xs" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-[14px] leading-relaxed mb-2 text-[var(--text)] whitespace-pre-wrap">
              {body}
            </p>
          )}

          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-0.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] px-1 py-0.5 tabular-nums font-medium">
              <button
                type="button"
                onClick={() => onVote && onVote(comment._id, comment.userVote === 1 ? 0 : 1)}
                className={`p-0.5 rounded cursor-pointer transition-colors ${
                  comment.userVote === 1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'
                }`}
                title="Upvote"
              >
                <ArrowBigUp size={15} fill={comment.userVote === 1 ? 'currentColor' : 'none'} />
              </button>
              <span className={`px-1 text-[11px] font-semibold ${comment.userVote !== 0 ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>
                {comment.score || 0}
              </span>
              <button
                type="button"
                onClick={() => onVote && onVote(comment._id, comment.userVote === -1 ? 0 : -1)}
                className={`p-0.5 rounded cursor-pointer transition-colors ${
                  comment.userVote === -1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'
                }`}
                title="Downvote"
              >
                <ArrowBigDown size={15} fill={comment.userVote === -1 ? 'currentColor' : 'none'} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:text-[var(--text)] cursor-pointer font-medium"
            >
              Reply
            </button>

            {/* Strict Role-Based Owner Options: Edit & Delete buttons appear ONLY for comment author */}
            {isOwner && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setEditText(body);
                    setIsEditing(!isEditing);
                  }}
                  className="hover:text-[var(--text)] cursor-pointer font-medium flex items-center gap-1 transition-colors"
                  title="Edit comment"
                >
                  <Pencil size={12} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-400 hover:text-red-300 cursor-pointer font-medium flex items-center gap-1 transition-colors"
                  title="Delete comment"
                >
                  <Trash2 size={12} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="mt-3 p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
              <span className="text-[11px] text-[var(--muted)] block">
                Replying to <span className="text-[var(--text)] font-medium">{authorDisplayName}</span>
              </span>
              <Textarea
                required
                rows={2}
                placeholder="Say it plainly."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="xs" onClick={() => setShowReplyBox(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} variant="default" size="xs">
                  {isSubmitting ? 'Replying...' : 'Reply'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Delete Confirmation Popup Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="w-full max-w-sm p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <span className="font-semibold text-sm text-[var(--text)] font-head">
                Delete Comment
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
              Do you want to delete this comment? This action will permanently remove it from the database and cannot be undone.
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

      {/* Indented threaded replies */}
      {replies.length > 0 && (
        <div className="ml-6 sm:ml-8 pl-3 border-l border-[var(--border)] space-y-3 pt-2">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replies={[]}
              onVote={onVote}
              onAddReply={onAddReply}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
}
