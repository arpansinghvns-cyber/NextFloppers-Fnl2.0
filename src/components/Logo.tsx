import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
  subtitle?: string;
}

const SIZES = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-11 h-11',
  xl: 'w-16 h-16',
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textClassName = '',
  subtitle = 'NOTHING OS VAULT · ZERO-LAG',
}) => {
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Nothing Glyph Inspired Emblem */}
      <div className={`relative ${sizeClass} shrink-0 group`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_14px_rgba(230,0,0,0.4)] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Nothing Glyph Ring */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#26262B"
            strokeWidth="2"
            strokeDasharray="4 6"
          />

          {/* Glyph Segment 1 - Top Arc */}
          <path
            d="M26 30 A32 32 0 0 1 74 30"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Glyph Segment 2 - Bottom Arc */}
          <path
            d="M32 74 A32 32 0 0 0 68 74"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Center Matrix Dot Screen */}
          <rect
            x="34"
            y="38"
            width="32"
            height="24"
            rx="6"
            fill="#121217"
            stroke="#2D2D38"
            strokeWidth="1.5"
          />

          {/* Dot Matrix Letter 'N' */}
          <circle cx="41" cy="44" r="1.5" fill="#FFFFFF" />
          <circle cx="41" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="41" cy="56" r="1.5" fill="#FFFFFF" />
          <circle cx="46" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="51" cy="44" r="1.5" fill="#FFFFFF" />
          <circle cx="51" cy="50" r="1.5" fill="#FFFFFF" />
          <circle cx="51" cy="56" r="1.5" fill="#FFFFFF" />

          {/* Iconic Nothing Red Dot LED */}
          <circle
            cx="59"
            cy="44"
            r="2.5"
            fill="#E60000"
            className="animate-pulse"
          />
          <circle
            cx="59"
            cy="44"
            r="4.5"
            fill="#E60000"
            opacity="0.3"
          />

          {/* Right Bottom Dash */}
          <line
            x1="56"
            y1="56"
            x2="62"
            y2="56"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Nothing Dot Matrix Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center gap-1.5 font-doto font-extrabold text-lg sm:text-xl tracking-wider text-white">
            <span>NEXT</span>
            <span className="text-white">FLOPPERS</span>
            <span className="text-[#E60000] text-sm font-black tracking-normal ml-0.5 animate-pulse">
              (2.0)
            </span>
          </div>
          {subtitle && (
            <span className="text-[9px] uppercase font-mono tracking-[0.2em] text-neutral-400 mt-1">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
