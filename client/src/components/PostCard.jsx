import { useState } from 'react';
import { Link } from 'react-router-dom';
import VoteButtons from './VoteButtons';
import api from '../api/api';
import AsciiCustom from './AsciiCustom';
import innieGlyph from '../ascii/pieces/innie-glyph';
import { useMode } from '../context/ModeContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

export default function PostCard({ post, onVote, onDelete }) {
  const [reported, setReported] = useState(false);
  const { isInnie } = useMode();
  const isPseudonymous = post.isInnie;
  const authorDisplay = isPseudonymous ? post.innieHandle : `@${post.author?.username || 'user'}`;

  const handleReport = async () => {
    if (reported) return;
    try {
      await api.post('/reports', { targetType: 'post', targetId: post._id });
      setReported(true);
      alert('Report submitted. Please enjoy all facts equally.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <Card className="p-4 flex flex-row gap-3.5 hover:border-[var(--border-focus)] transition-colors">
      <VoteButtons
        score={post.score}
        userVote={post.userVote}
        onVote={(val) => onVote && onVote(post._id, val)}
      />

      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-bold tracking-tight mb-1">
          <Link
            to={`/post/${post._id}`}
            className={`transition-colors hover:underline ${
              isInnie ? 'text-[#1d1d1d] hover:text-[#4a154b]' : 'text-[#FFFFFF] hover:text-[#FFC000]'
            }`}
          >
            {post.title}
          </Link>
        </h2>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] mb-2 text-[var(--muted)]">
          {post.floor && (
            <>
              <Badge variant={isInnie ? 'default' : 'outline'} className="text-[10px]">
                <Link to={`/floors/${post.floor.slug}`} className="hover:underline">
                  {isInnie ? `# ${post.floor.slug}` : post.floor.name.toUpperCase()}
                </Link>
              </Badge>
              <span>·</span>
            </>
          )}

          {isPseudonymous ? (
            <span className="inline-flex items-center gap-1.5 font-semibold text-[var(--text)]">
              <AsciiCustom make={innieGlyph} options={{ handle: post.innieHandle }} size={5} still={true} tone="text" />
              <span>{authorDisplay}</span>
            </span>
          ) : (
            <span className="text-[var(--text)]">{authorDisplay}</span>
          )}

          {(post.type === 'hired' || post.author?.status === 'Reintegrated') && (
            <Badge variant="cyan" className="text-[10px]">
              REINTEGRATED
            </Badge>
          )}

          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>

        <p className="text-xs line-clamp-2 leading-relaxed mb-3 text-[var(--text)]">
          {post.body}
        </p>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <Link
            to={`/post/${post._id}`}
            className={`px-2 py-1 text-xs flex items-center gap-1 transition-colors ${
              isInnie
                ? 'bg-[#f4ede4] text-[#4a154b] rounded-full hover:bg-[#ebd8f5]'
                : 'bg-[#202020] text-[#FFFFFF] hover:border-[#FFC000] border border-[#2c2c2c]'
            }`}
          >
            <span>💬</span>
            <span>{post.commentCount || 0} comments</span>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleReport}
            className="text-[11px]"
          >
            {reported ? '✓ Reported' : '⚑ Report'}
          </Button>

          {post.isOwner && (
            <Button
              type="button"
              variant="destructive"
              size="xs"
              onClick={() => onDelete && onDelete(post._id)}
              className="text-[11px]"
            >
              ✕ Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
