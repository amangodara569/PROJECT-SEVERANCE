import React from 'react';

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...props
}) {
  // Size classes
  let sizeClasses = 'px-4 py-2 text-sm';
  if (size === 'xs') sizeClasses = 'px-2 py-1 text-xs';
  if (size === 'sm') sizeClasses = 'px-3 py-1.5 text-xs';
  if (size === 'lg') sizeClasses = 'px-6 py-3 text-base';
  if (size === 'icon') sizeClasses = 'p-2 aspect-square flex items-center justify-center';

  // Variant classes driven by CSS custom properties and mode
  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses = 'bg-[var(--secondary)] text-[var(--secondary-fg)] hover:bg-[var(--secondary-hover)] border border-[var(--border)]';
      break;
    case 'outline':
      variantClasses = 'bg-transparent text-[var(--text)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--secondary)]';
      break;
    case 'destructive':
      variantClasses = 'bg-[var(--destructive)] text-[var(--destructive-fg)] hover:opacity-90';
      break;
    case 'default':
    default:
      variantClasses = 'bg-[var(--primary)] text-[var(--primary-fg)] hover:bg-[var(--primary-hover)] font-bold';
      break;
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ borderRadius: 'var(--radius-btn)' }}
      className={`inline-flex items-center justify-center gap-2 font-medium cursor-pointer transition-all duration-150 disabled:pointer-events-none select-none ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
