// Community guidelines and protocols in a readable single column format
export default function Handbook() {
  return (
    <div className="max-w-[70ch] mx-auto p-4 space-y-6 text-xs text-[var(--text)]">
      <header className="border-b border-[var(--border)] pb-4 space-y-1">
        <h1 className="text-xl font-semibold text-[var(--text)] font-head">
          Community handbook
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Please enjoy all facts equally.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-[var(--text)] font-head">
          Core principle: free words, not free targets
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          Linked Out is an unvarnished space to speak honestly about workforce reductions, severance packages, and corporate culture.
          Criticism of companies, leadership, compensation, and restructure strategies is welcome and encouraged.
        </p>
      </section>

      <section className="space-y-2 pt-4 border-t border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text)] font-head">
          Allowed conduct
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--text)] leading-relaxed">
          <li>Swearing, frustration, and raw reactions to job loss.</li>
          <li>Dark humor and cynical reflections on corporate rituals.</li>
          <li>Harsh criticism of executive decisions and severance terms.</li>
          <li>Speaking pseudonymously through your Innie identity.</li>
        </ul>
        <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm)] text-xs text-[var(--muted)] mt-2">
          Innie protocol hides your name from other users. It does not hide you from the platform. Never post details that identify you.
        </div>
      </section>

      <section className="space-y-2 pt-4 border-t border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text)] font-head">
          Prohibited conduct
        </h2>
        <ul className="list-disc list-inside space-y-1.5 text-sm text-[var(--text)] leading-relaxed">
          <li>Doxxing: publishing phone numbers or private email addresses.</li>
          <li>Targeted harassment or intimidation of individual employees.</li>
          <li>Threats of physical harm, violence, or stalking.</li>
        </ul>
      </section>

      <section className="space-y-2 pt-4 border-t border-[var(--border)]">
        <h2 className="text-base font-semibold text-[var(--text)] font-head">
          Enforcement and community moderation
        </h2>
        <p className="text-sm leading-relaxed text-[var(--text)]">
          Posts flagged with private phone numbers or emails are redirected to the Break room to be edited. Any post or comment that receives 5 community reports is automatically hidden pending audit.
        </p>
      </section>
    </div>
  );
}
