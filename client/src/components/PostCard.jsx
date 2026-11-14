import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Share2, Bookmark, Flag, Flame, Pin } from 'lucide-react';
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

// PostCard: Reddit-style card with left vote rail, type markers, share/save, and corner ticks
export default function PostCard({ post, onVote, onDelete, density = 'comfortable' }) {
  const { isInnie } = useMode();
  const [reported, setReported] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [copied, setCopied] = useState(false);

  const isPseudonymous = post.isInnie;
  const authorDisplay = isPseudonymous ? post.innieHandle : `@${post.author?.username || 'user'}`;
  const isHot = (post.score || 0) >= 10;
  const isCompact = density === 'compact';

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post._id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.post(`/posts/${post._id}/save`);
      setIsSaved(res.data.isSaved);
    } catch (err) {
      alert('Sign in to save transmissions.');
    }
  };

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
    <Card
      className={`relative group bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all ${
        isCompact ? 'p-2.5' : 'p-4'
      }`}
    >
      {/* Corner ticks for Severance aesthetic */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[var(--color-border)] pointer-events-none group-hover:border-[var(--color-primary)] transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[var(--color-border)] pointer-events-none group-hover:border-[var(--color-primary)] transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[var(--color-border)] pointer-events-none group-hover:border-[var(--color-primary)] transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[var(--color-border)] pointer-events-none group-hover:border-[var(--color-primary)] transition-colors" />

      {/* REINTEGRATED Highlight Strip for Hired Posts */}
      {post.type === 'hired' && (
        <div className="mb-2 pb-1.5 border-b border-[var(--color-border)] flex items-center justify-between text-[10px] font-mono font-bold text-[#007a5a]">
          <span className="flex items-center gap-1.5">
            <span>🧇</span>
            <span>REINTEGRATED TRANSMISSION // CELEBRATE RECOVERY</span>
          </span>
          <span className="uppercase text-[9px] tracking-wider text-[var(--color-text-muted)]">Verified</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Left: Vote Rail */}
        <div className="shrink-0 pt-0.5">
          <VoteButtons
            score={post.score}
            userVote={post.userVote ?? post.myVote}
            onVote={(val) => onVote && onVote(post._id, val)}
          />
        </div>

        {/* Right: Content Rail */}
        <div className="flex-1 min-w-0 font-mono text-xs">
          {/* Header Line */}
          <div className="flex items-center justify-between gap-2 text-[11px] text-[var(--color-text-muted)] mb-1">
            <div className="flex items-center gap-1.5 truncate">
              {post.pinned && (
                <Badge variant="default" size="sm" className="bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold text-[9px] flex items-center gap-0.5">
                  <Pin size={10} /> PINNED
                </Badge>
              )}

              {post.floor && (
                <Link
                  to={`/floors/${post.floor.slug}`}
                  className="font-bold text-[var(--color-text-primary)] hover:underline truncate"
                >
                  #{post.floor.name}
                </Link>
              )}

              <span>·</span>

              {isPseudonymous ? (
                <span className="inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)]">
                  <AsciiCustom make={innieGlyph} options={{ handle: post.innieHandle }} size={4} still={true} tone="text" />
                  <span>{authorDisplay}</span>
                </span>
              ) : (
                <Link to={`/u/${post.author?.username}`} className="text-[var(--color-text-secondary)] hover:underline">
                  {authorDisplay}
                </Link>
              )}

              <span>·</span>
              <span className="text-[10px]">{timeAgo(post.createdAt)}</span>
            </div>

            {/* Type badge and Hot indicator */}
            <div className="flex items-center gap-1 shrink-0">
              {isHot && (
                <span className="flex items-center gap-0.5 text-[10px] font-bold text-[#E01E5A] px-1 py-0.5 bg-[#E01E5A]/10 border border-[#E01E5A]/20">
                  <Flame size={11} /> HOT
                </span>
              )}

              <Badge variant="outline" size="sm" className="text-[9px] uppercase tracking-wider font-semibold">
                {post.type || 'VENT'}
              </Badge>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-sm font-bold tracking-tight mb-1">
            <Link
              to={`/post/${post._id}`}
              className="text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors"
            >
              {post.title}
            </Link>
          </h2>

          {/* Body preview (hidden in compact mode) */}
          {!isCompact && (
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mb-3 line-clamp-3">
              {post.body}
            </p>
          )}

          {/* Footer Action Bar */}
          <div className="flex items-center gap-2 pt-1 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)]">
            <Link
              to={`/post/${post._id}`}
              className="flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <MessageSquare size={13} />
              <span>{post.commentCount || 0} Comments</span>
            </Link>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <Share2 size={13} />
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSave}
              className={`flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-[var(--color-bg-subtle)] transition-colors ${
                isSaved ? 'text-[var(--color-primary)] font-bold' : 'hover:text-[var(--color-text-primary)]'
              }`}
            >
              <Bookmark size={13} fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleReport}
              className="flex items-center gap-1 px-2 py-1 rounded-sm hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text-primary)] transition-colors ml-auto"
            >
              <Flag size={13} />
              <span>{reported ? 'Reported' : 'Report'}</span>
            </button>

            {post.isOwner && (
              <button
                type="button"
                onClick={() => onDelete && onDelete(post._id)}
                className="text-[#E01E5A] hover:underline px-1 py-1"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}