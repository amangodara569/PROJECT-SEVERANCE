import React from 'react';

export function Input({ className = '', type = 'text', ...props }) {
  return (
    <input
      type={type}
      style={{
        borderRadius: 'var(--radius-input)',
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--text)'
      }}
      className={`w-full border px-3 py-2 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--border-focus)] disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export default Input;
