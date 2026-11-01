import { useState } from 'react';
import { Link } from 'react-router-dom';
import VoteButtons from './VoteButtons';
import api from '../api/api';

// Formats timestamp into short relative format
const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// PostCard component with voting, comments link, report button, and author identity
export default function PostCard({ post, onVote, onDelete }) {
  const [reported, setReported] = useState(false);
  const isAnonymous = post.isInnie;
  const authorDisplay = isAnonymous ? post.innieHandle : `@${post.author?.username || 'user'}`;

  // Report post to moderation
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
    <article
      className="p-4 border flex gap-3 transition-colors"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        borderRadius: '2px'
      }}
    >
      <VoteButtons
        score={post.score}
        userVote={post.userVote}
        onVote={(val) => onVote && onVote(post._id, val)}
      />

      <div className="flex-1 min-w-0">
        <h2 className="font-mono text-sm font-bold tracking-tight mb-1 hover:underline">
          <Link to={`/post/${post._id}`} style={{ color: 'var(--text)' }}>
            {post.title}
          </Link>
        </h2>

        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] mb-2" style={{ color: 'var(--muted)' }}>
          {post.floor && (
            <>
              <Link to={`/floors/${post.floor.slug}`} className="hover:underline font-semibold" style={{ color: 'var(--text)' }}>
                {post.floor.name}
              </Link>
              <span>·</span>
            </>
          )}

          <span>{authorDisplay}</span>

          {(post.type === 'hired' || post.author?.status === 'Reintegrated') && (
            <span className="px-1 border text-[9px] uppercase tracking-wider" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              Reintegrated
            </span>
          )}

          <span>·</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>

        <p className="text-xs line-clamp-2 leading-relaxed mb-3" style={{ color: 'var(--text)' }}>
          {post.body}
        </p>

        <div className="flex items-center gap-4 font-mono text-[11px]" style={{ color: 'var(--muted)' }}>
          <Link to={`/post/${post._id}`} className="hover:underline">
            [ {post.commentCount || 0} comments ]
          </Link>

          <button
            type="button"
            onClick={handleReport}
            className="hover:underline text-[11px] bg-transparent border-none p-0 cursor-pointer"
            style={{ color: reported ? 'var(--text)' : 'var(--muted)' }}
          >
            [ {reported ? 'Reported' : 'Report'} ]
          </button>

          {post.isOwner && (
            <button
              type="button"
              onClick={() => onDelete && onDelete(post._id)}
              className="hover:underline text-[11px] bg-transparent border-none p-0 cursor-pointer"
              style={{ color: 'var(--muted)' }}
            >
              [ Delete ]
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
