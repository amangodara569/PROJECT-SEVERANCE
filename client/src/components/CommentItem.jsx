import { useState } from 'react';
import Avatar from './Avatar';
import api from '../api/api';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// Comment item with Avatar, separate author spans, and 40px indented reply thread
export default function CommentItem({ comment, replies = [], onVote, onAddReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reported, setReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const authorName = comment.author?.name || comment.author?.username || 'Employee';

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

  const handleReport = async () => {
    if (reported) return;
    try {
      await api.post('/reports', { targetType: 'comment', targetId: comment._id });
      setReported(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-3 py-3 border-b border-[var(--border)] text-xs">
      <div className="flex gap-3">
        <Avatar user={comment.author} handle={comment.innieHandle} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 text-xs font-meta">
            <span className="font-medium text-[var(--text)]">
              {comment.isInnie ? comment.innieHandle : authorName}
            </span>
            <span className="text-[var(--muted)]">{timeAgo(comment.createdAt)}</span>
          </div>

          <p className="text-[15px] leading-relaxed mb-2 text-[var(--text)]">
            {comment.body}
          </p>

          <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1 tabular-nums font-medium">
              <button
                type="button"
                onClick={() => onVote && onVote(comment._id, comment.userVote === 1 ? 0 : 1)}
                className={`p-1 cursor-pointer transition-colors ${comment.userVote === 1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
                title="Upvote"
              >
                ▲
              </button>
              <span>{comment.score || 0}</span>
              <button
                type="button"
                onClick={() => onVote && onVote(comment._id, comment.userVote === -1 ? 0 : -1)}
                className={`p-1 cursor-pointer transition-colors ${comment.userVote === -1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
                title="Downvote"
              >
                ▼
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:text-[var(--text)] cursor-pointer"
            >
              Reply
            </button>

            <button
              type="button"
              onClick={handleReport}
              className="hover:text-[var(--text)] cursor-pointer ml-auto"
            >
              {reported ? 'Reported' : 'Report'}
            </button>
          </div>

          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="mt-3 space-y-2">
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

      {/* Indented 40px (ml-10) with no left border per theme v2 spec */}
      {replies.length > 0 && (
        <div className="ml-10 space-y-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply._id}
              comment={reply}
              replies={[]}
              onVote={onVote}
              onAddReply={onAddReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
