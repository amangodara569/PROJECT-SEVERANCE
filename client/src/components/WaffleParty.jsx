import AsciiArt from './AsciiArt';
import { Button } from '@/components/ui/button';

export default function WaffleParty({ onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none transition-opacity duration-500 bg-background text-foreground animate-fadeIn"
    >
      {/* ASCII waffle iron open celebration */}
      <div className="mb-6 flex justify-center">
        <AsciiArt piece="waffle-iron-open" size={14} still={false} tone="text" />
      </div>

      <h1 className="font-mono text-2xl md:text-3xl font-bold tracking-[0.25em] uppercase mb-2 text-foreground">
        WAFFLE PARTY
      </h1>

      <p className="font-mono text-sm uppercase tracking-widest mb-10 text-muted-foreground">
        You were reintegrated.
      </p>

      <Button
        type="button"
        variant="default"
        size="lg"
        onClick={onContinue}
        className="px-6 py-2.5 font-mono text-xs uppercase tracking-widest font-bold"
      >
        Continue
      </Button>
    </div>
  );
}
