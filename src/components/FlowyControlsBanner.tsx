import React from 'react';
import { 
  Palette, 
  Crown, 
  Flame, 
  Maximize2, 
  Minimize2, 
  BookOpen, 
  RefreshCw,
  Radio,
  Users
} from 'lucide-react';
import { FlopperUser, ThemeId } from '../types';
import { THEMES } from '../lib/themeManager';
import { FLOPPER_AVATARS, TIER_CONFIG } from '../lib/flopperAuth';
import { Logo } from './Logo';

interface FlowyControlsBannerProps {
  user: FlopperUser | null;
  currentTheme: ThemeId;
  isFlowFocusMode: boolean;
  onToggleFlowFocusMode: () => void;
  onOpenThemeCustomizer: () => void;
  onOpenLoginModal: () => void;
  onOpenProfileModal: () => void;
  onQuickFilter: (category: string) => void;
  onOpenCommunity?: () => void;
  onOpenLiveClasses?: () => void;
  onOpenKeyGateway?: () => void;
  onOpenAutoUpdateModal?: () => void;
  onOpenDualUpdatePopup?: () => void;
  totalBatchesCount: number;
  enrolledCount: number;
}

export const FlowyControlsBanner: React.FC<FlowyControlsBannerProps> = ({
  user,
  currentTheme,
  isFlowFocusMode,
  onToggleFlowFocusMode,
  onOpenThemeCustomizer,
  onOpenLoginModal,
  onOpenProfileModal,
  onQuickFilter,
  onOpenCommunity,
  onOpenLiveClasses,
  onOpenAutoUpdateModal,
  onOpenDualUpdatePopup,
  totalBatchesCount,
  enrolledCount
}) => {
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const avatarObj = user ? (FLOPPER_AVATARS.find(a => a.id === user.avatar) || FLOPPER_AVATARS[0]) : null;
  const tierInfo = user ? (TIER_CONFIG[user.tier] || TIER_CONFIG.initiate) : null;

  return (
    <div className="w-full mb-6 relative font-sans">
      {/* Nothing OS Widget Styled Container */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#09090d] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl nothing-dot-bg">
        
        {/* Subtle Nothing Red Corner LED Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E60000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          
          {/* Left: Flopper Identity / Nothing Widget */}
          <div className="flex items-center gap-3.5">
            {user ? (
              <div 
                onClick={onOpenProfileModal}
                className="flex items-center gap-3 cursor-pointer p-2 pr-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all btn-click-effect group"
              >
                <div className="w-12 h-12 rounded-2xl bg-black border border-white/20 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {avatarObj?.icon || '👑'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-doto tracking-wide group-hover:text-red-400 transition-colors uppercase">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      · {tierInfo?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono mt-0.5">
                    <span className="text-white font-bold">{user.flopperId}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[#E60000] font-bold">
                      <Flame className="w-3 h-3 fill-[#E60000]" />
                      {user.streakDays}d streak
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-neutral-300 font-bold">{user.karmaXp} XP</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center shrink-0">
                  <Logo size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white uppercase font-doto tracking-wider flex items-center gap-1.5">
                      <span>NEXT FLOPPERS</span>
                      <span className="text-[#E60000] text-xs">(2.0)</span>
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {totalBatchesCount} BATCHES
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Clean Nothing OS layout · 0ms local buffer · Ultra Video Player & Community Books.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right: Functional Control Hub */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto justify-start lg:justify-end font-doto">
            
            {/* Live Classes Schedule Hub Trigger */}
            {onOpenLiveClasses && (
              <button
                onClick={onOpenLiveClasses}
                className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold transition-all flex items-center gap-2 btn-click-effect group shadow-sm tracking-wider uppercase"
                title="Open Live Broadcast Schedule & Timetable (5 PM & 8 PM)"
              >
                <Radio className="w-3.5 h-3.5 text-[#E60000]" />
                <span className="text-[11px] text-white">LIVE SCHEDULE</span>
              </button>
            )}

            {/* Community Books & Suggestions Hub Trigger */}
            {onOpenCommunity && (
              <button
                onClick={onOpenCommunity}
                className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 btn-click-effect group shadow-sm tracking-wider uppercase"
                title="Open NT Floppers Community Hub (Shared Books, Files & Suggestions)"
              >
                <Users className="w-3.5 h-3.5 text-[#E60000]" />
                <span className="text-[11px] text-white">COMMUNITY HUB</span>
              </button>
            )}

            {/* Live CDN & Content Auto-Update Trigger */}
            {onOpenDualUpdatePopup ? (
              <button
                onClick={onOpenDualUpdatePopup}
                className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 btn-click-effect group shadow-sm tracking-wider"
                title="Enforce stream & batch update check from CloudFront and studybeepro.site"
              >
                <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
                <RefreshCw className="w-3.5 h-3.5 text-neutral-300 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[11px] text-white uppercase">CF & STUDYBEE SYNC</span>
              </button>
            ) : onOpenAutoUpdateModal ? (
              <button
                onClick={onOpenAutoUpdateModal}
                className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 btn-click-effect group shadow-sm tracking-wider"
                title="Launch System Auto-Update Engine (refreshes all stream buffers and syllabus)"
              >
                <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
                <RefreshCw className="w-3.5 h-3.5 text-neutral-300 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[11px] text-white uppercase">SYNC</span>
              </button>
            ) : null}

            {/* Atmosphere Customizer Trigger */}
            <button
              onClick={onOpenThemeCustomizer}
              className="px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all flex items-center gap-2 btn-click-effect group tracking-wider"
              title="Change Lighting Atmosphere"
            >
              <span 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeThemeObj.primaryColor }}
              />
              <Palette className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
            </button>

            {/* Focus Flow Mode Toggle */}
            <button
              onClick={onToggleFlowFocusMode}
              className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 btn-click-effect tracking-wider ${
                isFlowFocusMode
                  ? 'bg-white text-black border-white shadow-lg'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300'
              }`}
              title={isFlowFocusMode ? "Exit Focus Flow Mode" : "Enable Focus Flow Mode (clean distraction-free study)"}
            >
              {isFlowFocusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span className="text-[11px] uppercase">
                {isFlowFocusMode ? 'FOCUS ON' : 'FLOW'}
              </span>
            </button>

            {/* Society Member Login / Register Button */}
            {!user ? (
              <button
                onClick={onOpenLoginModal}
                className="px-4 py-2.5 rounded-2xl bg-[#E60000] hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider transition-all btn-click-effect shadow-[0_0_20px_rgba(230,0,0,0.35)] flex items-center gap-1.5"
              >
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>FLOPPER PASS</span>
              </button>
            ) : (
              <button
                onClick={onOpenProfileModal}
                className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all btn-click-effect flex items-center gap-1.5 uppercase"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#E60000]" />
                <span>NOTES ({user.savedNotes?.length || 0})</span>
              </button>
            )}

          </div>

        </div>

        {/* Quick Flow Category Navigation */}
        {!isFlowFocusMode && (
          <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center gap-2 overflow-x-auto hide-scroll text-[11px] font-doto uppercase">
            <span className="text-neutral-500 font-bold text-[10px] tracking-wider shrink-0 flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#E60000]" />
              <span>SHORTCUTS:</span>
            </span>
            <button
              onClick={() => onQuickFilter('Class 10th')}
              className="px-3 py-1 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            >
              AARAMBH 10TH
            </button>
            <button
              onClick={() => onQuickFilter('Class 9th')}
              className="px-3 py-1 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            >
              AARAMBH 9TH
            </button>
            <button
              onClick={() => onQuickFilter('Class 12th')}
              className="px-3 py-1 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            >
              PRARAMBH 12TH
            </button>
            <button
              onClick={() => onQuickFilter('Class 11th')}
              className="px-3 py-1 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            >
              PRARAMBH 11TH
            </button>
            <button
              onClick={() => onQuickFilter('Commerce')}
              className="px-3 py-1 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            >
              COMMERCE
            </button>
            <button
              onClick={() => onQuickFilter('Nirmaan')}
              className="px-3 py-1 rounded-xl bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 shrink-0 transition-colors"
            >
              NIRMAAN
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
export default FlowyControlsBanner;
