import { Link } from 'react-router-dom';
import AsciiCustom from '../components/AsciiCustom';
import elevator404 from '../ascii/pieces/elevator-404';
import { Button } from '@/components/ui/button';

// 404 error page: single sentence and return action
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto my-12 text-xs">
      <div className="flex justify-center mb-2">
        <AsciiCustom make={elevator404} size={11} />
      </div>
      <p className="text-sm text-[var(--muted)]">
        This floor does not exist.
      </p>
      <Button asChild variant="default" size="sm">
        <Link to="/">
          Go home
        </Link>
      </Button>
    </div>
  );
}
