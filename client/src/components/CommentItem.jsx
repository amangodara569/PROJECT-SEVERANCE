import { useState } from 'react';
import VoteButtons from './VoteButtons';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import AsciiCustom from './AsciiCustom';
import innieGlyph from '../ascii/pieces/innie-glyph';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function CommentItem({ comment, replies = [], onVote, onAddReply }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [reported, setReported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isInnie } = useMode();
  const { user } = useAuth();
  const authorDisplay = comment.isInnie ? comment.innieHandle : `@${comment.author?.username || 'user'}`;

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
      alert('Report submitted. Please enjoy all facts equally.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <div className="space-y-2.5 font-mono text-xs">
      <Card className="p-3.5 flex gap-3 transition-colors">
        <VoteButtons
          score={comment.score}
          userVote={comment.userVote}
          onVote={(val) => onVote(comment._id, val)}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] mb-1.5 text-[var(--muted)]">
            {comment.isInnie ? (
              <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text)]">
                <AsciiCustom make={innieGlyph} options={{ handle: comment.innieHandle }} size={5} still={true} tone="text" />
                <span>{authorDisplay}</span>
              </span>
            ) : (
              <span className="font-semibold text-[var(--text)]">
                {authorDisplay}
              </span>
            )}
            <span>·</span>
            <span>{timeAgo(comment.createdAt)}</span>
          </div>

          <p className="text-xs leading-relaxed mb-2 text-[var(--text)] font-sans">
            {comment.body}
          </p>

          <div className="flex items-center gap-2 text-[11px]">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => setShowReplyBox(!showReplyBox)}
              className="text-[11px]"
            >
              Reply
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={handleReport}
              className="text-[11px]"
            >
              {reported ? '✓ Reported' : 'Report'}
            </Button>
          </div>

          {showReplyBox && (
            <form onSubmit={handleReplySubmit} className="mt-3 pt-2.5 border-t border-[var(--border)] space-y-2">
              <div>
                <Textarea
                  required
                  rows={3}
                  placeholder={`Replying as ${isInnie ? user?.innieHandle : `@${user?.username}`}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowReplyBox(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="default"
                  size="xs"
                >
                  {isSubmitting ? 'Posting...' : 'Reply'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {replies.length > 0 && (
        <div className={`ml-6 pl-3 border-l space-y-2 border-[var(--border)]`}>
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
