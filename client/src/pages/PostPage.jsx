import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Avatar from '../components/Avatar';
import CommentItem from '../components/CommentItem';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Share2, Bookmark, Flag } from 'lucide-react';

const timeAgo = (dateStr) => {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
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
      const res = await api.post(`/posts/${id}/comments`, { body, parent: pId, isInnie });
      setComments((prev) => [...prev, res.data.comment]);
      setPost((prev) => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to reply');
    }
  };

  if (loading) return <div className="py-8 text-center text-xs text-[var(--muted)]">Loading post...</div>;
  if (!post) return <div className="py-8 text-center text-xs text-[var(--muted)]">Post not found.</div>;

  const authorName = post.author?.name || post.author?.username || 'Employee';
  const myHandle = isInnie ? user?.innieHandle : (user?.name || `@${user?.username || 'user'}`);
  const topLevelComments = comments.filter((c) => !c.parent);

  return (
    <div className="max-w-2xl mx-auto p-4 text-xs space-y-4">
      {/* Back link */}
      <div>
        <Link to={post.floor ? `/floors/${post.floor.slug}` : '/'} className="text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 font-meta">
          ‹ {post.floor ? post.floor.name : 'Home'}
        </Link>
      </div>

      {/* Full post */}
      <article className="pb-6 border-b border-[var(--border)] space-y-3">
        <div className="flex gap-3">
          <Avatar user={post.author} handle={post.innieHandle} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs font-meta">
              <span className="font-medium text-[var(--text)]">{post.isInnie ? post.innieHandle : authorName}</span>
              {!post.isInnie && post.author?.username && <span className="text-[var(--muted)]">@{post.author.username}</span>}
              {post.floor && <Link to={`/floors/${post.floor.slug}`} className="text-[var(--muted)] hover:text-[var(--text)]">{post.floor.name}</Link>}
              <span className="text-[var(--muted)]">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-[var(--text)] leading-tight font-head">
          {post.title}
        </h1>

        <div className="text-[15px] leading-relaxed text-[var(--text)] whitespace-pre-wrap">
          {post.body}
        </div>

        <div className="flex items-center gap-4 text-xs text-[var(--muted)] pt-3">
          <div className="flex items-center gap-1 tabular-nums font-medium">
            <button onClick={() => handleVote(post.userVote === 1 ? 0 : 1)} className={`p-1 cursor-pointer ${post.userVote === 1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}>▲</button>
            <span>{post.score || 0}</span>
            <button onClick={() => handleVote(post.userVote === -1 ? 0 : -1)} className={`p-1 cursor-pointer ${post.userVote === -1 ? 'text-[var(--accent)] font-semibold' : 'hover:text-[var(--text)]'}`}>▼</button>
          </div>
          <span className="flex items-center gap-1"><MessageSquare size={13} /> {post.commentCount || 0} comments</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="hover:text-[var(--text)] cursor-pointer flex items-center gap-1"
          >
            <Share2 size={13} /> {copied ? 'Copied' : 'Share'}
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await api.post(`/posts/${post._id}/save`);
                setIsSaved(res.data.isSaved);
              } catch {
                alert('Sign in to save posts.');
              }
            }}
            className={`hover:text-[var(--text)] cursor-pointer flex items-center gap-1 ${isSaved ? 'text-[var(--accent)]' : ''}`}
          >
            <Bookmark size={13} fill={isSaved ? 'var(--accent)' : 'none'} /> {isSaved ? 'Saved' : 'Save'}
          </button>
          <button onClick={async () => { await api.post('/reports', { targetType: 'post', targetId: post._id }); alert('Reported.'); }} className="hover:text-[var(--text)] cursor-pointer ml-auto flex items-center gap-1"><Flag size={13} /> Report</button>
        </div>
      </article>

      {/* Comment composer */}
      <form onSubmit={handleCreateComment} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-2">
        <span className="text-xs text-[var(--muted)] block">Commenting as {myHandle}</span>
        <Textarea rows={3} placeholder="Say it plainly." value={commentText} onChange={(e) => setCommentText(e.target.value)} />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[var(--muted)]">No phone numbers, emails or names of private people.</span>
          <Button type="submit" disabled={submitting} variant="default" size="sm">
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
          />
        ))}
      </div>
    </div>
  );
}
