import { Link } from 'react-router-dom';
import AsciiCustom from '../components/AsciiCustom';
import elevator404 from '../ascii/pieces/elevator-404';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Card className="flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-[var(--color-bg-card)] border border-[var(--color-border)] shadow-lg">
      <div className="flex justify-center mb-2">
        <AsciiCustom make={elevator404} size={11} />
      </div>
      <h1 className="font-mono text-xl font-bold uppercase tracking-widest mb-1 text-[var(--color-text-primary)]">
        404
      </h1>
      <p className="font-mono text-xs mb-4 text-[var(--color-text-muted)]">
        This floor does not exist.
      </p>
      <Button asChild variant="default" size="default" className="font-mono text-xs uppercase tracking-wider">
        <Link to="/">
          Return to Operational Floor
        </Link>
      </Button>
    </Card>
  );
}