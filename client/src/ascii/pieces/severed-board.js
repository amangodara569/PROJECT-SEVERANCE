import { Grid } from '../kit.js';

export const meta = {
  slug: 'severed-board',
  cols: 46,
  rows: 7,
  fps: 24
};

// Split-flap departures board with 46 cols and flipping character animation
export default function create(options = {}) {
  const { cols, rows } = meta;
  const inputRows = Array.isArray(options.rows) ? options.rows.slice(0, 5) : [];

  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // Format single row of exactly 46 characters
  const formatLine = (company = '', date = '', count = '') => {
    let comp = String(company).toUpperCase().trim();
    if (comp.length > 20) {
      comp = comp.slice(0, 18) + '..';
    }
    comp = comp.padEnd(22, ' ');

    let d = String(date).toUpperCase().trim();
    if (d.length > 10) {
      d = d.slice(0, 10);
    }
    d = d.padEnd(12, ' ');

    let c = String(count).toUpperCase().trim();
    if (c.length > 8) {
      c = c.slice(0, 8);
    }
    c = c.padEnd(10, ' ');

    return `${comp}│ ${d}│ ${c}`;
  };

  // Pre-compute the 7 static lines
  const targetLines = [
    'COMPANY               │ DATE       │ SEVERED   ',
    '──────────────────────┼────────────┼───────────'
  ];

  for (let i = 0; i < 5; i++) {
    const item = inputRows[i];
    if (item) {
      const dateStr = item.date ? item.date.slice(0, 10) : '';
      const countStr = item.peopleAffected ? `${item.peopleAffected}` : '-';
      targetLines.push(formatLine(item.company, dateStr, countStr));
    } else {
      targetLines.push(formatLine('· · ·', '· · ·', '· · ·'));
    }
  }

  return (t) => {
    const g = new Grid(cols, rows);

    // Header and divider are always fixed
    g.text(0, 0, targetLines[0]);
    g.text(0, 1, targetLines[1]);

    // Animate item lines 2 to 6
    for (let r = 2; r < rows; r++) {
      const line = targetLines[r];
      for (let c = 0; c < cols; c++) {
        const targetChar = line[c];
        // Divider characters stay static
        if (targetChar === '│') {
          g.set(c, r, '│');
          continue;
        }

        // Each column flips and settles progressively from left to right over 1 second
        const settleTime = 0.1 + (c / cols) * 0.9;
        if (t >= settleTime) {
          g.set(c, r, targetChar);
        } else {
          // Flapping random character before settling
          const seed = Math.floor(t * 24 + c * 7 + r * 13);
          const randChar = CHARS[Math.abs(seed) % CHARS.length];
          g.set(c, r, randChar);
        }
      }
    }

    return g.frame();
  };
}

