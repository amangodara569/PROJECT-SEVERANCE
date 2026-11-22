import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { useMode } from '../context/ModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';

// Dedicated, clean profile management page eliminating empty spaces
export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isInnie } = useMode();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('Employed');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
      setHeadline(user.headline || '');
      setBio(user.bio || '');
      setStatus(user.status || 'Employed');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const payload = isInnie
        ? { headline, bio, status }
        : { name, username: username.trim(), avatar: avatar.trim(), headline: headline.trim(), bio: bio.trim(), status };

      const res = await api.put('/users/profile', payload);
      const updated = res.data.user;
      if (updateUser) updateUser(updated);

      setSuccessMsg('Profile records successfully updated.');
      setTimeout(() => setSuccessMsg(''), 4000);

      if (!isInnie && updated.username && updated.username !== user?.username) {
        navigate('/profile/edit', { replace: true });
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile records.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center text-xs">
        <p className="text-[var(--muted)] mb-4">Please sign in to view and edit your personnel records.</p>
        <Button asChild variant="default" size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4 text-xs">
      {/* Top breadcrumb & navigation */}
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to feed</span>
        </Link>
        <Link
          to={`/u/${user.username}`}
          className="inline-flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <span>View public profile</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Main Edit Profile Card */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] p-6 space-y-6 shadow-sm">
        {/* Header with avatar preview */}
        <div className="flex items-center gap-4 pb-4 border-b border-[var(--border)]">
          <Avatar user={{ ...user, avatar }} handle={user.innieHandle} className="w-16 h-16 text-lg shrink-0" />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold text-[var(--text)] font-head">
              {isInnie ? user.innieHandle : `@${user.username}`}
            </h1>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {isInnie
                ? 'Innie identity is encrypted and managed under Lumon severance protocol.'
                : 'Manage your Outie public personnel profile and status.'}
            </p>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-700/50 text-emerald-400 rounded-[var(--radius-sm)] flex items-center gap-2">
            <Check size={14} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-700/50 text-red-400 rounded-[var(--radius-sm)]">
            {errorMsg}
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isInnie ? (
            <>
              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
                  Display Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aman Sharma"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
                  Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
                  Photo / Avatar URL
                </label>
                <Input
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://... image link"
                  className="w-full"
                />
              </div>
            </>
          ) : (
            <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-[var(--radius-sm)] text-[11px] text-[var(--muted)]">
              Your Innie identity handle is permanently assigned by Severance and cannot be altered.
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
              Headline
            </label>
            <Input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Lead System Architect @ TechNova"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
              Employment Status
            </label>
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
            <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
              Bio
            </label>
            <Textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief professional background or corporate severance reflections..."
              className="w-full resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigate(`/u/${user.username}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="default"
              size="sm"
              className="cursor-pointer"
            >
              {saving ? 'Saving changes...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
