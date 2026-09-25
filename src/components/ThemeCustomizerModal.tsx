import React from 'react';
import { X, Palette, Check } from 'lucide-react';
import { THEMES, applyTheme } from '../lib/themeManager';
import { ThemeId } from '../types';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in font-sans">
      <div 
        className="bg-[#09090d] border border-white/15 w-full max-w-lg rounded-3xl p-6 relative shadow-2xl overflow-hidden nothing-dot-bg text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E60000]">
            <Palette className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
              <h3 className="text-base font-bold text-white font-doto uppercase tracking-wider">
                ATMOSPHERE ACCENTS
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select lighting glow accents across the Nothing OS player and widgets.
            </p>
          </div>
        </div>

        {/* Theme List */}
        <div className="space-y-2.5 font-doto uppercase text-xs">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <div
                key={theme.id}
                onClick={() => {
                  onThemeChange(theme.id);
                  applyTheme(theme.id);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-white/10 border-white/40 shadow-lg'
                    : 'bg-black/50 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span 
                    className="w-4 h-4 rounded-full shadow-md"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                  <div>
                    <div className="font-bold text-white tracking-wide">{theme.name}</div>
                    <div className="text-[10px] text-neutral-400 font-sans normal-case">{theme.tagline}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSelected && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ACTIVE
                    </span>
                  )}
                  <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-white bg-white text-black' : 'border-white/20'
                  }`}>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end font-doto text-xs uppercase">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-white text-black font-bold rounded-2xl hover:bg-[#E60000] hover:text-white transition-colors"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
export default ThemeCustomizerModal;
