// Wellness Session page offering resources, empathy, and assistance links
export default function Wellness() {
  const resources = [
    { label: 'Mental Health Support Hotline', url: 'https://988lifeline.org/' },
    { label: 'Career Counseling & Transition Network', url: 'https://www.careeronestop.org/' },
    { label: 'Unemployment Benefits & State Aid Guide', url: 'https://www.usa.gov/unemployment-benefits' },
    { label: 'Financial Guidance During Sudden Severance', url: 'https://www.consumerfinance.gov/' }
  ];

  return (
    <div className="space-y-6 max-w-2xl font-mono text-xs">
      <div className="p-6 border space-y-4" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '2px' }}>
        <h1 className="text-sm font-bold uppercase tracking-widest">
          WELLNESS SESSION
        </h1>

        <div className="p-3 border font-sans text-xs leading-relaxed" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>
            Your output does not define your humanity.
          </p>
          <p style={{ color: 'var(--muted)' }}>
            Corporate severance can feel disorienting. Take a breath, step away from the terminal, and lean on community resources when needed.
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <h2 className="text-xs uppercase font-bold" style={{ color: 'var(--muted)' }}>
            Support & Guidance Resources
          </h2>

          <div className="flex flex-col gap-2 pt-1">
            {resources.map((res, index) => (
              <a
                key={index}
                href={res.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 border flex items-center justify-between hover:opacity-80 transition-colors"
                style={{ borderColor: 'var(--border)', color: 'var(--text)', backgroundColor: 'var(--bg)' }}
              >
                <span>{res.label}</span>
                <span className="text-[10px] text-muted-foreground">Visit →</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
