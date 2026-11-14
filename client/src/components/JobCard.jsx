import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function JobCard({ job }) {
  return (
    <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs">
      <div className="space-y-1">
        <h3 className="text-sm font-bold tracking-tight text-[var(--text)]">
          {job.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]">
          <Badge variant="outline" className="font-semibold text-[var(--text)]">
            {job.company}
          </Badge>
          <span>·</span>
          <span>{job.location}</span>
        </div>
      </div>

      <div>
        <a
          href={job.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block"
        >
          <Button variant="default" size="sm">
            Apply Now →
          </Button>
        </a>
      </div>
    </Card>
  );
}
