/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  LayoutGrid, 
  Key, 
  X, 
  CheckCircle2, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Type, 
  Crown, 
  Zap, 
  Clock,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { BatchItem, Lecture, ThemeId, FontId, FlopperUser } from './types';
import { ALL_BATCHES } from './lib/batchesData';
import { fetchAllBatches, MediaResolutionResult } from './lib/api';
import { 
  getActiveKey, 
  getActiveKeySync, 
  hasActiveKey, 
  isFloppyAdminUser, 
  clearActiveKey,
  getKeyTimeRemaining 
} from './lib/keyService';
import { BatchCard } from './components/BatchCard';
import { CourseExplorer } from './components/CourseExplorer';
import { VideoModal } from './components/VideoModal';
import { CbtAssessmentModal } from './components/CbtAssessmentModal';
import { LectureCard } from './components/LectureCard';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { FlopperLoginModal } from './components/FlopperLoginModal';
import { FlopperProfileModal } from './components/FlopperProfileModal';
import { FlowyControlsBanner } from './components/FlowyControlsBanner';
import { KeyGatewayModal } from './components/KeyGatewayModal';
import { Logo } from './components/Logo';
import { 
  getInitialTheme, 
  getInitialFont, 
  applyTheme, 
  applyFont, 
  THEMES, 
  FONTS 
} from './lib/themeManager';
import { 
  getActiveFlopper, 
  saveActiveFlopper, 
  logoutFlopper, 
  addFlopperKarma,
  FLOPPER_AVATARS,
  TIER_CONFIG
} from './lib/flopperAuth';

const CURATED_LECTURES: Lecture[] = [
  {
    id: 'sci-4',
    title: 'Chemical Reactions & Equations - L4',
    instructor: 'Prashant Kirad (Next Toppers)',
    thumbnail: 'https://i.ytimg.com/vi/jZp3-eL_R0c/hqdefault.jpg',
    videoUrl: 'https://d1oxe6vjn5slmc.cloudfront.net/out/v1/df4aad6929d24c36ba38879fa1bf5f8d/index_2.m3u8',
    description: 'Lecture 04: Advanced concepts in Chemical Equations, redox reactions, and expert problem-solving strategies.',
    category: 'Science',
    isLive: true
  },
  {
    id: 'sci-2',
    title: 'Chemical Reactions & Equations - L3',
    instructor: 'Prashant Kirad (Next Toppers)',
    thumbnail: 'https://i.ytimg.com/vi/jZp3-eL_R0c/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=jZp3-eL_R0c',
    description: 'Lecture 03 focusing on Types of Chemical Reactions and Balancing Equations. Essential for Board Exam preparation with expert tips.',
    category: 'Science'
  },
  {
    id: 'sci-3',
    title: 'Chemical Reactions & Equations - L2',
    instructor: 'Prashant Kirad',
    thumbnail: 'https://i.ytimg.com/vi/jZp3-eL_R0c/hqdefault.jpg',
    videoUrl: 'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4744328/177652904649498210315/index_2.m3u8',
    description: 'Lecture 02: Detailed analysis of Chemical Equations, balancing techniques, and introductory reaction types.',
    category: 'Science'
  },
  {
    id: 'sst-2',
    title: 'Development - L3',
    instructor: 'Digraj Singh Rajput',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800&h=450',
    videoUrl: 'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4745192/177668871748251304992/177668871748251304992_1304992.m3u8',
    description: 'Lecture 03 of Development chapter. Analyzing Sustainability and Public Facilities. A concluding session on economic progress.',
    category: 'SST'
  },
  {
    id: 'math-1',
    title: 'Real Numbers - L1',
    instructor: 'Shobhit Nirwan Sir',
    thumbnail: 'https://i.ytimg.com/vi/qB3O9N7D-Yw/maxresdefault.jpg',
    videoUrl: 'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4745408/177670074930851664920/177670074930851664920_1664920.m3u8',
    description: "Introduction to Real Numbers, Euclid's Division Lemma, and the Fundamental Theorem of Arithmetic.",
    category: 'Maths'
  },
  {
    id: 'eng-1',
    title: 'A Letter to God - L1',
    instructor: "Magnolia Ma'am",
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800&h=450',
    videoUrl: 'https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/4743413/177642914867145703321/index_2.m3u8',
    description: 'Comprehensive analysis of "A Letter to God" by G.L. Fuentes. Deep dive into themes, characters, and important questions.',
    category: 'English'
  }
];

const CATEGORY_TABS = [
  'All Batches',
  'Class 10th',
  'Class 9th',
  'Class 12th',
  'Class 11th',
  'Commerce',
  'Nirmaan',
  'CUET / Olympiad'
] as const;

export default function App() {
  const [batches, setBatches] = useState<BatchItem[]>(ALL_BATCHES);
  const [currentTab, setCurrentTab] = useState<'batches' | 'enrolled' | 'curated'>('batches');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Batches');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('studybee_wishlist') || '[]').map(String);
    } catch {
      return [];
    }
  });

  // Theme & Typography state
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getInitialTheme);
  const [currentFont, setCurrentFont] = useState<FontId>(getInitialFont);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Exclusive Next Floppers Login & Member state
  const [flopperUser, setFlopperUser] = useState<FlopperUser | null>(getActiveFlopper);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Flow Focus Mode (clean distraction-free study layout)
  const [isFlowFocusMode, setIsFlowFocusMode] = useState<boolean>(() => {
    return localStorage.getItem('flopper_flow_mode') === 'true';
  });

  // Course exploration state
  const [activeCourse, setActiveCourse] = useState<BatchItem | null>(null);

  // Video playback modal state
  const [activeMedia, setActiveMedia] = useState<MediaResolutionResult | null>(null);
  const [selectedCuratedLecture, setSelectedCuratedLecture] = useState<Lecture | null>(null);

  // CBT Exam modal state
  const [activeTest, setActiveTest] = useState<{ id: string; title: string } | null>(null);

  // Mandatory Key State & FloppyAdmin Verification
  const [activeKey, setActiveKey] = useState<string>(() => getActiveKeySync());
  const [hasValidKey, setHasValidKey] = useState<boolean>(() => hasActiveKey());
  const [isFloppyAdmin, setIsFloppyAdmin] = useState<boolean>(() => isFloppyAdminUser());
  const [isKeyGatewayOpen, setIsKeyGatewayOpen] = useState(false);
  const [keyGatewayReason, setKeyGatewayReason] = useState<string | undefined>(undefined);
  const [showKeyInfoModal, setShowKeyInfoModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard shortcut listener for fast search '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initialize theme, font, and asynchronous background sync for GitHub Pages
  useEffect(() => {
    applyTheme(currentTheme);
    applyFont(currentFont);

    // Non-blocking background batch list refresh
    fetchAllBatches().then((list) => {
      if (list && list.length > 0) {
        setBatches(list);
      }
    });

    // Check key status on startup
    const valid = hasActiveKey();
    setHasValidKey(valid);
    setIsFloppyAdmin(isFloppyAdminUser());
    if (valid) {
      setActiveKey(getActiveKey() || '');
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleOpenKeyGateway = (reason?: string) => {
    setKeyGatewayReason(reason);
    setIsKeyGatewayOpen(true);
  };

  const handleKeyActivated = (key: string, isAdmin?: boolean) => {
    setActiveKey(key);
    setHasValidKey(true);
    if (isAdmin || isFloppyAdminUser()) {
      setIsFloppyAdmin(true);
      showToast("👑 FloppyAdmin Master Bypass Activated!");
    } else {
      setIsFloppyAdmin(false);
      showToast("🔑 Key Activated! 24H Access Unlocked.");
    }
    setIsKeyGatewayOpen(false);
  };

  const handleToggleFlowFocusMode = () => {
    const nextVal = !isFlowFocusMode;
    setIsFlowFocusMode(nextVal);
    localStorage.setItem('flopper_flow_mode', String(nextVal));
    showToast(nextVal ? "Flow Focus Mode Activated 🧘" : "Flow Focus Mode Disabled");
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
    if (flopperUser) {
      const updated = { ...flopperUser, theme: newTheme };
      setFlopperUser(updated);
      saveActiveFlopper(updated);
    }
    showToast(`Atmosphere set to ${newTheme.toUpperCase()}`);
  };

  const handleFontChange = (newFont: FontId) => {
    setCurrentFont(newFont);
    applyFont(newFont);
    if (flopperUser) {
      const updated = { ...flopperUser, font: newFont };
      setFlopperUser(updated);
      saveActiveFlopper(updated);
    }
    showToast(`Typography set to ${newFont.toUpperCase()}`);
  };

  const handleAuthSuccess = (user: FlopperUser) => {
    setFlopperUser(user);
    if (user.theme) {
      setCurrentTheme(user.theme);
      applyTheme(user.theme);
    }
    if (user.font) {
      setCurrentFont(user.font);
      applyFont(user.font);
    }
    showToast(`Welcome back, ${user.name}! 👑 Pass Active`);
  };

  const handleLogout = () => {
    logoutFlopper();
    setFlopperUser(null);
    showToast("Disconnected from Flopper Identity");
  };

  const handleToggleEnroll = (batchId: string | number) => {
    const idStr = String(batchId);
    let nextList: string[];
    if (enrolledIds.includes(idStr)) {
      nextList = enrolledIds.filter(id => id !== idStr);
      showToast("Removed from My Enrollments");
    } else {
      nextList = [...enrolledIds, idStr];
      showToast("Successfully Enrolled in Batch!");
      if (flopperUser) {
        const updated = addFlopperKarma(20);
        if (updated) setFlopperUser(updated);
      }
    }
    setEnrolledIds(nextList);
    localStorage.setItem('studybee_wishlist', JSON.stringify(nextList));
  };

  // Launch lecture with Key requirement enforcement
  const handlePlayLecture = (lec: Lecture) => {
    if (!hasActiveKey() && !isFloppyAdminUser()) {
      handleOpenKeyGateway(lec.title);
      return;
    }
    setSelectedCuratedLecture(lec);
    if (flopperUser) {
      const updated = addFlopperKarma(5);
      if (updated) setFlopperUser(updated);
    }
  };

  // Launch media with Key requirement enforcement
  const handlePlayMedia = (media: MediaResolutionResult) => {
    if ((media.requiresKey || !hasActiveKey()) && !isFloppyAdminUser()) {
      handleOpenKeyGateway(media.title);
      return;
    }
    setActiveMedia(media);
    if (flopperUser) {
      const updated = addFlopperKarma(5);
      if (updated) setFlopperUser(updated);
    }
  };

  // Launch test with Key requirement enforcement
  const handleStartTest = (id: string, title: string) => {
    if (!hasActiveKey() && !isFloppyAdminUser()) {
      handleOpenKeyGateway(title);
      return;
    }
    setActiveTest({ id, title });
    if (flopperUser) {
      const updated = addFlopperKarma(15);
      if (updated) setFlopperUser(updated);
    }
  };

  // Filter batches
  const filteredBatches = useMemo(() => {
    let result = batches;

    if (currentTab === 'enrolled') {
      result = result.filter(b => enrolledIds.includes(String(b.id)));
    }

    if (selectedCategory !== 'All Batches') {
      if (selectedCategory === 'Class 10th') {
        result = result.filter(b => b.title.toLowerCase().includes('10th'));
      } else if (selectedCategory === 'Class 9th') {
        result = result.filter(b => b.title.toLowerCase().includes('9th'));
      } else if (selectedCategory === 'Class 12th') {
        result = result.filter(b => b.title.toLowerCase().includes('12th'));
      } else if (selectedCategory === 'Class 11th') {
        result = result.filter(b => b.title.toLowerCase().includes('11th'));
      } else if (selectedCategory === 'Commerce') {
        result = result.filter(b => b.title.toLowerCase().includes('commerce'));
      } else if (selectedCategory === 'Nirmaan') {
        result = result.filter(b => b.title.toLowerCase().includes('nirmaan') || b.title.toLowerCase().includes('class 8') || b.title.toLowerCase().includes('class 7'));
      } else if (selectedCategory === 'CUET / Olympiad') {
        result = result.filter(b => b.title.toLowerCase().includes('cuet') || b.title.toLowerCase().includes('ioqm') || b.title.toLowerCase().includes('nsejs'));
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(b => 
        b.title.toLowerCase().includes(q) || 
        String(b.id).includes(q) ||
        (b.category && b.category.toLowerCase().includes(q))
      );
    }

    return result;
  }, [batches, currentTab, selectedCategory, searchQuery, enrolledIds]);

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const userAvatarObj = flopperUser ? (FLOPPER_AVATARS.find(a => a.id === flopperUser.avatar) || FLOPPER_AVATARS[0]) : null;
  const timeRemaining = getKeyTimeRemaining();

  return (
    <div className="min-h-screen relative flex flex-col bg-[#070709] text-stone-200 flowy-mesh">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-black/95 border border-[#FACC15]/50 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#FACC15]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="w-full z-40 nav-glass h-[70px] sticky top-0 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-[92rem] mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
          
          {/* Brand Logo & Name */}
          <div 
            className="cursor-pointer btn-click-effect shrink-0"
            onClick={() => {
              setActiveCourse(null);
              setCurrentTab('batches');
              setSelectedCategory('All Batches');
              setSearchQuery('');
            }}
          >
            <Logo size="md" showText={true} subtitle="Education Vault · Zero-Lag" />
          </div>

          {/* Center Navigation Links (Segmented Navigation) */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-[#121217] rounded-xl border border-white/5">
            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('batches');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-click-effect ${
                currentTab === 'batches' && !activeCourse 
                  ? 'bg-[#FACC15] text-black shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Batches</span>
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('enrolled');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-click-effect ${
                currentTab === 'enrolled' 
                  ? 'bg-[#FACC15] text-black shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Enrolled</span>
              {enrolledIds.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${currentTab === 'enrolled' ? 'bg-black text-[#FACC15]' : 'bg-[#10B981] text-black'}`}>
                  {enrolledIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('curated');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-click-effect ${
                currentTab === 'curated' 
                  ? 'bg-[#FACC15] text-black shadow-sm' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Lectures</span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Quick Header Search Bar */}
            <div className="hidden xl:flex items-center relative w-56">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches (/)..."
                className="w-full bg-[#121217] border border-white/10 rounded-xl pl-8 pr-7 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#FACC15]/60 transition-colors"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-500 border border-white/10 px-1 rounded">
                  /
                </span>
              )}
            </div>

            {/* Atmosphere / Theme Trigger */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 bg-[#14141a] hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect shadow-sm"
              title="Customize Themes & Fonts"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: activeThemeObj.primaryColor }}
              />
              <Type className="w-4 h-4 text-stone-300" />
              <span className="hidden sm:inline text-stone-300 font-syne">Style</span>
            </button>

            {/* Mandatory Key / FloppyAdmin Status Trigger */}
            {isFloppyAdmin ? (
              <button
                onClick={() => setShowKeyInfoModal(true)}
                className="flex px-3 py-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-bold transition-all items-center gap-1.5 btn-click-effect shadow-sm"
                title="FloppyAdmin Master Bypass Active (Unlimited)"
              >
                <span>👑 FloppyAdmin</span>
              </button>
            ) : hasValidKey ? (
              <button
                onClick={() => setShowKeyInfoModal(true)}
                className="hidden sm:flex px-3 py-1.5 bg-[#14141a] hover:bg-white/10 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-bold transition-all items-center gap-1.5 btn-click-effect shadow-sm"
                title="Pass Active (Tap to view details)"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] font-bold text-white">
                  {timeRemaining?.hours ? `${timeRemaining.hours}h left` : 'PASS ACTIVE'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenKeyGateway()}
                className="px-3.5 py-1.5 bg-[#FACC15] hover:bg-yellow-400 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 btn-click-effect shadow-md font-syne animate-pulse"
                title="Access Key Required - Complete Ad-Process to get Key"
              >
                <Key className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                <span>Get Key</span>
              </button>
            )}

            {/* Member Card or Join VIP */}
            {flopperUser ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-[#181824] to-cyan-500/10 hover:border-amber-400/50 border border-white/15 rounded-xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect shadow-sm group"
                title="Open Next Floppers Member Card"
              >
                <span className="text-base">{userAvatarObj?.icon || '👑'}</span>
                <span className="font-syne font-black text-white text-xs max-w-[80px] sm:max-w-[110px] truncate group-hover:text-amber-300">
                  {flopperUser.name.split(' ')[0]}
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-amber-400 font-bold">
                  {flopperUser.streakDays}d🔥
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden sm:flex px-3 sm:px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-bold transition-all items-center gap-1.5 btn-click-effect font-syne"
              >
                <Crown className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Join VIP</span>
              </button>
            )}

            {/* Mobile bookmark icon */}
            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('enrolled');
              }}
              className="lg:hidden text-stone-300 p-2 border border-white/10 rounded-xl hover:text-[#FACC15] transition-colors relative bg-[#14141a]"
              title="My Enrolled"
            >
              <Bookmark className="w-4 h-4" />
              {enrolledIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10B981] rounded-full" />
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* MAIN BODY */}
      <main className="flex-1 w-full max-w-[92rem] mx-auto px-4 sm:px-6 pt-5">
        
        {/* If Active Course is open, show Course Explorer */}
        {activeCourse ? (
          <CourseExplorer
            batch={activeCourse}
            onBack={() => setActiveCourse(null)}
            onPlayVideo={handlePlayMedia}
            onStartTest={handleStartTest}
            onRequireKey={handleOpenKeyGateway}
          />
        ) : (
          <div>
            {/* Flowy Controls & Flopper Identity Hub */}
            <FlowyControlsBanner
              user={flopperUser}
              currentTheme={currentTheme}
              currentFont={currentFont}
              isFlowFocusMode={isFlowFocusMode}
              onToggleFlowFocusMode={handleToggleFlowFocusMode}
              onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onQuickFilter={(cat) => {
                setCurrentTab('batches');
                setSelectedCategory(cat);
              }}
              onOpenKeyGateway={() => handleOpenKeyGateway()}
              totalBatchesCount={batches.length}
              enrolledCount={enrolledIds.length}
            />

            {/* Key Notification Banner if user has NO key */}
            {!hasValidKey && !isFloppyAdmin && (
              <div className="mb-5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#181822] to-amber-500/5 border border-[#FACC15]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FACC15]/20 border border-[#FACC15]/30 flex items-center justify-center shrink-0">
                    <Key className="w-5 h-5 text-[#FACC15]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white font-syne flex items-center gap-1.5">
                      <span>Pass Key Required for Video & PDF Playback</span>
                    </h4>
                    <p className="text-[11px] text-stone-400">
                      Complete a fast sponsored checkpoint (8s) to mint your 24-hour access pass, or enter floppyadmin code.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenKeyGateway()}
                  className="w-full sm:w-auto px-4 py-2 bg-[#FACC15] hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all btn-click-effect font-syne shrink-0 shadow-md"
                >
                  Get 24H Key Now
                </button>
              </div>
            )}

            {/* Focus Flow Mode Indicator */}
            {isFlowFocusMode && (
              <div className="mb-4 px-4 py-2 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs text-amber-300">
                <span className="flex items-center gap-2 font-bold">
                  <span>🧘 Flow Focus Mode Active</span>
                  <span className="text-stone-400 font-normal">| Distraction-free lecture stream</span>
                </span>
                <button
                  onClick={handleToggleFlowFocusMode}
                  className="text-stone-400 hover:text-white underline text-[11px]"
                >
                  Exit Focus Mode
                </button>
              </div>
            )}

            {/* Mobile/Tablet Sub Navbar Tabs */}
            <div className="flex lg:hidden items-center gap-1 overflow-x-auto hide-scroll p-1 bg-[#121217] rounded-xl border border-white/5 mb-4">
              <button
                onClick={() => setCurrentTab('batches')}
                className={`flex-1 min-w-[100px] text-center px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'batches' ? 'bg-[#FACC15] text-black font-extrabold' : 'text-stone-400'
                }`}
              >
                All Batches
              </button>
              <button
                onClick={() => setCurrentTab('enrolled')}
                className={`flex-1 min-w-[100px] text-center px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'enrolled' ? 'bg-[#FACC15] text-black font-extrabold' : 'text-stone-400'
                }`}
              >
                Enrolled ({enrolledIds.length})
              </button>
              <button
                onClick={() => setCurrentTab('curated')}
                className={`flex-1 min-w-[110px] text-center px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  currentTab === 'curated' ? 'bg-[#FACC15] text-black font-extrabold' : 'text-stone-400'
                }`}
              >
                Direct Lectures
              </button>
            </div>

            {/* Search Bar (Mobile & Tablet) */}
            <div className="xl:hidden relative w-full mb-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-stone-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches (10th, 9th, 12th, Commerce, Nirmaan)..."
                className="w-full bg-[#121217] border border-white/10 text-white text-xs sm:text-sm rounded-xl block pl-10 pr-10 py-2.5 transition-all placeholder:text-stone-500 focus:outline-none focus:border-[#FACC15]/60 focus:bg-[#161620]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Controls */}
            {currentTab !== 'curated' && (
              <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll pb-3 mb-5">
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all btn-click-effect ${
                      selectedCategory === cat
                        ? 'bg-[#FACC15] text-black font-bold shadow-md'
                        : 'bg-[#121217] text-stone-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Curated Direct Lectures */}
            {currentTab === 'curated' ? (
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white font-syne flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#FACC15]" />
                    <span>Curated Fast-Stream Lectures</span>
                  </h2>
                  <p className="text-xs text-stone-400">
                    Direct access to Chemical Reactions L2, L3, L4, Development, Real Numbers and English literature with auto-relocation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-16">
                  {CURATED_LECTURES.map((lec) => (
                    <LectureCard
                      key={lec.id}
                      lecture={lec}
                      onClick={handlePlayLecture}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* TAB CONTENT: Batches Grid */
              <div>
                {filteredBatches.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-[#121217]/50 border border-white/5 rounded-2xl">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-3">
                      <GraduationCap className="w-8 h-8 text-stone-600" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1 font-syne">No Batches Found</h3>
                    <p className="text-stone-400 text-xs max-w-sm mb-4">
                      {currentTab === 'enrolled'
                        ? 'You have not enrolled in any batches yet. Click ENROLL on any batch to save it here.'
                        : 'Try adjusting your search query or choosing another category filter.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-4 py-2 bg-[#FACC15] text-black font-bold rounded-lg text-xs"
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 pb-20">
                    {filteredBatches.map((b) => (
                      <BatchCard
                        key={b.id}
                        batch={b}
                        isEnrolled={enrolledIds.includes(String(b.id))}
                        onToggleEnroll={handleToggleEnroll}
                        onOpenStudy={(selectedBatch) => setActiveCourse(selectedBatch)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Key Verification & Ad Checkpoint Modal */}
      <KeyGatewayModal
        isOpen={isKeyGatewayOpen}
        onClose={() => setIsKeyGatewayOpen(false)}
        onKeyActivated={handleKeyActivated}
        requiredForTitle={keyGatewayReason}
      />

      {/* Video Modal (handles either activeMedia or selectedCuratedLecture) */}
      {(activeMedia || selectedCuratedLecture) && (
        <VideoModal
          lecture={selectedCuratedLecture}
          activeMedia={activeMedia}
          onClose={() => {
            setActiveMedia(null);
            setSelectedCuratedLecture(null);
          }}
          allLectures={CURATED_LECTURES}
          onLectureSelect={handlePlayLecture}
        />
      )}

      {/* CBT Assessment Modal */}
      {activeTest && (
        <CbtAssessmentModal
          testId={activeTest.id}
          testTitle={activeTest.title}
          onClose={() => setActiveTest(null)}
        />
      )}

      {/* Theme & Typography Customizer Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        currentFont={currentFont}
        onThemeChange={handleThemeChange}
        onFontChange={handleFontChange}
      />

      {/* Exclusive Flopper Society Login Modal */}
      <FlopperLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Flopper Member Profile & Notes Modal */}
      {flopperUser && (
        <FlopperProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={flopperUser}
          onUpdateUser={(updated) => {
            setFlopperUser(updated);
            saveActiveFlopper(updated);
          }}
          onLogout={handleLogout}
          onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
        />
      )}

      {/* Direct Key Info Modal */}
      {showKeyInfoModal && (
        <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl modal-glass">
            <button
              onClick={() => setShowKeyInfoModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] mb-4">
              <Zap className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white font-syne mb-1">
              {isFloppyAdmin ? '👑 FloppyAdmin Master Bypass' : 'Streaming Pass Status'}
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed">
              {isFloppyAdmin 
                ? 'Master access is permanently enabled. All ads and redirection checkpoints are bypassed.'
                : 'Your device is authenticated with active CloudFront video & PDF decryption.'}
            </p>

            <div className="bg-black/50 border border-white/10 rounded-xl p-3 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Active Key</span>
                <div className="font-mono text-xs text-[#10B981] font-bold truncate max-w-[200px]">
                  {activeKey || 'SB-AUTO-PASS'}
                </div>
              </div>
              <div className="px-2 py-1 rounded bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold">
                {isFloppyAdmin ? 'LIFETIME' : timeRemaining?.hours ? `${timeRemaining.hours}h left` : '24H PASS'}
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setShowKeyInfoModal(false);
                  handleOpenKeyGateway();
                }}
                className="w-full py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold text-xs rounded-xl transition-colors btn-click-effect shadow-md font-syne"
              >
                Mint Fresh Pass (Ad Checkpoint)
              </button>

              <button
                onClick={() => {
                  clearActiveKey();
                  setActiveKey('');
                  setHasValidKey(false);
                  setIsFloppyAdmin(false);
                  setShowKeyInfoModal(false);
                  showToast("Pass Removed. Key is now required.");
                }}
                className="w-full py-2 text-stone-400 hover:text-red-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Remove Key & Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 bg-[#0a0a0d] mt-auto">
        <div className="max-w-[92rem] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-syne">NEXT FLOPPERS</span>
            <span>• Free High-Quality Education Portal</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Theme: {activeThemeObj.name}</span>
            <span>•</span>
            <span>Typography: {currentFont.toUpperCase()}</span>
            <span>•</span>
            <button 
              onClick={() => setIsThemeModalOpen(true)}
              className="text-[#FACC15] hover:underline"
            >
              Customize Atmosphere
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
