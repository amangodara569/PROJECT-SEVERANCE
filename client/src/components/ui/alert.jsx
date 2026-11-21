import React from 'react';

// Alert message box using Theme v2 surface and border
export function Alert({ children, variant = 'default', className = '', ...props }) {
  return (
    <div
      role="alert"
      className={`border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] p-3 text-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children, className = '', ...props }) {
  return (
    <div className={`text-xs text-[var(--muted)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Alert;
