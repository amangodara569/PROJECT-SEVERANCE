import { Link } from 'react-router-dom';
import AsciiCustom from '../components/AsciiCustom';
import elevator404 from '../ascii/pieces/elevator-404';

// 404 Not Found page
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
      <div className="flex justify-center mb-2">
        <AsciiCustom make={elevator404} size={11} />
      </div>
      <h1 className="font-mono text-xl font-bold uppercase tracking-widest mb-1">
        404
      </h1>
      <p className="font-mono text-xs mb-4" style={{ color: 'var(--muted)' }}>
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
        Return to Operational Floor
      </Link>
    </div>
  );
}

