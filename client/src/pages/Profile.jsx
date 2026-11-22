import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import api from '../api/api';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// User personnel profile with display view, toggleable pre-filled edit form, and user post cards
export default function Profile() {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { isInnie } = useMode();

  const targetUsername = routeUsername || currentUser?.username;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('Employed');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isOwner = Boolean(
    currentUser &&
    targetUsername &&
    currentUser.username?.toLowerCase() === targetUsername.toLowerCase()
  );

  const loadProfile = async () => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/users/${targetUsername}`);
      const u = res.data.user;
      setProfile(u);
      setPosts(res.data.posts || []);
      setName(u.name || '');
      setNewUsername(u.username || '');
      setAvatar(u.avatar || '');
      setHeadline(u.headline || '');
      setBio(u.bio || '');
      setStatus(u.status || 'Employed');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [targetUsername]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = isInnie
        ? { headline: headline.trim(), bio: bio.trim(), status }
        : {
            name: name.trim(),
            username: newUsername.trim(),
            avatar: avatar.trim(),
            headline: headline.trim(),
            bio: bio.trim(),
            status
          };
      const res = await api.put('/users/profile', payload);
      const updated = res.data.user;
      setProfile((prev) => ({ ...prev, ...updated }));
      if (updateUser) updateUser(updated);
      setIsEditing(false);
      if (!isInnie && updated.username && updated.username !== targetUsername) {
        navigate(`/u/${updated.username}`, { replace: true });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-xs text-[var(--muted)]">Loading personnel profile...</div>;
  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center text-xs space-y-3">
        <p className="text-[var(--muted)]">Personnel records not found.</p>
        <Button asChild variant="outline" size="sm">
          <Link to="/">Back to feed</Link>
        </Button>
      </div>
    );
  }

  const displayName = isInnie
    ? profile.innieHandle
    : (profile.name || `@${profile.username}`);

  return (
    <div className="max-w-2xl mx-auto p-4 text-xs space-y-6">
      {/* Top back navigation */}
      <div>
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to feed</span>
        </button>
      </div>

      {/* Profile Header presented in authentic corporate card format */}
      <section className="p-5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-4 shadow-sm">
        {/* Classification and Employment Status Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)]">
              {isInnie ? 'Severed Department • Personnel File' : 'Outie Personnel Record'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-xs font-medium text-[var(--text)] font-meta">{profile.status || 'Employed'}</span>
          </div>
        </div>

        {/* Identity Details */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar user={profile} handle={profile.innieHandle} className="w-16 h-16 text-lg shrink-0 border border-[var(--border)]" />
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[var(--text)] font-head truncate">
                {displayName}
              </h1>
              {!isInnie && Boolean(profile.name) && (
                <span className="text-xs text-[var(--muted)] font-meta block mt-0.5">
                  @{profile.username}
                </span>
              )}
              {isInnie && (
                <span className="text-xs text-[var(--muted)] font-meta block mt-0.5">
                  Macrodata Refinement & General Floors
                </span>
              )}
            </div>
          </div>

          {isOwner && (
            <Button
              type="button"
              variant={isEditing ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                if (!isEditing) {
                  setName(profile.name || '');
                  setNewUsername(profile.username || '');
                  setAvatar(profile.avatar || '');
                  setHeadline(profile.headline || '');
                  setBio(profile.bio || '');
                  setStatus(profile.status || 'Employed');
                }
                setIsEditing(!isEditing);
              }}
              className="shrink-0"
            >
              <Pencil size={13} className="mr-1.5" />
              {isEditing ? 'Cancel' : 'Edit profile'}
            </Button>
          )}
        </div>

        {/* Professional Headline */}
        {profile.headline && (
          <p className="text-xs font-semibold text-[var(--text)]">{profile.headline}</p>
        )}

        {/* Bio callout */}
        {profile.bio && (
          <p className="text-xs text-[var(--muted)] leading-relaxed border-l-2 border-[var(--accent)] pl-3 py-1.5 bg-[var(--bg)] rounded-r-[var(--radius-sm)]">
            {profile.bio}
          </p>
        )}

        {/* Personnel Statistics Bar */}
        <div className="pt-3 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="space-y-0.5 p-2 rounded bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-sm font-semibold tabular-nums text-[var(--text)] font-head block">
              {profile.postCount ?? posts.length}
            </span>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
              Transmissions
            </span>
          </div>
          <div className="space-y-0.5 p-2 rounded bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-sm font-semibold tabular-nums text-[var(--text)] font-head block">
              {profile.commentCount ?? 0}
            </span>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
              Responses
            </span>
          </div>
          <div className="space-y-0.5 p-2 rounded bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-sm font-semibold tabular-nums text-[var(--text)] font-head block">
              {profile.floorCount ?? 0}
            </span>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
              Floors
            </span>
          </div>
          <div className="space-y-0.5 p-2 rounded bg-[var(--bg)] border border-[var(--border)]">
            <span className="text-sm font-semibold tabular-nums text-[var(--text)] font-head block">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Active'}
            </span>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider block">
              Enrolled
            </span>
          </div>
        </div>

        {/* Edit Form Section: Pre-filled with previous data */}
        {isEditing && (
          <form
            onSubmit={handleSave}
            className="pt-4 border-t border-[var(--border)] space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h2 className="font-semibold text-sm text-[var(--text)] font-head">Edit profile</h2>
              <span className="text-[11px] text-[var(--muted)]">Personnel details</span>
            </div>

            {!isInnie ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Display Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aman Sharma"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Username</label>
                  <Input
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted)] mb-1">Photo URL / Avatar</label>
                  <Input
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://... or image link"
                  />
                </div>
              </>
            ) : (
              <div className="p-2 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius-sm)] text-[11px] text-[var(--muted)]">
                Innie handle is assigned by Lumon Industries and cannot be altered.
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Headline</label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Lead Architect @ TechNova"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius-sm)] p-2 text-xs focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <option value="Employed">Employed</option>
                <option value="Severed">Severed</option>
                <option value="Reintegrated">Reintegrated</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--muted)] mb-1">Bio</label>
              <Textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief summary of your professional status..."
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={saving} variant="default" size="sm">
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </section>

      {/* User's posts as cards with universal spacing */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text)] px-1 pb-3 font-head">Transmissions</h2>
        {posts.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)]">No transmissions shared yet.</div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={(id) => setPosts((p) => p.filter((x) => x._id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
