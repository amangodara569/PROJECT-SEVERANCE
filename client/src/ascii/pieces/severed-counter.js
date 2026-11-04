import { Grid } from '../kit.js';

export const meta = {
  slug: 'severed-counter',
  cols: 40,
  rows: 5,
  fps: 24
};

// Custom piece: Odometer counter that rolls up from 0 to value in 1.2s then rests
export default function create(options = {}) {
  const { cols, rows } = meta;
  const targetValue = Math.max(0, Number(options.value) || 0);

  return (t) => {
    const g = new Grid(cols, rows);

    // Ease-out progress from 0 to 1 over 1.2 seconds
    const progress = Math.min(1, Math.max(0, t / 1.2));
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = t >= 1.2 ? targetValue : Math.round(targetValue * eased);

    const formatted = currentValue.toLocaleString('en-US');
    const displayStr = `[ ${formatted} ]`;

    // Outer double box
    g.box(0, 0, cols, rows, 'double');

    // Centered label
    const label = 'SEVERED THIS MONTH';
    g.text(Math.floor((cols - label.length) / 2), 1, label);

    // Centered odometer value
    g.text(Math.floor((cols - displayStr.length) / 2), 2, displayStr);

    // Footer indicator
    const footer = progress >= 1 ? '● VERIFIED' : '○ COUNTING...';
    g.text(Math.floor((cols - footer.length) / 2), 3, footer);

    return g.frame();
  };
}

