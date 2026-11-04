import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import PostCard from '../components/PostCard';

// Profile page presenting Outie identity, status badges, and public posts
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

  // Load public profile and non-anonymous posts
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

  // Handle profile update
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

  if (loading) return <div className="font-mono text-xs" style={{ color: 'var(--muted)' }}>Loading...</div>;
  if (!profile) return <div className="p-8 text-center border font-mono text-xs" style={{ borderColor: 'var(--border)' }}>User not found.</div>;

  return (
    <div className="space-y-4">
      {/* Profile Header Card */}
      <div className="p-6 border space-y-3" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-lg font-bold tracking-tight">@{profile.username}</h1>
            <span className="px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ borderColor: 'var(--text)', color: 'var(--text)' }}>
              {profile.status}
            </span>
          </div>

          {isOwner && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-3 py-1 font-mono text-xs uppercase border"
              style={{ backgroundColor: 'var(--text)', color: 'var(--bg)', borderColor: 'var(--text)' }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>

        {profile.headline && <p className="font-mono text-xs font-semibold" style={{ color: 'var(--text)' }}>{profile.headline}</p>}
        {profile.bio && <p className="text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>{profile.bio}</p>}

        {/* Innie Persona Notice for account owner */}
        {isOwner && isInnie && (
          <div className="p-3 border mt-3 font-mono text-[11px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
            <span className="font-bold">Innie Persona: {currentUser?.innieHandle}</span>
            <p className="mt-1" style={{ color: 'var(--muted)' }}>
              Pseudonymous posts use this handle and are never linked to your public @{profile.username} profile.
            </p>
          </div>
        )}
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="p-4 border space-y-3 font-mono text-xs" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
          <h2 className="uppercase font-bold tracking-wider">Update Profile Information</h2>
          <div>
            <label className="block text-[11px] uppercase mb-1" style={{ color: 'var(--muted)' }}>Headline</label>
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full p-2 border outline-none bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>
          <div>
            <label className="block text-[11px] uppercase mb-1" style={{ color: 'var(--muted)' }}>Work Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="p-2 border bg-transparent" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
              <option value="Employed" style={{ background: 'var(--bg)' }}>Employed</option>
              <option value="Severed" style={{ background: 'var(--bg)' }}>Severed</option>
              <option value="Reintegrated" style={{ background: 'var(--bg)' }}>Reintegrated</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase mb-1" style={{ color: 'var(--muted)' }}>Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-2 border outline-none bg-transparent h-16 font-sans text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text)' }} />
          </div>
          <button type="submit" className="px-4 py-1.5 uppercase font-semibold" style={{ backgroundColor: 'var(--text)', color: 'var(--bg)' }}>Save Changes</button>
        </form>
      )}

      {/* User's Public Posts */}
      <div className="space-y-3 pt-2">
        <h3 className="font-mono text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Public Posts ({posts.length})</h3>
        {posts.length === 0 ? (
          <div className="p-8 text-center border font-mono text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
            No public posts shared by @{profile.username}.
          </div>
        ) : (
          posts.map((p) => <PostCard key={p._id} post={p} />)
        )}
      </div>
    </div>
  );
}
