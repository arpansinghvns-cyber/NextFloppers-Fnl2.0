import { ThemeId, FontId } from '../types';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  badgeBg: string;
  textColor: string;
  glowColor: string;
}

export interface FontConfig {
  id: FontId;
  name: string;
  tagline: string;
  sample: string;
  family: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'nothing',
    name: 'Nothing OS (1)',
    tagline: 'Iconic Nothing Glyph Black & Red Dot',
    primaryColor: '#E60000',
    secondaryColor: '#FFFFFF',
    badgeBg: 'bg-red-500/10 border-red-500/30 text-red-400',
    textColor: 'text-[#E60000]',
    glowColor: 'rgba(230, 0, 0, 0.45)'
  },
  {
    id: 'amber',
    name: 'Cyber Gold',
    tagline: 'Signature Next Floppers Gold',
    primaryColor: '#FACC15',
    secondaryColor: '#F59E0B',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    textColor: 'text-[#FACC15]',
    glowColor: 'rgba(250, 204, 21, 0.4)'
  },
  {
    id: 'cyber',
    name: 'Electric Azure',
    tagline: 'High-tech Neon Cyan & Blue',
    primaryColor: '#06B6D4',
    secondaryColor: '#3B82F6',
    badgeBg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    textColor: 'text-cyan-400',
    glowColor: 'rgba(6, 182, 212, 0.45)'
  },
  {
    id: 'purple',
    name: 'Royal Synth',
    tagline: 'Velvet Purple & Neon Pink',
    primaryColor: '#C084FC',
    secondaryColor: '#EC4899',
    badgeBg: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
    textColor: 'text-purple-400',
    glowColor: 'rgba(192, 132, 252, 0.45)'
  },
  {
    id: 'emerald',
    name: 'Matrix Emerald',
    tagline: 'Ultra-focus Deep Green',
    primaryColor: '#10B981',
    secondaryColor: '#14B8A6',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    textColor: 'text-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.45)'
  },
  {
    id: 'crimson',
    name: 'Solar Crimson',
    tagline: 'Blazing Red Overdrive',
    primaryColor: '#FB7185',
    secondaryColor: '#F43F5E',
    badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
    textColor: 'text-rose-400',
    glowColor: 'rgba(251, 113, 133, 0.45)'
  }
];

export const FONTS: FontConfig[] = [
  {
    id: 'nothing',
    name: 'Nothing Dot Matrix (NDOT)',
    tagline: 'Signature Nothing OS Dot-Matrix typography',
    sample: 'NEXT FLOPPERS (2.0)',
    family: "'Doto', 'Space Grotesk', monospace"
  },
  {
    id: 'space',
    name: 'Nothing Sans (Space Grotesk)',
    tagline: 'Sharp Nothing Phone industrial font',
    sample: 'Aarambh Class 10th Batch',
    family: "'Space Grotesk', sans-serif"
  },
  {
    id: 'syne',
    name: 'Syne Hyper-Display',
    tagline: 'Heavy, futuristic & punchy',
    sample: 'NEXT FLOPPERS 2026',
    family: "'Syne', sans-serif"
  },
  {
    id: 'outfit',
    name: 'Outfit Fluid',
    tagline: 'Clean geometric and flowy',
    sample: 'Direct Video & Notes Stream',
    family: "'Outfit', sans-serif"
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    tagline: 'High-polish editorial typography',
    sample: 'Chemical Reactions & Equations',
    family: "'Plus Jakarta Sans', sans-serif"
  },
  {
    id: 'mono',
    name: 'JetBrains Code Mono',
    tagline: 'Cyber terminal geek style',
    sample: 'status: 200 OK | HLS v2',
    family: "'JetBrains Mono', monospace"
  },
  {
    id: 'inter',
    name: 'Inter Balanced',
    tagline: 'Classic neutral readability',
    sample: 'Comprehensive CBSE Curriculum',
    family: "'Inter', system-ui, sans-serif"
  }
];

export function applyTheme(themeId: ThemeId) {
  try {
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('flopper_active_theme', themeId);
  } catch (e) {
    console.error('Failed to apply theme:', e);
  }
}

export function applyFont(fontId: FontId) {
  try {
    document.documentElement.setAttribute('data-font', fontId);
    localStorage.setItem('flopper_active_font', fontId);
  } catch (e) {
    console.error('Failed to apply font:', e);
  }
}

export function getInitialTheme(): ThemeId {
  try {
    const saved = localStorage.getItem('flopper_active_theme') as ThemeId;
    if (saved && THEMES.some(t => t.id === saved)) return saved;
  } catch {}
  return 'nothing';
}

export function getInitialFont(): FontId {
  try {
    const saved = localStorage.getItem('flopper_active_font') as FontId;
    if (saved && FONTS.some(f => f.id === saved)) return saved;
  } catch {}
  return 'nothing';
}
