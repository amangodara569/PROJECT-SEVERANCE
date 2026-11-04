import { Grid } from '../kit.js';

export const meta = {
  slug: 'innie-glyph',
  cols: 10,
  rows: 5,
  fps: 1
};

// Symmetrical 5x5 block avatar deterministically derived from Innie handle string
export default function create(options = {}) {
  const { cols, rows } = meta;
  const handle = String(options.handle || 'Innie-0000');

  // Compute 32-bit FNV-1a hash of handle
  let hash = 0x811c9dc5;
  for (let i = 0; i < handle.length; i++) {
    hash ^= handle.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  // Pre-compute 5x5 grid (each cell is 2 chars wide)
  // Horizontal symmetry: col 0 == col 4, col 1 == col 3, col 2 is center
  const gridCells = [];
  let filledCount = 0;

  for (let y = 0; y < 5; y++) {
    const row = [];
    for (let x = 0; x < 3; x++) {
      const bitIndex = (y * 3 + x) % 31;
      const isFilled = ((hash >>> bitIndex) & 1) === 1;
      row.push(isFilled);
      if (isFilled) filledCount++;
    }
    gridCells.push(row);
  }

  // Ensure glyph is never completely blank
  if (filledCount === 0) {
    gridCells[2][2] = true;
  }

  return () => {
    const g = new Grid(cols, rows);

    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 3; x++) {
        const isFilled = gridCells[y][x];
        const token = isFilled ? '██' : '  ';

        // Draw left side and mirrored right side
        g.text(x * 2, y, token);
        g.text((4 - x) * 2, y, token);
      }
    }

    return g.frame();
  };
}

