import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LinkedOutLogo from '../components/LinkedOutLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Registration screen with centered form on --surface and Lumon footer
export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await register({ username, email, password, headline });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-sm p-6 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)]">
        <div className="mb-6 text-center space-y-2">
          <div className="flex justify-center mb-1">
            <LinkedOutLogo className="h-12 w-auto" />
          </div>
          <p className="text-xs text-[var(--muted)]">Create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 text-xs text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Username</label>
            <Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Email</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Password</label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-[var(--muted)] mb-1">Headline (optional)</label>
            <Input
              type="text"
              placeholder="e.g. Frontend developer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            size="md"
            className="w-full mt-2"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs">
          <span className="text-[var(--muted)]">Already have an account? </span>
          <Link to="/login" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>
        </div>
      </div>

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Please enjoy all facts equally.
      </footer>
    </div>
  );
}
