import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LinkedOutLogo from '../components/LinkedOutLogo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Login screen with centered form on --surface and Lumon footer
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign in. Please try again.');
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
          <p className="text-xs text-[var(--muted)]">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 text-xs text-[var(--text)] border border-[var(--border)] rounded-[var(--radius-sm)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            size="md"
            className="w-full"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs">
          <span className="text-[var(--muted)]">Need an account? </span>
          <Link to="/register" className="text-[var(--accent)] hover:underline">
            Register
          </Link>
        </div>
      </div>

      <footer className="mt-8 text-xs text-[var(--muted)]">
        Please enjoy all facts equally.
      </footer>
    </div>
  );
}
