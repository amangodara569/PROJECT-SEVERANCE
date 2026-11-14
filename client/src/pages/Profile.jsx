import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import PostCard from '../components/PostCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, FileText, Layers, Edit3 } from 'lucide-react';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { isInnie } = useMode();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userFloors, setUserFloors] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'comments' | 'floors'
  const [isEditing, setIsEditing] = useState(false);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('Employed');
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.username === username;

  const loadProfile = async () => {
    try {
      const [userRes, floorsRes] = await Promise.all([
        api.get(`/users/${username}`),
        api.get('/floors')
      ]);

      const u = userRes.data.user;
      setProfile(u);
      setPosts(userRes.data.posts || []);
      setHeadline(u.headline || '');
      setBio(u.bio || '');
      setStatus(u.status || 'Employed');

      const allFloors = floorsRes.data.floors || [];
      if (isOwner && currentUser?.joinedFloors) {
        setUserFloors(allFloors.filter((f) => currentUser.joinedFloors.includes(f._id)));
      } else {
        setUserFloors(allFloors.slice(0, u.floorCount || 3));
      }
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
      setProfile((prev) => ({ ...prev, ...res.data.user }));
      setIsEditing(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) return <div className="font-mono text-xs text-[var(--color-text-muted)] py-8 text-center">Loading personnel file...</div>;
  if (!profile) return <Card className="p-8 text-center font-mono text-xs bg-[var(--color-bg-card)] border border-[var(--color-border)]">User not found.</Card>;

  const initial = profile.username?.[0]?.toUpperCase() || 'U';

  return (
    <div className="space-y-4 max-w-4xl mx-auto font-mono text-xs">
      {/* Banner Strip & Profile Header (Instagram + LinkedIn) */}
      <div
        className="border border-[var(--color-border)] bg-[var(--color-bg-card)] relative overflow-hidden shadow-sm"
        style={{ borderRadius: 'var(--radius-card)' }}
      >
        {/* Banner Graphic Header with numbers-grid pattern */}
        <div className="h-28 bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)] relative overflow-hidden p-3 flex items-start justify-between">
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none opacity-5 font-mono text-[9px] leading-tight select-none"
          >
            {Array(8).fill('0 4 7 2 9 3 8 1 5 0 9 2 4 8 1 5 0 3 7 4 1 6 8 2 9').join('\n')}
          </div>
          <span className="relative z-10 text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
            // LUMON CORPORATE PERSONNEL FILE
          </span>
          {isOwner && (
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => setIsEditing(!isEditing)}
              className="relative z-10 uppercase text-[10px] flex items-center gap-1 font-mono"
            >
              <Edit3 size={11} /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </Button>
          )}
        </div>

        {/* Profile Details Container */}
        <div className="p-5 pt-0 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3 -mt-10">
            {/* Avatar block */}
            <div
              className="w-20 h-20 border-2 border-[var(--color-bg-card)] flex items-center justify-center font-bold text-2xl bg-[var(--color-primary)] text-[var(--color-primary-fg)] shadow-lg"
              style={{ borderRadius: 'var(--radius-card)' }}
            >
              {initial}
            </div>

            <Badge variant="outline" size="sm" className="font-bold uppercase text-[10px] tracking-wider px-2.5 py-1">
              {profile.status}
            </Badge>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
              @{profile.username}
            </h1>
            {profile.headline && (
              <p className="text-xs font-semibold text-[var(--color-text-primary)] mt-0.5">
                {profile.headline}
              </p>
            )}
            {profile.bio && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-xl">
                {profile.bio}
              </p>
            )}
          </div>

          {/* Owner Innie Persona Info Box */}
          {isOwner && isInnie && (
            <div className="p-3 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[11px]" style={{ borderRadius: 'var(--radius-card)' }}>
              <span className="font-bold text-[var(--color-text-primary)]">Innie Persona Active: {currentUser?.innieHandle}</span>
              <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                Your pseudonymous posts use this identifier and are completely disconnected from this public @{profile.username} profile.
              </p>
            </div>
          )}

          {/* Stats Row (Outie Content Only) */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-[var(--color-border)] text-center">
            <div className="p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-card)' }}>
              <span className="text-base font-bold text-[var(--color-text-primary)] block">{profile.postCount ?? posts.length}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Posts</span>
            </div>
            <div className="p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-card)' }}>
              <span className="text-base font-bold text-[var(--color-text-primary)] block">{profile.commentCount ?? 0}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Comments</span>
            </div>
            <div className="p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-card)' }}>
              <span className="text-base font-bold text-[var(--color-text-primary)] block">{profile.floorCount ?? 0}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Floors</span>
            </div>
            <div className="p-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-card)' }}>
              <span className="text-base font-bold text-[var(--color-primary)] block">{profile.score ?? 0}</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <Card className="p-4 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-md">
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <h3 className="uppercase font-bold tracking-wider text-[var(--color-text-primary)]">Update Personnel Details</h3>
            <div>
              <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Headline</label>
              <Input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full text-xs font-mono" />
            </div>
            <div>
              <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="p-2 border bg-[var(--color-bg-subtle)] text-[var(--color-text-primary)] border-[var(--color-border)] text-xs font-mono w-full"
                style={{ borderRadius: 'var(--radius-input)' }}
              >
                <option value="Employed">Employed</option>
                <option value="Severed">Severed</option>
                <option value="Reintegrated">Reintegrated</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase mb-1 text-[var(--color-text-muted)]">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="w-full h-20 text-xs" />
            </div>
            <Button type="submit" variant="default" size="sm" className="uppercase font-semibold">
              Save Profile
            </Button>
          </form>
        </Card>
      )}

      {/* Tabs: Posts | Comments | Floors */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('posts')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'posts'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <FileText size={13} />
          <span>Posts ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comments')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'comments'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <MessageSquare size={13} />
          <span>Comments ({profile.commentCount ?? 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('floors')}
          className={`px-3 py-1.5 font-bold uppercase transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'floors'
              ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
              : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          <Layers size={13} />
          <span>Floors ({userFloors.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
              No public posts shared by @{profile.username}.
            </Card>
          ) : (
            posts.map((p) => <PostCard key={p._id} post={p} />)
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <Card className="p-8 text-center text-[var(--color-text-muted)] bg-[var(--color-bg-card)] border border-[var(--color-border)]">
          {profile.commentCount > 0
            ? `${profile.commentCount} public comments recorded.`
            : `No public comments submitted by @${profile.username}.`}
        </Card>
      )}

      {activeTab === 'floors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {userFloors.map((f) => (
            <Card key={f._id} className="p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] flex items-center justify-between">
              <div>
                <Link to={`/floors/${f.slug}`} className="font-bold text-xs hover:underline text-[var(--color-text-primary)]">
                  #{f.name}
                </Link>
                <span className="text-[10px] text-[var(--color-text-muted)] block">{f.memberCount} members</span>
              </div>
              <Badge variant="outline" size="sm">{f.category || 'Tech'}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}