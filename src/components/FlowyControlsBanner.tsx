import React from 'react';
import { 
  Palette, 
  Type, 
  Crown, 
  Flame, 
  Zap, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  CheckCircle2,
  Shield,
  Layers
} from 'lucide-react';
import { FlopperUser, ThemeId, FontId } from '../types';
import { THEMES, FONTS } from '../lib/themeManager';
import { FLOPPER_AVATARS, TIER_CONFIG } from '../lib/flopperAuth';

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
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121217] via-[#161622] to-[#121217] border border-white/10 shadow-xl relative overflow-hidden backdrop-blur-md">
        
        {/* Animated flowy ambient radial glows */}
        <div 
          className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-colors duration-500"
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
                    <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full border ${tierInfo?.color}`}>
                      {tierInfo?.badge} {tierInfo?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono mt-0.5">
                    <span className="text-amber-300 font-bold">{user.flopperId}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-400">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {user.streakDays}d streak
                    </span>
                    <span>•</span>
                    <span className="text-cyan-400 font-bold">{user.karmaXp} XP</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-xl shrink-0">
                  🐝
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-black text-white uppercase font-syne tracking-wide">
                      Next Floppers Society
                    </h3>
                    <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-400 text-black">
                      EXCLUSIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    Custom typography, direct CDN streaming & free education for all students.
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
              <div className="flex items-center gap-1">
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
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md'
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
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all btn-click-effect shadow-md flex items-center gap-1.5 font-syne"
              >
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>Flopper Login</span>
              </button>
            ) : (
              <button
                onClick={onOpenProfileModal}
                className="px-3 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all btn-click-effect flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Notes ({user.savedNotes?.length || 0})</span>
              </button>
            )}

          </div>

        </div>

        {/* Quick Flow Category Pills (Sub-strip for fast flow navigation) */}
        {!isFlowFocusMode && (
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 overflow-x-auto hide-scroll text-[11px]">
            <span className="text-stone-500 font-bold uppercase text-[9px] tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Fast Jump:</span>
            </span>
            <button
              onClick={() => onQuickFilter('Class 10th')}
              className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              🔥 Aarambh 10th
            </button>
            <button
              onClick={() => onQuickFilter('Class 9th')}
              className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              ⚡ Aarambh 9th
            </button>
            <button
              onClick={() => onQuickFilter('Class 12th')}
              className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              🎓 Prarambh 12th
            </button>
            <button
              onClick={() => onQuickFilter('Commerce')}
              className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              📊 Commerce
            </button>
            <button
              onClick={() => onQuickFilter('Nirmaan')}
              className="px-2.5 py-1 rounded-lg bg-black/40 hover:bg-white/10 text-stone-300 hover:text-white border border-white/5 shrink-0 transition-colors"
            >
              🏗️ Nirmaan (6th-8th)
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
