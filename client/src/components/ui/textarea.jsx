import React from 'react';

// Multi-line text area on --surface with hairline border and Theme v2 radius
export function Textarea({ className = '', rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      className={`w-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius-sm)] px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] focus-visible:outline-offset-2 disabled:opacity-45 resize-y ${className}`}
      {...props}
    />
  );
}

export default Textarea;
