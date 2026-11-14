import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Wellness() {
  const resources = [
    { label: 'Mental Health Support Hotline', url: 'https://988lifeline.org/' },
    { label: 'Career Counseling & Transition Network', url: 'https://www.careeronestop.org/' },
    { label: 'Unemployment Benefits & State Aid Guide', url: 'https://www.usa.gov/unemployment-benefits' },
    { label: 'Financial Guidance During Sudden Severance', url: 'https://www.consumerfinance.gov/' }
  ];

  return (
    <div className="space-y-6 max-w-2xl font-mono text-xs">
      <Card className="p-6 space-y-4 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2 border-b border-[var(--color-border)]">
          <AsciiArt piece="candle-flame" size={12} still={false} tone="text" />
          <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] font-mono">
            WELLNESS SESSION
          </h1>
          <p className="italic text-[11px] text-[var(--color-text-muted)]">
            "Please try to enjoy all facts equally."
          </p>
        </div>

        <div className="p-3 text-xs leading-relaxed border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" style={{ borderRadius: 'var(--radius-card)' }}>
          <p className="font-semibold mb-1 text-[var(--color-text-primary)]">
            Your output does not define your humanity.
          </p>
          <p className="text-[var(--color-text-secondary)]">
            Corporate severance can feel disorienting. Take a breath, step away from the terminal, and lean on community resources when needed.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-muted)] font-mono">
            Support & Guidance Resources
          </h2>

          <div className="flex flex-col gap-2 pt-1">
            {resources.map((res, index) => (
              <Button
                key={index}
                asChild
                variant="outline"
                size="sm"
                className="w-full justify-between font-mono text-xs text-[var(--color-text-primary)] hover:opacity-90"
              >
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>{res.label}</span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Visit →</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}