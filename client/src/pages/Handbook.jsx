// Handbook page detailing community guidelines and severance principles
export default function Handbook() {
  return (
    <div className="space-y-6 max-w-2xl font-mono text-xs">
      <div className="p-6 border space-y-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}>
        <h1 className="text-sm font-bold uppercase tracking-widest">
          COMMUNITY HANDBOOK
        </h1>
        <p className="italic text-[11px]" style={{ color: 'var(--muted)' }}>
          "Please enjoy all facts equally."
        </p>

        <section className="space-y-2 pt-2">
          <h2 className="text-xs uppercase font-bold" style={{ color: 'var(--text)' }}>
            Core Principle: Free Words, Not Free Targets
          </h2>
          <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Linked Out is an unvarnished space to speak honestly about workforce reductions, corporate culture, and corporate severance.
          </p>
        </section>

        <section className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xs uppercase font-bold" style={{ color: 'var(--text)' }}>
            Allowed Conduct
          </h2>
          <ul className="list-disc list-inside space-y-1 font-sans text-xs" style={{ color: 'var(--muted)' }}>
            <li>Swearing and raw frustration about job loss.</li>
            <li>Dark humor and cynical reflections on corporate rituals.</li>
            <li>Harsh criticism of executive decisions and layoff strategies.</li>
            <li>Speaking pseudonymously through your severed Innie persona.</li>
          </ul>
          <div className="p-3 border mt-2 font-mono text-[11px]" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
            <strong>Innie Protocol:</strong> Innie hides your name from other users. It does not hide you from the platform. Never post details that identify you.
          </div>
        </section>

        <section className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xs uppercase font-bold" style={{ color: 'var(--text)' }}>
            Prohibited Conduct (The Break Room)
          </h2>
          <ul className="list-disc list-inside space-y-1 font-sans text-xs" style={{ color: 'var(--muted)' }}>
            <li>Doxxing: publishing phone numbers or private email addresses.</li>
            <li>Targeted abuse or personal harassment against individual persons.</li>
            <li>Threats of physical harm or intimidation.</li>
          </ul>
        </section>

        <section className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-xs uppercase font-bold" style={{ color: 'var(--text)' }}>
            Enforcement & Community Moderation
          </h2>
          <p className="font-sans text-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
            Posts flagged with personal phone numbers or emails are redirected to the Break Room to be edited. Any post or comment that receives 5 community reports is automatically hidden.
          </p>
        </section>

        <footer className="pt-4 border-t text-[11px] font-mono text-center" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
          <span>ASCII art: </span>
          <a
            href="https://www.ascii-magic.com/ascii"
            target="_blank"
            rel="noreferrer"
            className="underline hover:opacity-80"
            style={{ color: 'var(--muted)' }}
          >
            ascii-magic.com (MIT)
          </a>
        </footer>
      </div>
    </div>
  );
}
