// JobCard component displaying title, company, location, and external apply action
export default function JobCard({ job }) {
  return (
    <div
      className="p-4 border flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        borderRadius: '2px'
      }}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          {job.title}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: 'var(--muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>{job.company}</span>
          <span>·</span>
          <span>{job.location}</span>
        </div>
      </div>

      <div>
        <a
          href={job.link}
          target="_blank"
          rel="noreferrer"
          className="inline-block px-3 py-1.5 uppercase font-semibold text-[11px] border text-center"
          style={{
            backgroundColor: 'var(--text)',
            color: 'var(--bg)',
            borderColor: 'var(--text)',
            borderRadius: '2px'
          }}
        >
          Apply Now →
        </a>
      </div>
    </div>
  );
}

