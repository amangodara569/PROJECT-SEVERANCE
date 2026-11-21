import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Share2, Bookmark, Flag } from 'lucide-react';
import Avatar from './Avatar';
import api from '../api/api';

const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// PostCard: hairline feed row with Avatar, author spans, title, 2-line body, and actions
export default function PostCard({ post, onVote, onDelete }) {
  const [reported, setReported] = useState(false);
  const [isSaved, setIsSaved] = useState(Boolean(post.isSaved));
  const [copied, setCopied] = useState(false);

  const authorName = post.author?.name || post.author?.username || 'Employee';
  const authorHandle = post.author?.username ? `@${post.author.username}` : '';

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
    } catch {
      alert('Sign in to save posts.');
    }
  };

  const handleReport = async () => {
    if (reported) return;
    try {
      await api.post('/reports', { targetType: 'post', targetId: post._id });
      setReported(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit report');
    }
  };

  return (
    <article className="py-[var(--row-pad)] px-3 border-b border-[var(--border)] hover:bg-[var(--hover)] transition-colors">
      <div className="flex gap-3">
        <Avatar user={post.author} handle={post.innieHandle} />

        <div className="flex-1 min-w-0">
          {/* Author line as separate spans, no dot-joined strings */}
          <div className="flex flex-wrap items-center gap-2 text-xs mb-1 font-meta">
            <span className="font-medium text-[var(--text)]">
              {post.isInnie ? post.innieHandle : authorName}
            </span>
            {!post.isInnie && authorHandle && (
              <span className="text-[var(--muted)]">{authorHandle}</span>
            )}
            {post.floor && (
              <Link to={`/floors/${post.floor.slug}`} className="text-[var(--muted)] hover:text-[var(--text)]">
                {post.floor.name}
              </Link>
            )}
            <span className="text-[var(--muted)]">{timeAgo(post.createdAt)}</span>

            {post.type === 'hired' && (
              <span className="inline-flex items-center gap-1.5 text-[var(--muted)] ml-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                <span>Reintegrated</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="mb-1">
            <Link
              to={`/post/${post._id}`}
              className="text-[17px] leading-[24px] font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors font-head block"
            >
              {post.title}
            </Link>
          </h2>

          {/* 2-line body */}
          <p className="text-[15px] leading-[24px] text-[var(--text)] line-clamp-2 mb-3">
            {post.body}
          </p>

          {/* Action Row */}
          <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
            <div className="flex items-center gap-1 tabular-nums font-medium">
              <button
                type="button"
                onClick={() => onVote && onVote(post._id, (post.userVote ?? post.myVote) === 1 ? 0 : 1)}
                className={`p-1 cursor-pointer transition-colors ${(post.userVote ?? post.myVote) === 1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
                title="Upvote"
              >
                ▲
              </button>
              <span>{post.score || 0}</span>
              <button
                type="button"
                onClick={() => onVote && onVote(post._id, (post.userVote ?? post.myVote) === -1 ? 0 : -1)}
                className={`p-1 cursor-pointer transition-colors ${(post.userVote ?? post.myVote) === -1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}
                title="Downvote"
              >
                ▼
              </button>
            </div>

            <Link to={`/post/${post._id}`} className="flex items-center gap-1.5 hover:text-[var(--text)]">
              <MessageSquare size={13} />
              <span>{post.commentCount || 0} comments</span>
            </Link>

            <button type="button" onClick={handleShare} className="flex items-center gap-1.5 hover:text-[var(--text)] cursor-pointer">
              <Share2 size={13} />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              type="button"
              onClick={handleToggleSave}
              className={`flex items-center gap-1.5 hover:text-[var(--text)] cursor-pointer ${isSaved ? 'text-[var(--accent)]' : ''}`}
            >
              <Bookmark size={13} fill={isSaved ? 'var(--accent)' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              type="button"
              onClick={handleReport}
              className="flex items-center gap-1.5 hover:text-[var(--text)] ml-auto cursor-pointer"
            >
              <Flag size={13} />
              <span>{reported ? 'Reported' : 'Report'}</span>
            </button>

            {post.isOwner && (
              <button
                type="button"
                onClick={() => onDelete && onDelete(post._id)}
                className="hover:text-[var(--text)] cursor-pointer"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
