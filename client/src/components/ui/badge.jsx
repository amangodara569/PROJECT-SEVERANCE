import React from 'react';

// Badge pill / chip using Theme v2 radius and variables
export function Badge({ children, variant = 'default', size = 'md', className = '', ...props }) {
  let variantStyle = 'bg-[var(--accent-soft)] text-[var(--text)] border border-[var(--border)]';

  if (variant === 'primary' || variant === 'accent') {
    variantStyle = 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30';
  } else if (variant === 'outline') {
    variantStyle = 'bg-transparent text-[var(--muted)] border border-[var(--border)]';
  } else if (variant === 'destructive') {
    variantStyle = 'bg-transparent text-[var(--muted)] border border-[var(--border)]';
  }

  const sizeClass = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-[var(--radius-sm)] ${sizeClass} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
