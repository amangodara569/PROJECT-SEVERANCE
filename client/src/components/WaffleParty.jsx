import { Button } from '@/components/ui/button';

// Full-screen celebration reveal for newly reintegrated personnel
export default function WaffleParty({ onContinue }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none transition-opacity duration-500 bg-[var(--bg)] text-[var(--text)]"
    >
      {/* 4x4 Waffle grid drawn with --accent outlines */}
      <div className="mb-6 p-2 border-2 border-[var(--accent)] rounded-[var(--radius)]">
        <div className="grid grid-cols-4 gap-1.5 w-32 h-32">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="border border-[var(--accent)] bg-[var(--accent-soft)] rounded-[var(--radius-sm)]"
            />
          ))}
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-[var(--text)] font-head">
        Waffle party
      </h1>

      <p className="text-sm mb-8 text-[var(--muted)] font-body">
        You were reintegrated.
      </p>

      <Button
        type="button"
        variant="default"
        size="md"
        onClick={onContinue}
        className="px-6"
      >
        Continue
      </Button>
    </div>
  );
}
