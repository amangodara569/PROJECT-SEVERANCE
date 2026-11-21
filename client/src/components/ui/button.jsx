import React from 'react';

// Single button component styled with Theme v2 variables
export function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  asChild = false,
  ...props
}) {
  let sizeClasses = 'px-3.5 py-1.5 text-sm';
  if (size === 'xs') sizeClasses = 'px-2 py-0.5 text-xs';
  if (size === 'sm') sizeClasses = 'px-3 py-1 text-xs';
  if (size === 'lg') sizeClasses = 'px-5 py-2.5 text-base';
  if (size === 'icon') sizeClasses = 'p-1.5 aspect-square flex items-center justify-center';

  // Theme v2: ONE filled accent button per screen. Others are outline or muted text.
  let variantClasses = '';
  switch (variant) {
    case 'secondary':
      variantClasses = 'bg-[var(--accent-soft)] text-[var(--text)] hover:bg-[var(--hover)] border border-[var(--border)]';
      break;
    case 'outline':
      variantClasses = 'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--hover)]';
      break;
    case 'ghost':
      variantClasses = 'bg-transparent text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)]';
      break;
    case 'destructive':
      variantClasses = 'bg-transparent text-[var(--muted)] hover:text-[var(--text)]';
      break;
    case 'default':
    default:
      variantClasses = 'bg-[var(--accent)] text-[var(--accent-ink)] hover:opacity-90 font-medium';
      break;
  }

  const combinedClasses = `inline-flex items-center justify-center gap-1.5 font-medium cursor-pointer transition-colors disabled:opacity-45 disabled:cursor-not-allowed select-none rounded-[var(--radius-sm)] ${variantClasses} ${sizeClasses} ${className}`;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: `${combinedClasses} ${children.props.className || ''}`,
      ...props
    });
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClasses}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
