import { useMemo } from 'react';

// Generates 5x5 mirrored pixel grid from handle string
function getGlyphGrid(handle = '') {
  let hash = 0;
  const str = String(handle);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const grid = [];
  for (let r = 0; r < 5; r++) {
    const row = [];
    for (let c = 0; c < 3; c++) {
      const bitIndex = r * 3 + c;
      const isFilled = ((Math.abs(hash) >> bitIndex) & 1) === 1;
      row.push(isFilled);
    }
    grid.push([row[0], row[1], row[2], row[1], row[0]]);
  }
  return grid;
}

// Extract up to 2 uppercase initials from name or username
function getInitials(name, username) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (username) {
    return username.replace(/^@/, '').slice(0, 2).toUpperCase();
  }
  return '??';
}

// Avatar renders round initials for Outies and 5x5 mirrored pixel glyph for Innies
export default function Avatar({ user, name, username, handle, className = '' }) {
  const actualName = name || user?.name;
  const actualUsername = username || user?.username;
  const actualHandle = handle || user?.innieHandle || actualUsername || 'innie';

  const initials = useMemo(() => getInitials(actualName, actualUsername), [actualName, actualUsername]);
  const glyphGrid = useMemo(() => getGlyphGrid(actualHandle), [actualHandle]);

  const photoUrl = user?.avatar;

  return (
    <div
      className={`avatar shrink-0 select-none flex items-center justify-center overflow-hidden ${className}`}
      title={actualName || actualHandle}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={actualName || actualUsername || 'avatar'}
          className="avatar-photo w-full h-full object-cover rounded-full"
        />
      ) : (
        <span className="avatar-initials text-xs font-semibold text-[var(--text)] font-mono">
          {initials}
        </span>
      )}
      <svg
        viewBox="0 0 5 5"
        className="avatar-glyph w-5 h-5"
        aria-hidden="true"
      >
        {glyphGrid.flatMap((row, y) =>
          row.map((filled, x) =>
            filled ? (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width="1"
                height="1"
                fill="var(--accent)"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}
