import { Grid } from '../kit.js';

export const meta = {
  slug: 'linked-out-logo',
  cols: 48,
  rows: 7,
  fps: 24
};

// Custom piece: LINKED and OUT joined by a chain that severs and drifts apart
export default function create() {
  const { cols, rows } = meta;

  const linked = [
    '█   █ █   █ █ █▀▀ █▀▄',
    '█   █ █▀█ █ █ █▀  █ █',
    '▀▀▀ ▀ ▀ ▀ ▀ ▀ ▀▀▀ ▀▀ '
  ];

  const out = [
    '█▀█ █ █ ▀█▀',
    '█ █ █ █  █ ',
    '▀▀▀ ▀▀▀  ▀ '
  ];

  return (t) => {
    const g = new Grid(cols, rows);
    const progress = Math.min(1, Math.max(0, (t - 0.2) / 0.8));

    // Calculate drift: left shifts left 1 char, right shifts right 1 char (2 chars total drift)
    const drift = Math.floor(progress * 1.5);
    const leftX = 4 - drift;
    const rightX = 33 + drift;
    const startY = 2;

    // Draw LINKED
    for (let r = 0; r < linked.length; r++) {
      g.text(leftX, startY + r, linked[r]);
    }

    // Draw OUT
    for (let r = 0; r < out.length; r++) {
      g.text(rightX, startY + r, out[r]);
    }

    // Draw severed link animation in the center
    const midY = startY + 1;
    if (progress < 0.2) {
      // Intact chain link
      g.text(25, midY, '=[#]=');
    } else if (progress < 0.6) {
      // Breaking sparks
      g.text(24, midY - 1, ' · ');
      g.text(24, midY, ' -x- ');
      g.text(24, midY + 1, ' · ');
    } else {
      // Broken severed ends
      g.text(24, midY, '-   -');
      if (progress < 0.9) {
        g.text(26, midY - 1, '·');
        g.text(25, midY + 1, '·');
      }
    }

    return g.frame();
  };
}

