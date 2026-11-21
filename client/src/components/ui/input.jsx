import React from 'react';

// Single-line text input on --surface with hairline border and Theme v2 radius
export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={`w-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius-sm)] px-3 py-1.5 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-45 ${className}`}
      {...props}
    />
  );
}

export default Input;
