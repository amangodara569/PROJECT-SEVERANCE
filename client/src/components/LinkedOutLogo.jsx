import { useMode } from '../context/ModeContext';

// Dynamic Severance door brand mark (Golden in Outie mode, Green in Innie mode)
export default function LinkedOutLogo({ className = 'h-8 w-auto', alt = 'Linked Out Logo', ...props }) {
  const { isInnie } = useMode();
  const logoSrc = isInnie ? '/door-green.png' : '/door-gold.png';

  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`object-contain transition-opacity duration-200 select-none shrink-0 ${className}`}
      {...props}
    />
  );
}
