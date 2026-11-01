import { Link } from 'react-router-dom';

// 404 Not Found page
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="font-mono text-xl font-bold uppercase tracking-widest mb-2">
        404
      </h1>
      <p className="font-mono text-xs mb-6" style={{ color: 'var(--muted)' }}>
        This floor does not exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 font-mono text-xs uppercase tracking-wider border"
        style={{
          backgroundColor: 'var(--text)',
          color: 'var(--bg)',
          borderColor: 'var(--text)',
          borderRadius: '2px'
        }}
      >
        Go home
      </Link>
    </div>
  );
}

