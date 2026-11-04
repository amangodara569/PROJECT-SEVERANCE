import { useState } from 'react';
import VoteButtons from './VoteButtons';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import AsciiCustom from './AsciiCustom';
import innieGlyph from '../ascii/pieces/innie-glyph';

// Formats timestamp into relative format
const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// CommentItem: renders single comment with voting, reply, report, and nested replies
export default function CommentItem({ comment, replies = [], onVote, onAddReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reported, setReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isInnie } = useMode();
  const { user } = useAuth();
  const authorDisplay = comment.isInnie ? comment.innieHandle : `@${comment.author?.username || 'user'}`;

  // Submit a reply to this comment
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

  // Report comment to moderation
  const handleReport = async () => {
    if (reported) return;
    try {
      await api.post('/reports', { targetType: 'comment', targetId: comment._id });
      setReported(true);
      alert('Report submitted. Please enjoy all facts equally.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-3 font-mono text-xs">
      <div
        className="p-3 border flex gap-3"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          borderRadius: '2px'
        }}
      >
        <VoteButtons
          score={comment.score}
          userVote={comment.userVote}
          onVote={(val) => onVote(comment._id, val)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] mb-1" style={{ color: 'var(--muted)' }}>
            {comment.isInnie ? (
              <span className="inline-flex items-center gap-1.5 font-semibold" style={{ color: 'var(--text)' }}>
                <AsciiCustom make={innieGlyph} options={{ handle: comment.innieHandle }} size={5} still={true} tone="text" />
                <span>{authorDisplay}</span>
              </span>
            ) : (
              <span className="font-semibold" style={{ color: 'var(--text)' }}>
                {authorDisplay}
              </span>
            )}
            <span>·</span>
            <span>{timeAgo(comment.createdAt)}</span>
          </div>

          <p className="text-xs font-sans leading-relaxed mb-2" style={{ color: 'var(--text)' }}>
            {comment.body}
          </p>

          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--muted)' }}>
            <button
              type="button"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="hover:underline bg-transparent border-none p-0 cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              [ Reply ]
            </button>

            <button
              type="button"
              onClick={handleReport}
              className="hover:underline bg-transparent border-none p-0 cursor-pointer"
              style={{ color: reported ? 'var(--text)' : 'var(--muted)' }}
            >
              [ {reported ? 'Reported' : 'Report'} ]
            </button>
          </div>

          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="mt-3 pt-2 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
              <textarea
                required
                placeholder={`Replying as ${isInnie ? user?.innieHandle : `@${user?.username}`}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-2 text-xs border outline-none bg-transparent font-sans h-16"
                style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyBox(false)}
                  className="px-2 py-1 text-[11px] border bg-transparent"
                  style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3 py-1 text-[11px] font-semibold"
                  style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </button>
              </div>
              {isInnie && (
                <p className="font-mono text-[10px] leading-relaxed pt-1" style={{ color: 'var(--muted)' }}>
                  Innie hides your name from other users. It does not hide you from the platform. Never post details that identify you.
                </p>
              )}
            </form>
          )}
        </div>
      </div>

      {replies.length > 0 && (
        <div className="ml-6 pl-3 border-l space-y-2" style={{ borderColor: 'var(--border)' }}>
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
