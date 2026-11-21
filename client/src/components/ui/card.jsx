import React from 'react';

// Card container using Theme v2 surface and hairline border
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] rounded-[var(--radius)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-4 border-b border-[var(--border)] ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-base font-semibold text-[var(--text)] ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-[var(--muted)] mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-4 border-t border-[var(--border)] flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
