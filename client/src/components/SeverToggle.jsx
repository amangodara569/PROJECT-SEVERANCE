import { useMode } from '../context/ModeContext';

export default function SeverToggle() {
  const { isInnie, toggleMode } = useMode();

  return (
    <div className="flex items-center gap-2 select-none">
      <button
        type="button"
        onClick={toggleMode}
        className={`flex items-center p-1 text-xs font-mono transition-all cursor-pointer border ${
          isInnie
            ? 'bg-[#ffffff] text-[#4a154b] border-[#e6e6e6] rounded-full shadow-sm'
            : 'bg-[#181818] text-[#ffffff] border-[#2c2c2c] rounded-none'
        }`}
        title="Toggle Outie (Lamborghini) / Innie (Slack)"
      >
        <span
          className={`px-3 py-1 font-bold text-xs uppercase tracking-wider transition-all ${
            !isInnie
              ? 'bg-[#FFC000] text-[#000000] font-black'
              : 'text-[#696969] hover:text-[#1d1d1d]'
          } ${isInnie ? 'rounded-full' : 'rounded-none'}`}
        >
          ⚡ OUTIE
        </span>
        <span
          className={`px-3 py-1 font-bold text-xs uppercase tracking-wider transition-all ${
            isInnie
              ? 'bg-[#4a154b] text-[#ffffff] font-bold shadow-xs'
              : 'text-[#7D7D7D] hover:text-[#FFFFFF]'
          } ${isInnie ? 'rounded-full' : 'rounded-none'}`}
        >
          # INNIE
        </span>
      </button>

      <span className="hidden sm:inline text-[10px] font-mono tracking-widest uppercase text-[var(--muted)]">
        {isInnie ? 'SLACK MODE' : 'LAMBORGHINI'}
      </span>
    </div>
  );
}
