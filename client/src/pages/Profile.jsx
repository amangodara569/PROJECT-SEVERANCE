import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// User personnel profile with Avatar, status dot, bio, edit form, and user post rows
export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateUser } = useAuth();
  const { isInnie } = useMode();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('Employed');
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.username === username;

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/users/${username}`);
        const u = res.data.user;
        setProfile(u);
        setPosts(res.data.posts || []);
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
    load();
  }, [username]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = isInnie
        ? { headline, bio, status }
        : { username: newUsername, avatar, headline, bio, status };
      const res = await api.put('/users/profile', payload);
      const updated = res.data.user;
      setProfile((prev) => ({ ...prev, ...updated }));
      if (updateUser) updateUser(updated);
      setIsEditing(false);
      if (!isInnie && updated.username && updated.username !== username) {
        navigate(`/u/${updated.username}`, { replace: true });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <div className="py-8 text-center text-xs text-[var(--muted)]">Loading profile...</div>;
  if (!profile) return <div className="py-8 text-center text-xs text-[var(--muted)]">User not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 text-xs space-y-6">
      {/* Header section */}
      <section className="space-y-4 pb-6 border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar user={profile} handle={profile.innieHandle} className="w-14 h-14 text-base" />
            <div>
              <h1 className="text-xl font-semibold text-[var(--text)] font-head">
                {isInnie ? profile.innieHandle : (profile.name || `@${profile.username}`)}
              </h1>
              {!isInnie && <span className="text-xs text-[var(--muted)] font-meta">@{profile.username}</span>}
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] font-meta">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                  <span>{profile.status || 'Employed'}</span>
                </span>
              </div>
            </div>
          </div>

          {isOwner && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit profile'}
            </Button>
          )}
        </div>

        {profile.headline && <p className="text-xs font-medium text-[var(--text)]">{profile.headline}</p>}
        {profile.bio && <p className="text-xs text-[var(--muted)] leading-relaxed max-w-xl">{profile.bio}</p>}

        {isEditing && (
          <form onSubmit={handleSave} className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] space-y-3">
            <h2 className="font-semibold text-sm text-[var(--text)]">Edit profile</h2>

            {!isInnie ? (
              <>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Username</label>
                  <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="username" />
                </div>
                <div>
                  <label className="block text-xs text-[var(--muted)] mb-1">Photo URL / Avatar</label>
                  <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://... or image link" />
                </div>
              </>
            ) : (
              <div className="p-2 border border-[var(--border)] bg-[var(--bg)] rounded-[var(--radius-sm)] text-[11px] text-[var(--muted)]">
                Innie handle is assigned by Lumon Industries and cannot be altered.
              </div>
            )}

            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Headline</label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Frontend Engineer" />
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-[var(--radius-sm)] p-2 text-xs"
              >
                <option value="Employed">Employed</option>
                <option value="Severed">Severed</option>
                <option value="Reintegrated">Reintegrated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[var(--muted)] mb-1">Bio</label>
              <Textarea rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
            <Button type="submit" variant="default" size="sm">Save changes</Button>
          </form>
        )}
      </section>

      {/* User's posts as rows */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--text)] px-3 pb-2 font-head">Posts</h2>
        {posts.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted)]">No posts shared yet.</div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={(id) => setPosts((p) => p.filter((x) => x._id !== id))} />
          ))
        )}
      </div>
    </div>
  );
}
