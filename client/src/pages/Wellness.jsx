import AsciiArt from '../components/AsciiArt';
import { Button } from '@/components/ui/button';

// Wellness chamber resources rendered in a focused single column
export default function Wellness() {
  const resources = [
    {
      label: 'Mental Health Support Hotline (988 Lifeline)',
      desc: 'Free, confidential support available 24/7 for people in distress.',
      url: 'https://988lifeline.org/'
    },
    {
      label: 'CareerOneStop Transition Network',
      desc: 'Sponsored by the U.S. Department of Labor. Career exploration and search tools.',
      url: 'https://www.careeronestop.org/'
    },
    {
      label: 'Unemployment Benefits and State Aid Guide',
      desc: 'Step-by-step federal and state unemployment filing portals.',
      url: 'https://www.usa.gov/unemployment-benefits'
    },
    {
      label: 'Consumer Financial Protection Bureau',
      desc: 'Unbiased tools for navigating sudden job loss and managing expenses.',
      url: 'https://www.consumerfinance.gov/'
    }
  ];

  return (
    <div className="max-w-[70ch] mx-auto p-4 space-y-6 text-xs text-[var(--text)]">
      <header className="border-b border-[var(--border)] pb-4 space-y-1">
        <h1 className="text-xl font-semibold text-[var(--text)] font-head">
          Wellness session
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Please try to enjoy all facts equally.
        </p>
      </header>

      {/* Lumon wellness chamber */}
      <section className="space-y-4 pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
          <AsciiArt piece="candle-flame" size={12} still={false} tone="muted" />
          <h2 className="text-base font-semibold text-[var(--text)] font-head">
            Lumon wellness chamber
          </h2>
          <p className="text-xs text-[var(--muted)] italic">
            "Your Outie is fond of music. Your Outie is skilled at swimming."
          </p>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] text-sm leading-relaxed text-[var(--text)]">
          <p className="font-medium mb-1">Your output does not define your humanity.</p>
          <p className="text-xs text-[var(--muted)]">
            A headcount reduction has nothing to do with your creativity or worth. Take a breath, step away from the terminal, and lean on community resources.
          </p>
        </div>
      </section>

      {/* External Aid Links as plain outline link buttons */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--text)] font-head">
          Crisis and health resources
        </h2>
        <div className="space-y-3">
          {resources.map((res, idx) => (
            <div
              key={idx}
              className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-0.5">
                <span className="font-medium text-xs text-[var(--text)] block">{res.label}</span>
                <span className="text-[11px] text-[var(--muted)] block">{res.desc}</span>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <a href={res.url} target="_blank" rel="noreferrer">
                  Connect
                </a>
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
