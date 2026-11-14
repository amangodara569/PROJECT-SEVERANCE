import { useState } from 'react';
import AsciiArt from '../components/AsciiArt';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, PhoneCall, Compass, ShieldAlert } from 'lucide-react';

export default function Wellness() {
  const [activeTab, setActiveTab] = useState('affirmation');

  const navItems = [
    { id: 'affirmation', label: 'Wellness Affirmation', icon: Heart },
    { id: 'helplines', label: 'Crisis & Hotlines', icon: PhoneCall },
    { id: 'transition', label: 'Career Transition', icon: Compass },
    { id: 'financial', label: 'Financial Guidance', icon: ShieldAlert }
  ];

  const resources = [
    { label: 'Mental Health Support Hotline (988 Lifeline)', desc: '24/7, free and confidential support for people in distress.', url: 'https://988lifeline.org/' },
    { label: 'CareerOneStop & Transition Network', desc: 'Sponsored by the U.S. Dept of Labor. Career exploration and job search.', url: 'https://www.careeronestop.org/' },
    { label: 'Unemployment Benefits & State Aid Guide', desc: 'Step-by-step federal and state unemployment filing portals.', url: 'https://www.usa.gov/unemployment-benefits' },
    { label: 'Consumer Financial Protection Bureau (CFPB)', desc: 'Unbiased tools for navigating sudden job loss and managing debt.', url: 'https://www.consumerfinance.gov/' }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
      <div className="border-b border-[var(--color-border)] pb-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
          // WELLNESS SESSION // HUMANITY BEYOND OUTPUT
        </h1>
        <p className="italic text-[11px] text-[var(--color-text-muted)]">
          "Please try to enjoy all facts equally."
        </p>
      </div>

      {/* Two columns layout: Sticky TOC on left, content cards on right */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Sticky Table of Contents */}
        <div className="sticky top-20 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block mb-1">
            // WELLNESS INDEX
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-sm text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Content Cards */}
        <div className="space-y-4">
          <Card id="affirmation" className="p-6 space-y-4 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <div className="flex flex-col items-center justify-center text-center space-y-2 pb-2 border-b border-[var(--color-border)]">
              <AsciiArt piece="candle-flame" size={12} still={false} tone="text" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
                Lumon Wellness Chamber
              </h2>
              <p className="italic text-[11px] text-[var(--color-text-muted)]">
                "Your Outie is fond of music. Your Outie is skilled at swimming."
              </p>
            </div>

            <div className="p-4 text-xs leading-relaxed border border-[var(--color-border)] bg-[var(--color-bg-subtle)]" style={{ borderRadius: 'var(--radius-card)' }}>
              <p className="font-bold mb-1 text-[var(--color-text-primary)] text-sm">
                Your output does not define your humanity.
              </p>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Corporate severance can feel disorienting and dehumanizing. Remember that a spreadsheet row reduction has nothing to do with your talent, creativity, or worth as a person.
                Take a breath, step away from the terminal, and lean on community resources.
              </p>
            </div>
          </Card>

          <Card id="helplines" className="p-6 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">EXTERNAL AID</span>
            <h3 className="text-xs uppercase font-bold text-[var(--color-text-primary)]">
              Crisis & Health Resources
            </h3>
            <div className="space-y-2">
              {resources.map((res, index) => (
                <div key={index} className="p-3 border border-[var(--color-border)] bg-[var(--color-bg-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2" style={{ borderRadius: 'var(--radius-card)' }}>
                  <div>
                    <span className="font-bold text-xs text-[var(--color-text-primary)] block">{res.label}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)]">{res.desc}</span>
                  </div>
                  <Button asChild variant="outline" size="xs" className="shrink-0 uppercase text-[10px]">
                    <a href={res.url} target="_blank" rel="noreferrer">
                      Connect →
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}