import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AsciiCustom from '../components/AsciiCustom';
import linkedOutLogo from '../ascii/pieces/linked-out-logo';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
      const message = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--color-bg-canvas)] text-[var(--color-text-primary)]"
    >
      <Card
        className="w-full max-w-sm p-6 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-xl"
      >
        <div className="mb-4 text-center">
          <div className="flex justify-center mb-2">
            <AsciiCustom make={linkedOutLogo} size={8} />
          </div>
          <h1 className="text-xl font-bold tracking-widest uppercase text-[var(--color-text-primary)] font-mono">LINKED OUT</h1>
          <p className="text-xs mt-1 text-[var(--color-text-muted)]">
            Create your severed profile
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4 py-2">
            <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono text-[var(--color-text-muted)]">
              Username
            </label>
            <Input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono text-[var(--color-text-muted)]">
              Email
            </label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono text-[var(--color-text-muted)]">
              Password
            </label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono text-[var(--color-text-muted)]">
              Headline (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Frontend Dev, ex-Macrodata"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full text-xs font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            variant="default"
            size="default"
            className="w-full font-mono uppercase tracking-wider font-semibold mt-2"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs">
          <span className="text-[var(--color-text-muted)]">Already have an account? </span>
          <Link to="/login" className="underline font-mono text-[var(--color-primary)] hover:opacity-80">
            Sign In
          </Link>
        </div>
      </Card>

      <footer className="mt-8 text-xs font-mono text-[var(--color-text-muted)]">
        Please enjoy all facts equally.
      </footer>
    </div>
  );
}