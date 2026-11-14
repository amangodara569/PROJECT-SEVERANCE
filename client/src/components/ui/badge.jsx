import React from 'react';

export function Badge({ children, variant = 'default', className = '', ...props }) {
  let variantStyle = 'bg-[var(--secondary)] text-[var(--text)] border border-[var(--border)]';

  if (variant === 'gold' || variant === 'primary') {
    variantStyle = 'bg-[var(--primary)] text-[var(--primary-fg)] font-bold';
  } else if (variant === 'cyan' || variant === 'accent') {
    variantStyle = 'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30';
  } else if (variant === 'outline') {
    variantStyle = 'bg-transparent text-[var(--muted)] border border-[var(--border)]';
  } else if (variant === 'destructive') {
    variantStyle = 'bg-[var(--destructive)]/15 text-[var(--destructive)] border border-[var(--destructive)]/30';
  }

  return (
    <span
      style={{ borderRadius: 'var(--radius-badge)' }}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
