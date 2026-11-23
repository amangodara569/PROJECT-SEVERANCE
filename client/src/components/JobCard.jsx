import { Button } from '@/components/ui/button';
import { useMode } from '../context/ModeContext';

// Hairline row for a verified job posting with outline Apply button
export default function JobCard({ job }) {
  const { mode } = useMode();

  return (
    <div className={`py-4 px-1 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors text-xs ${
      mode === 'outie'
        ? 'border-[#1E2D28] bg-transparent hover:bg-transparent'
        : 'border-[var(--border)] hover:bg-[var(--hover)] px-3 py-3'
    }`}>
      <div className="space-y-0.5">
        <h3 className={`text-sm font-semibold font-head ${mode === 'outie' ? 'text-[#2A835F]' : 'text-[var(--text)]'}`}>
          {job.title}
        </h3>
        <div className={`flex items-center gap-2 text-xs font-meta ${mode === 'outie' ? 'text-[#7A8080]' : 'text-[var(--muted)]'}`}>
          <span className={`font-medium ${mode === 'outie' ? 'text-[#E5E5E5]' : 'text-[var(--text)]'}`}>{job.company}</span>
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
          <Button
            variant="outline"
            size="sm"
            className={mode === 'outie' ? 'border-[#1E2D28] text-[#B0E4CC] hover:bg-[#121414]' : ''}
          >
            Apply
          </Button>
        </a>
      </div>
    </div>
  );
}
