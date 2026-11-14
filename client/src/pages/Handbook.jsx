import { Card } from '@/components/ui/card';

export default function Handbook() {
  return (
    <div className="space-y-6 max-w-2xl font-mono text-xs">
      <Card className="p-6 space-y-4 bg-[var(--color-bg-card)] border border-[var(--color-border)]">
        <h1 className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-primary)] font-mono">
          COMMUNITY HANDBOOK
        </h1>
        <p className="italic text-[11px] text-[var(--color-text-muted)]">
          "Please enjoy all facts equally."
        </p>

        <section className="space-y-2 pt-2">
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-primary)] font-mono">
            Core Principle: Free Words, Not Free Targets
          </h2>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Linked Out is an unvarnished space to speak honestly about workforce reductions, corporate culture, and corporate severance.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t border-[var(--color-border)]">
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-primary)] font-mono">
            Allowed Conduct
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-[var(--color-text-secondary)]">
            <li>Swearing and raw frustration about job loss.</li>
            <li>Dark humor and cynical reflections on corporate rituals.</li>
            <li>Harsh criticism of executive decisions and layoff strategies.</li>
            <li>Speaking pseudonymously through your severed Innie persona.</li>
          </ul>
          <div className="p-3 mt-2 font-mono text-[11px] bg-[var(--color-bg-subtle)] border border-[var(--color-border)]" style={{ borderRadius: 'var(--radius-card)' }}>
            <strong className="text-[var(--color-text-primary)]">Innie Protocol:</strong> Innie hides your name from other users. It does not hide you from the platform. Never post details that identify you.
          </div>
        </section>

        <section className="space-y-2 pt-2 border-t border-[var(--color-border)]">
          <h2 className="text-xs uppercase font-bold text-[#E01E5A] font-mono">
            Prohibited Conduct (The Break Room)
          </h2>
          <ul className="list-disc list-inside space-y-1 text-xs text-[var(--color-text-secondary)]">
            <li>Doxxing: publishing phone numbers or private email addresses.</li>
            <li>Targeted abuse or personal harassment against individual persons.</li>
            <li>Threats of physical harm or intimidation.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-2 border-t border-[var(--color-border)]">
          <h2 className="text-xs uppercase font-bold text-[var(--color-text-primary)] font-mono">
            Enforcement & Community Moderation
          </h2>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Posts flagged with personal phone numbers or emails are redirected to the Break Room to be edited. Any post or comment that receives 5 community reports is automatically hidden.
          </p>
        </section>

        <footer className="pt-4 border-t border-[var(--color-border)] text-[11px] font-mono text-center text-[var(--color-text-muted)]">
          <span>ASCII art: </span>
          <a
            href="https://www.ascii-magic.com/ascii"
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-80 text-[var(--color-text-muted)]"
          >
            ascii-magic.com (MIT)
          </a>
        </footer>
      </Card>
    </div>
  );
}