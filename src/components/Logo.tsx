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
  subtitle = 'STUDY VAULT · ZERO-LAG',
}) => {
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* High-Performance Vector Emblem */}
      <div className={`relative ${sizeClass} shrink-0 group`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_0_12px_var(--themePrimaryGlow,rgba(250,204,21,0.45))] transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Primary energetic gradient */}
            <linearGradient id="nf-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FACC15" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>

            {/* Cyber secondary gradient */}
            <linearGradient id="nf-cyber-grad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="60%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>

            {/* Shield rim metallic gradient */}
            <linearGradient id="nf-rim-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#475569" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </linearGradient>

            {/* Core glow filter */}
            <filter id="nf-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Hexagonal Shield Plate Base */}
          <polygon
            points="50,4 92,26 92,74 50,96 8,74 8,26"
            fill="#09090D"
            stroke="url(#nf-rim-grad)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent Inset Border */}
          <polygon
            points="50,9 86,28 86,72 50,91 14,72 14,28"
            fill="#101017"
            stroke="#262635"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Left Wing / 'N' Backbone (Electric Gold) */}
          <path
            d="M23 70 L23 30 L36 30 L47 54 L47 30 L57 30 L57 70 L44 70 L33 46 L33 70 Z"
            fill="url(#nf-primary-grad)"
            filter="url(#nf-glow)"
          />

          {/* Right Wing / 'F' Dynamic Bars (Supersonic Cyber Cyan) */}
          <path
            d="M59 30 L80 30 L80 39 L68 39 L68 47 L78 47 L78 55 L68 55 L68 70 L59 70 Z"
            fill="url(#nf-cyber-grad)"
          />

          {/* Energy Surge Inverted Bolt Center Cut */}
          <polygon
            points="48,22 55,38 49,41 53,52 43,36 49,34"
            fill="#FFFFFF"
            className="animate-pulse"
            opacity="0.95"
          />

          {/* Speed Cut Accent Lines */}
          <line x1="16" y1="24" x2="26" y2="18" stroke="#FACC15" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          <line x1="84" y1="76" x2="74" y2="82" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />

          {/* Corner Power Nodes */}
          <circle cx="50" cy="94" r="2" fill="#FACC15" />
          <circle cx="50" cy="6" r="2" fill="#38BDF8" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className={`flex flex-col leading-none ${textClassName}`}>
          <div className="flex items-center gap-1.5 font-syne font-black text-lg sm:text-xl tracking-tight text-white">
            <span>NEXT</span>
            <span className="bg-gradient-to-r from-[#FACC15] via-[#F59E0B] to-[#FB923C] bg-clip-text text-transparent">
              FLOPPERS
            </span>
          </div>
          {subtitle && (
            <span className="text-[9px] uppercase font-bold tracking-[0.2em] text-stone-400 mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
