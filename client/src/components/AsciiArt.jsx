import { useRef, useEffect } from 'react';
import { useMode } from '../context/ModeContext';

// Wrapper around the self-hosted <ascii-art> web component
// Always sets mono attribute. CSS variables drive color inversion on Sever toggle.
export default function AsciiArt({
  piece,
  size = 12,
  still = false,
  look = null,
  tone = 'text'
}) {
  const ref = useRef(null);
  const { mode } = useMode();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setAttribute('piece', piece);
    el.setAttribute('size', String(size));
    el.setAttribute('mono', '');

    if (still) {
      el.setAttribute('still', '');
    } else {
      el.removeAttribute('still');
    }

    if (look) {
      el.setAttribute('look', look);
    } else {
      el.removeAttribute('look');
    }

    // Force restart if element is already connected
    if (typeof el.start === 'function') {
      el.start();
    }
  }, [piece, size, still, look, mode]);

  const color = tone === 'muted' ? 'var(--muted)' : 'var(--text)';

  return (
    <div
      aria-hidden="true"
      style={{
        color,
        '--ascii-ink': color,
        lineHeight: 1,
        overflow: 'hidden',
        display: 'inline-block'
      }}
    >
      <ascii-art
        ref={ref}
        key={`${piece}-${mode}`}
        piece={piece}
        size={size}
        mono=""
      />
    </div>
  );
}
