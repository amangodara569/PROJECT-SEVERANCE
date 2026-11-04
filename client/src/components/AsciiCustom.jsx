import { useRef, useEffect, useState } from 'react';
import { useMode } from '../context/ModeContext';

// AsciiCustom: Renders custom procedural ASCII art pieces using requestAnimationFrame and IntersectionObserver
export default function AsciiCustom({
  make,
  options = {},
  size = 12,
  still = false,
  tone = 'text'
}) {
  const containerRef = useRef(null);
  const [frameText, setFrameText] = useState('');
  const { mode } = useMode();

  useEffect(() => {
    if (!make) return;

    // Resolve draw function from factory or module export
    const createFn = typeof make === 'function' ? make : make.default;
    if (typeof createFn !== 'function') return;

    const draw = createFn(options);
    if (typeof draw !== 'function') return;

    // Check if user prefers reduced motion
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // If still mode or reduced motion is active, render only the initial frame
    if (still || prefersReduced) {
      const initial = draw(0);
      setFrameText(typeof initial === 'object' ? initial.text : initial);
      return;
    }

    let isVisible = true;
    let animId = null;
    let startTime = null;

    // Render loop passing elapsed seconds to draw(t)
    const tick = (now) => {
      if (!startTime) startTime = now;
      const elapsedSeconds = (now - startTime) / 1000;

      if (isVisible) {
        const frame = draw(elapsedSeconds);
        setFrameText(typeof frame === 'object' ? frame.text : frame);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Pause animation when off-screen using IntersectionObserver
    let observer = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      });
      observer.observe(containerRef.current);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
      if (observer) observer.disconnect();
    };
  }, [make, JSON.stringify(options), still, mode]);

  const color = tone === 'muted' ? 'var(--muted)' : 'var(--text)';

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        color,
        fontFamily: 'Menlo, Consolas, "DejaVu Sans Mono", "Liberation Mono", monospace',
        fontSize: `${size}px`,
        lineHeight: 1,
        overflow: 'hidden'
      }}
    >
      <pre
        style={{
          margin: 0,
          font: 'inherit',
          letterSpacing: 0,
          whiteSpace: 'pre',
          color: 'inherit'
        }}
      >
        {frameText}
      </pre>
    </div>
  );
}

