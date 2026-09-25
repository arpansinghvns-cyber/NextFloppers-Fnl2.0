import React from 'react';
import { X, Sparkles, Type, Palette, Check, Sliders } from 'lucide-react';
import { THEMES, FONTS, applyTheme, applyFont } from '../lib/themeManager';
import { ThemeId, FontId } from '../types';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  currentFont: FontId;
  onThemeChange: (theme: ThemeId) => void;
  onFontChange: (font: FontId) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  currentFont,
  onThemeChange,
  onFontChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-[#101014] border border-white/10 w-full max-w-xl rounded-2xl p-6 sm:p-7 relative shadow-2xl modal-glass max-h-[90vh] overflow-y-auto flowy-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400/20 via-purple-500/20 to-cyan-500/20 border border-white/15 flex items-center justify-center text-white shadow-inner">
            <Palette className="w-6 h-6 text-[#FACC15]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-wide font-syne flex items-center gap-2">
              <span>Theme & Typography Studio</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                Customizer
              </span>
            </h3>
            <p className="text-xs text-stone-400">
              Personalize fonts and fluid neon aesthetics across all lectures and batches.
            </p>
          </div>
        </div>

        {/* Section 1: Font Selector */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Type className="w-4 h-4 text-[#FACC15]" />
              <span>Select UI Typography ({FONTS.length} Fonts)</span>
            </label>
            <span className="text-[11px] text-stone-400 font-mono">
              active: <strong className="text-white uppercase">{currentFont}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {FONTS.map((f) => {
              const isSelected = currentFont === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    applyFont(f.id);
                    onFontChange(f.id);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all btn-click-effect relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white/10 border-[#FACC15] shadow-lg shadow-[#FACC15]/10 ring-1 ring-[#FACC15]/40'
                      : 'bg-[#15151a] border-white/5 hover:border-white/20 hover:bg-white/5 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-white" style={{ fontFamily: f.family }}>
                      {f.name}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#FACC15] text-black flex items-center justify-center text-[10px]">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-stone-400 mb-2">{f.tagline}</div>
                  <div 
                    className="text-xs px-2 py-1 rounded bg-black/40 text-stone-200 border border-white/5 truncate font-medium"
                    style={{ fontFamily: f.family }}
                  >
                    {f.sample}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Color Palette Themes */}
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Color Atmosphere ({THEMES.length} Themes)</span>
            </label>
            <span className="text-[11px] text-stone-400 font-mono">
              active: <strong className="text-white uppercase">{currentTheme}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {THEMES.map((t) => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    applyTheme(t.id);
                    onThemeChange(t.id);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all btn-click-effect relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white/10 border-white/40 ring-2 shadow-lg'
                      : 'bg-[#15151a] border-white/5 hover:border-white/20 hover:bg-white/5 text-stone-300'
                  }`}
                  style={{
                    borderColor: isSelected ? t.primaryColor : undefined,
                    boxShadow: isSelected ? `0 0 20px -5px ${t.glowColor}` : undefined
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: t.primaryColor }}
                      />
                      <span 
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: t.secondaryColor }}
                      />
                    </div>
                    {isSelected && (
                      <span 
                        className="w-4 h-4 rounded-full text-black flex items-center justify-center text-[10px]"
                        style={{ backgroundColor: t.primaryColor }}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs text-white mb-0.5">{t.name}</div>
                  <div className="text-[10px] text-stone-400 truncate">{t.tagline}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-6">
          <div className="text-[10px] uppercase font-bold text-stone-400 mb-2 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Interactive Typography Live Preview</span>
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white mb-1 font-syne">
            NEXT FLOPPERS: Aarambh 2.0 Class 10th Science
          </h4>
          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
            Direct CloudFront stream integration with adaptive 1080p/720p/480p relocation and zero-interruption PDF notes engine.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-[#FACC15] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all btn-click-effect shadow-md font-syne"
        >
          Save & Enjoy Customized Experience
        </button>
      </div>
    </div>
  );
};
