import { Button } from '@/components/ui/button';

// Hairline row for a verified job posting with outline Apply button
export default function JobCard({ job }) {
  return (
    <div className="py-3 px-3 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[var(--hover)] transition-colors text-xs">
      <div className="space-y-0.5">
        <h3 className="text-sm font-semibold text-[var(--text)] font-head">
          {job.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-meta">
          <span className="font-medium text-[var(--text)]">{job.company}</span>
          <span>{job.location || 'Remote'}</span>
        </div>
      </div>

      <div>
        <a
          href={job.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block"
        >
          <Button variant="outline" size="sm">
            Apply
          </Button>
        </a>
      </div>
    </div>
  );
}
