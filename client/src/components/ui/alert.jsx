import React from 'react';

export function Alert({ children, variant = 'default', className = '', ...props }) {
  let variantStyles = 'bg-[var(--surface-elevated)] border-[var(--border)] text-[var(--text)]';
  if (variant === 'destructive') {
    variantStyles = 'bg-[var(--destructive)]/10 border-[var(--destructive)]/40 text-[var(--destructive)]';
  } else if (variant === 'gold' || variant === 'warning') {
    variantStyles = 'bg-[var(--accent-gold)]/10 border-[var(--accent-gold)]/40 text-[var(--text)]';
  }

  return (
    <div
      role="alert"
      style={{ borderRadius: 'var(--radius-card)' }}
      className={`border p-4 text-sm ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '', ...props }) {
  return (
    <div className={`text-sm ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Alert;
