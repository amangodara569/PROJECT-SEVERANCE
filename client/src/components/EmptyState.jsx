// Reusable EmptyState component matching corporate terminal aesthetics
export default function EmptyState({ message = 'Nothing here yet. The work is mysterious and important.' }) {
  return (
    <div
      className="p-8 text-center border font-mono text-xs"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
        color: 'var(--muted)',
        borderRadius: '2px'
      }}
    >
      {message}
    </div>
  );
}

