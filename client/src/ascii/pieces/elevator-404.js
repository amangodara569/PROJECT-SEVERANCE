import { Grid } from '../kit.js';

export const meta = {
  slug: 'elevator-404',
  cols: 36,
  rows: 10,
  fps: 20
};

// Custom piece: Elevator doors opening on an empty dark shaft, pausing, then closing
export default function create() {
  const { cols, rows } = meta;

  return (t) => {
    const g = new Grid(cols, rows);

    // 4.0 second loop cycle
    const cycle = t % 4.0;
    let openAmount = 0; // 0 = closed, 1 = fully open

    if (cycle < 1.2) {
      // Opening (0 to 1.2s)
      openAmount = cycle / 1.2;
    } else if (cycle < 2.2) {
      // Paused open on dark void (1.2 to 2.2s)
      openAmount = 1;
    } else if (cycle < 3.4) {
      // Closing (2.2 to 3.4s)
      openAmount = 1 - (cycle - 2.2) / 1.2;
    } else {
      // Resting closed (3.4 to 4.0s)
      openAmount = 0;
    }

    // Outer elevator frame
    g.box(0, 0, cols, rows, 'heavy');

    // Indicator display above doors
    const indicator = '[ NON-EXISTENT ]';
    g.text(Math.floor((cols - indicator.length) / 2), 1, indicator);
    g.hline(1, cols - 2, 2, '─');

    // Gap width inside doors
    const maxGap = 20;
    const currentGap = Math.round(openAmount * maxGap);
    const midX = Math.floor(cols / 2);
    const leftDoorEdge = midX - Math.floor(currentGap / 2);
    const rightDoorEdge = midX + Math.ceil(currentGap / 2);

    for (let y = 3; y < rows - 1; y++) {
      // Left door panel
      for (let x = 1; x < leftDoorEdge; x++) {
        g.set(x, y, (x === 1 || x === leftDoorEdge - 1) ? '│' : '░');
      }

      // Dark empty shaft in between open doors
      for (let x = leftDoorEdge; x < rightDoorEdge; x++) {
        const isCable = x === midX - 3 || x === midX + 3;
        if (isCable) {
          g.set(x, y, '┆');
        } else if ((x + y) % 5 === 0) {
          g.set(x, y, '·');
        } else {
          g.set(x, y, ' ');
        }
      }

      // Right door panel
      for (let x = rightDoorEdge; x < cols - 1; x++) {
        g.set(x, y, (x === rightDoorEdge || x === cols - 2) ? '│' : '░');
      }
    }

    return g.frame();
  };
}

