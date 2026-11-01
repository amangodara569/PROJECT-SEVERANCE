import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Register page with centered card, Severance homage footer, and error display
export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [headline, setHeadline] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Handle user registration submission
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
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* Centered card */}
      <div
        className="w-full max-w-sm p-4 border"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
          borderRadius: '2px'
        }}
      >
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold tracking-widest uppercase">LINKED OUT</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            Create your severed profile
          </p>
        </div>

        {/* Error box with 1px border */}
        {error && (
          <div
            className="mb-4 p-2 text-xs border"
            style={{ borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono" style={{ color: 'var(--muted)' }}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 text-sm border outline-none bg-transparent"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                borderRadius: '2px'
              }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono" style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 text-sm border outline-none bg-transparent"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                borderRadius: '2px'
              }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono" style={{ color: 'var(--muted)' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 text-sm border outline-none bg-transparent"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                borderRadius: '2px'
              }}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider mb-1 font-mono" style={{ color: 'var(--muted)' }}>
              Headline (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Frontend Dev, ex-Macrodata"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full p-2 text-sm border outline-none bg-transparent"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)',
                borderRadius: '2px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-4 text-xs font-mono uppercase tracking-wider font-semibold mt-2"
            style={{
              backgroundColor: 'var(--text)',
              color: 'var(--bg)',
              border: '1px solid var(--text)'
            }}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center text-xs">
          <span style={{ color: 'var(--muted)' }}>Already have an account? </span>
          <Link to="/login" className="underline font-mono" style={{ color: 'var(--text)' }}>
            Sign In
          </Link>
        </div>
      </div>

      {/* Severance footer line */}
      <footer className="mt-8 text-xs font-mono" style={{ color: 'var(--muted)' }}>
        Please enjoy all facts equally.
      </footer>
    </div>
  );
}

