// EdgeTexture: Severance "Macrodata" static numbers grid in outer margins for widths >= 1680px
export default function EdgeTexture() {
  // SVG encoded numbers grid tile
  const svgTile = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><text x='10' y='25' font-family='monospace' font-size='11' fill='black'>0 4 7 2 9</text><text x='10' y='55' font-family='monospace' font-size='11' fill='black'>3 8 1 5 0</text><text x='10' y='85' font-family='monospace' font-size='11' fill='black'>9 2 4 8 1</text><text x='10' y='115' font-family='monospace' font-size='11' fill='black'>5 0 3 7 4</text><text x='10' y='145' font-family='monospace' font-size='11' fill='black'>1 6 8 2 9</text></svg>")`;

  return (
    <>
      {/* Left outer margin numbers texture */}
      <div
        aria-hidden="true"
        className="hidden min-[1680px]:block fixed top-14 left-0 bottom-0 pointer-events-none select-none z-0"
        style={{
          width: 'calc((100vw - 1560px) / 2)',
          backgroundColor: 'var(--text)',
          opacity: 0.05,
          maskImage: svgTile,
          WebkitMaskImage: svgTile,
          maskRepeat: 'repeat',
          WebkitMaskRepeat: 'repeat'
        }}
      />

      {/* Right outer margin numbers texture */}
      <div
        aria-hidden="true"
        className="hidden min-[1680px]:block fixed top-14 right-0 bottom-0 pointer-events-none select-none z-0"
        style={{
          width: 'calc((100vw - 1560px) / 2)',
          backgroundColor: 'var(--text)',
          opacity: 0.05,
          maskImage: svgTile,
          WebkitMaskImage: svgTile,
          maskRepeat: 'repeat',
          WebkitMaskRepeat: 'repeat'
        }}
      />
    </>
  );
}