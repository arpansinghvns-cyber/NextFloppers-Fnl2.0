import React from 'react';
import { 
  Type, 
  Crown, 
  Flame, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  Zap,
  Clock
} from 'lucide-react';
import { FlopperUser, ThemeId, FontId } from '../types';
import { THEMES, FONTS } from '../lib/themeManager';
import { FLOPPER_AVATARS, TIER_CONFIG } from '../lib/flopperAuth';
import { Logo } from './Logo';

interface FlowyControlsBannerProps {
  user: FlopperUser | null;
  currentTheme: ThemeId;
  currentFont: FontId;
  isFlowFocusMode: boolean;
  onToggleFlowFocusMode: () => void;
  onOpenThemeCustomizer: () => void;
  onOpenLoginModal: () => void;
  onOpenProfileModal: () => void;
  onQuickFilter: (category: string) => void;
  onOpenKeyGateway?: () => void;
  totalBatchesCount: number;
  enrolledCount: number;
}

export const FlowyControlsBanner: React.FC<FlowyControlsBannerProps> = ({
  user,
  currentTheme,
  currentFont,
  isFlowFocusMode,
  onToggleFlowFocusMode,
  onOpenThemeCustomizer,
  onOpenLoginModal,
  onOpenProfileModal,
  onQuickFilter,
  onOpenKeyGateway,
  totalBatchesCount,
  enrolledCount
}) => {
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const activeFontObj = FONTS.find(f => f.id === currentFont) || FONTS[0];
  const avatarObj = user ? (FLOPPER_AVATARS.find(a => a.id === user.avatar) || FLOPPER_AVATARS[0]) : null;
  const tierInfo = user ? (TIER_CONFIG[user.tier] || TIER_CONFIG.initiate) : null;

  return (
    <div className="w-full mb-6 relative">
      {/* Flowy ambient glow background container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101014] via-[#14141c] to-[#101014] border border-white/10 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Animated flowy ambient radial glows */}
        <div 
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: activeThemeObj.primaryColor }}
        />
        <div 
          className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: activeThemeObj.secondaryColor }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Left: Flopper Identity / Welcome bar */}
          <div className="flex items-center gap-3.5">
            {user ? (
              <div 
                onClick={onOpenProfileModal}
                className="flex items-center gap-3 cursor-pointer p-1.5 pr-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all btn-click-effect group"
              >
                <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {avatarObj?.icon || '👑'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-white font-syne group-hover:text-[#FACC15] transition-colors">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      · {tierInfo?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                    <span className="text-[#FACC15] font-bold">{user.flopperId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {user.streakDays}d streak
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-cyan-400 font-bold">{user.karmaXp} XP</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                  <Logo size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase font-syne tracking-wide">
                      Next Floppers Vault
                    </h3>
                    <span className="text-[10px] text-[#FACC15] font-bold">
                      · 0ms Edge Cache
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    High-speed direct mirrors, zero login enforcement & all batch archives.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Functional Control Hub */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
            
            {/* Theme & Font Customizer Trigger */}
            <button
              onClick={onOpenThemeCustomizer}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 btn-click-effect group"
              title="Change UI Fonts & Theme Colors"
            >
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: activeThemeObj.primaryColor }}
                />
                <Type className="w-3.5 h-3.5 text-stone-400 group-hover:text-white transition-colors" />
              </div>
              <span className="font-syne text-[11px] text-stone-200">
                {activeFontObj.name.split(' ')[0]} / {activeThemeObj.name}
              </span>
            </button>

            {/* Focus Flow Mode Toggle */}
            <button
              onClick={onToggleFlowFocusMode}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 btn-click-effect ${
                isFlowFocusMode
                  ? 'bg-[#FACC15] text-black border-[#FACC15] shadow-md'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-stone-300'
              }`}
              title={isFlowFocusMode ? "Exit Focus Flow Mode" : "Enable Focus Flow Mode (clean distraction-free study)"}
            >
              {isFlowFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="text-[11px]">
                {isFlowFocusMode ? 'Focus On' : 'Flow Mode'}
              </span>
            </button>

            {/* Society Member Login / Register Button */}
            {!user ? (
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#F59E0B] hover:brightness-110 text-black text-xs font-black uppercase tracking-wider transition-all btn-click-effect shadow-md flex items-center gap-1.5 font-syne"
              >
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>Flopper Pass</span>
              </button>
            ) : (
              <button
                onClick={onOpenProfileModal}
                className="px-3 py-2 rounded-xl bg-[#FACC15]/10 hover:bg-[#FACC15]/20 border border-[#FACC15]/30 text-[#FACC15] text-xs font-bold transition-all btn-click-effect flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes ({user.savedNotes?.length || 0})</span>
              </button>
            )}

          </div>

        </div>

        {/* Quick Flow Category Navigation */}
        {!isFlowFocusMode && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 overflow-x-auto hide-scroll text-[11px]">
            <span className="text-stone-500 font-semibold text-[10px] uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#FACC15]" />
              <span>Fast Jump:</span>
            </span>
            <button
              onClick={() => onQuickFilter('Class 10th')}
              className="px-3 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              Aarambh 10th
            </button>
            <button
              onClick={() => onQuickFilter('Class 9th')}
              className="px-3 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              Aarambh 9th
            </button>
            <button
              onClick={() => onQuickFilter('Class 12th')}
              className="px-3 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              Prarambh 12th
            </button>
            <button
              onClick={() => onQuickFilter('Commerce')}
              className="px-3 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              Commerce
            </button>
            <button
              onClick={() => onQuickFilter('Nirmaan')}
              className="px-3 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              Nirmaan (6th-8th)
            </button>
            <button
              onClick={() => onQuickFilter('CUET / Olympiad')}
              className="px-3 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              Olympiad / CUET
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FlowyControlsBanner;
