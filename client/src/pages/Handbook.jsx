import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BookOpen, ShieldCheck, AlertOctagon, Scale } from 'lucide-react';

export default function Handbook() {
  const [activeSection, setActiveSection] = useState('principle');

  const sections = [
    { id: 'principle', label: 'Core Principle', icon: BookOpen },
    { id: 'allowed', label: 'Allowed Conduct', icon: ShieldCheck },
    { id: 'prohibited', label: 'Prohibited Conduct', icon: AlertOctagon },
    { id: 'moderation', label: 'Enforcement & Safety', icon: Scale }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-mono text-xs">
      <div className="border-b border-[var(--color-border)] pb-3">
        <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)]">
          // COMMUNITY HANDBOOK & PROTOCOLS
        </h1>
        <p className="italic text-[11px] text-[var(--color-text-muted)]">
          "Please enjoy all facts equally."
        </p>
      </div>

      {/* Two columns layout: Sticky Table of Contents on one side, Content cards on the other */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 items-start">
        {/* Sticky Table of Contents */}
        <div className="sticky top-20 p-3 bg-[var(--color-bg-card)] border border-[var(--color-border)] space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block mb-1">
            // INDEX OF ARTICLES
          </span>
          <nav className="space-y-1">
            {sections.map((sec) => {
              const Icon = sec.icon;
              return (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-sm text-left transition-colors ${
                    activeSection === sec.id
                      ? 'bg-[var(--color-primary)] text-[var(--color-primary-fg)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)]'
                  }`}
                >
                  <Icon size={14} />
                  <span>{sec.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Content Cards */}
        <div className="space-y-4">
          <Card id="principle" className="p-6 space-y-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">ARTICLE 01</span>
            <h2 className="text-sm uppercase font-bold text-[var(--color-text-primary)]">
              Core Principle: Free Words, Not Free Targets
            </h2>
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              Linked Out is an unvarnished space to speak honestly about workforce reductions, corporate culture, and corporate severance.
              Honesty about companies, compensation, leadership decisions, and layoffs is welcome and encouraged.
            </p>
          </Card>

          <Card id="allowed" className="p-6 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">ARTICLE 02</span>
            <h2 className="text-sm uppercase font-bold text-[var(--color-text-primary)]">
              Allowed Conduct
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <li>Swearing, frustration, and raw reactions to job loss.</li>
              <li>Dark humor and cynical reflections on corporate rituals and severance packages.</li>
              <li>Harsh criticism of executive decisions and layoff strategies.</li>
              <li>Speaking pseudonymously through your severed Innie persona.</li>
            </ul>
            <div className="p-3 mt-2 bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[11px]" style={{ borderRadius: 'var(--radius-card)' }}>
              <strong className="text-[var(--color-text-primary)]">Innie Protocol:</strong> Innie hides your name from other users. It does not hide you from the platform. Never post details that identify you.
            </div>
          </Card>

          <Card id="prohibited" className="p-6 space-y-3 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <span className="text-[10px] uppercase font-bold text-[#E01E5A] block">ARTICLE 03</span>
            <h2 className="text-sm uppercase font-bold text-[#E01E5A]">
              Prohibited Conduct (The Break Room)
            </h2>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[var(--color-text-secondary)]">
              <li>Doxxing: publishing phone numbers or private email addresses.</li>
              <li>Targeted personal abuse, harassment, or intimidation against individual workers.</li>
              <li>Threats of physical harm, violence, or stalking.</li>
            </ul>
          </Card>

          <Card id="moderation" className="p-6 space-y-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
            <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] block">ARTICLE 04</span>
            <h2 className="text-sm uppercase font-bold text-[var(--color-text-primary)]">
              Enforcement & Community Moderation
            </h2>
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
              Posts flagged with personal phone numbers or emails are redirected to the Break Room to be edited. Any post or comment that receives 5 community reports is automatically hidden.
            </p>
          </Card>

          <footer className="pt-2 text-[10px] font-mono text-center text-[var(--color-text-muted)]">
            <span>ASCII art provided by ascii-magic.com (MIT).</span>
          </footer>
        </div>
      </div>
    </div>
  );
}