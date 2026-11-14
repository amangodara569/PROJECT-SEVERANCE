import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import PostCard from '../components/PostCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { isInnie } = useMode();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('Employed');
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.username === username;

  const loadProfile = async () => {
    try {
      const res = await api.get(`/users/${username}`);
      setProfile(res.data.user);
      setPosts(res.data.posts || []);
      setHeadline(res.data.user.headline || '');
      setBio(res.data.user.bio || '');
      setStatus(res.data.user.status || 'Employed');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', { headline, bio, status });
      setProfile(res.data.user);
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <div className="font-mono text-xs text-[var(--color-text-muted)]">Loading...</div>;
  if (!profile) return <Card className="p-8 text-center font-mono text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)]">User not found.</Card>;

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <Card className="p-6 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg font-bold tracking-tight text-[var(--color-text-primary)]">@{profile.username}</h1>
            <Badge variant="outline" size="sm" className="font-mono text-[10px] uppercase tracking-wider font-semibold">
              {profile.status}
            </Badge>
          </div>

          {isOwner && (
            <Button
              type="button"
              variant="default"
              size="xs"
              onClick={() => setIsEditing(!isEditing)}
              className="font-mono text-xs uppercase"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          )}
        </div>

        {profile.headline && <p className="font-mono text-xs font-semibold text-[var(--color-text-primary)]">{profile.headline}</p>}
        {profile.bio && <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{profile.bio}</p>}

        {/* Innie Persona Notice for account owner */}
        {isOwner && isInnie && (
          <div className="p-3 mt-3 font-mono text-[11px] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-card)' }}>
            <span className="font-bold text-[var(--color-text-primary)]">Innie Persona: {currentUser?.innieHandle}</span>
            <p className="mt-1 text-[var(--color-text-muted)]">
              Pseudonymous posts use this handle and are never linked to your public @{profile.username} profile.
            </p>
          </div>
        )}
      </Card>

      {/* Edit Form */}
      {isEditing && (
        <Card className="p-4 space-y-3 font-mono text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <h2 className="uppercase font-bold tracking-wider text-[var(--color-text-primary)]">Update Profile Information</h2>
            <div>
              <label className="block text-[11px] uppercase mb-1 text-[var(--color-text-muted)]">Headline</label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full text-xs font-mono" />
            </div>
            <div>
              <label className="block text-[11px] uppercase mb-1 text-[var(--color-text-muted)]">Work Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-2 border bg-[var(--color-bg-card)] text-[var(--color-text-primary)] border-[var(--color-border)] text-xs font-mono"
                style={{ borderRadius: 'var(--radius-input)' }}
              >
                <option value="Employed">Employed</option>
                <option value="Severed">Severed</option>
                <option value="Reintegrated">Reintegrated</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase mb-1 text-[var(--color-text-muted)]">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full h-20 text-xs" />
            </div>
            <Button type="submit" variant="default" size="sm" className="uppercase font-semibold font-mono">
              Save Changes
            </Button>
          </form>
        </Card>
      )}

      {/* User's Public Posts */}
      <div className="space-y-3 pt-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
          Public Posts ({posts.length})
        </h3>
        {posts.length === 0 ? (
          <Card className="p-8 text-center font-mono text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <p className="text-sm">No public posts shared by @{profile.username}.</p>
          </Card>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} />)
        )}
      </div>
    </div>
  );
}