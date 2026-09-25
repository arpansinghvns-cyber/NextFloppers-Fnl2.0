/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Sparkles, 
  Bookmark, 
  LayoutGrid, 
  Key, 
  X, 
  CheckCircle2, 
  ExternalLink,
  BookOpen,
  Folder,
  Layers,
  GraduationCap,
  Palette,
  Type,
  Crown,
  Flame,
  Zap,
  Maximize2,
  Minimize2,
  SlidersHorizontal
} from 'lucide-react';
import { BatchItem, Lecture, ThemeId, FontId, FlopperUser } from './types';
import { ALL_BATCHES } from './lib/batchesData';
import { fetchAllBatches, MediaResolutionResult, ensureActiveValidKey } from './lib/api';
import { BatchCard } from './components/BatchCard';
import { CourseExplorer } from './components/CourseExplorer';
import { VideoModal } from './components/VideoModal';
import { CbtAssessmentModal } from './components/CbtAssessmentModal';
import { LectureCard } from './components/LectureCard';
import { ThemeCustomizerModal } from './components/ThemeCustomizerModal';
import { FlopperLoginModal } from './components/FlopperLoginModal';
import { FlopperProfileModal } from './components/FlopperProfileModal';
import { FlowyControlsBanner } from './components/FlowyControlsBanner';
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

  // Key state & Toast
  const [activeKey, setActiveKey] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showKeyInfoModal, setShowKeyInfoModal] = useState(false);

  // Initialize theme, font, and batches
  useEffect(() => {
    applyTheme(currentTheme);
    applyFont(currentFont);

    async function loadData() {
      const key = await ensureActiveValidKey();
      setActiveKey(key);
      const list = await fetchAllBatches();
      if (list && list.length > 0) {
        setBatches(list);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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
    showToast(`Welcome back, ${user.name}! 👑 VIP Pass Active`);
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
      // Award XP to logged in member
      if (flopperUser) {
        const updated = addFlopperKarma(20);
        if (updated) setFlopperUser(updated);
      }
    }
    setEnrolledIds(nextList);
    localStorage.setItem('studybee_wishlist', JSON.stringify(nextList));
  };

  // Launch lecture with XP gain
  const handlePlayLecture = (lec: Lecture) => {
    setSelectedCuratedLecture(lec);
    if (flopperUser) {
      const updated = addFlopperKarma(5);
      if (updated) setFlopperUser(updated);
    }
  };

  // Launch video media with XP gain
  const handlePlayMedia = (media: MediaResolutionResult) => {
    setActiveMedia(media);
    if (flopperUser) {
      const updated = addFlopperKarma(5);
      if (updated) setFlopperUser(updated);
    }
  };

  // Launch CBT Assessment with XP gain
  const handleStartTest = (id: string, title: string) => {
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

  return (
    <div className="min-h-screen relative flex flex-col bg-[#070709] text-stone-200 flowy-mesh">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-5 py-3 rounded-full bg-black/90 border border-[#FACC15]/50 text-white text-xs font-bold shadow-2xl backdrop-blur-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#FACC15]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <nav className="w-full z-40 nav-glass h-[70px] sticky top-0 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-[92rem] mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-3 cursor-pointer btn-click-effect"
            onClick={() => {
              setActiveCourse(null);
              setCurrentTab('batches');
              setSelectedCategory('All Batches');
              setSearchQuery('');
            }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black border border-white/15 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-black/60">
              <img 
                src="https://i.ibb.co/yF4mhNPB/f493d534-fbf8-4b31-b741-83b343f8a9e1.jpg" 
                alt="Logo" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-wider text-white font-syne flex items-center gap-1.5">
                NEXT <span className="text-[#FACC15]">FLOPPERS</span>
              </h1>
              <span className="hidden sm:block text-[9px] uppercase font-bold tracking-widest text-stone-400">
                Education Redefined • All Batches
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('batches');
              }}
              className={`text-xs sm:text-sm font-bold transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl btn-click-effect ${
                currentTab === 'batches' && !activeCourse ? 'bg-white/10 text-[#FACC15]' : 'text-stone-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>All Batches</span>
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('enrolled');
              }}
              className={`text-xs sm:text-sm font-bold transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl btn-click-effect relative ${
                currentTab === 'enrolled' ? 'bg-white/10 text-[#FACC15]' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>My Enrolled</span>
              {enrolledIds.length > 0 && (
                <span className="bg-[#10B981] text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {enrolledIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('curated');
              }}
              className={`text-xs sm:text-sm font-bold transition-all flex items-center gap-2 px-3 py-1.5 rounded-xl btn-click-effect ${
                currentTab === 'curated' ? 'bg-white/10 text-[#FACC15]' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span>Direct Lectures</span>
            </button>
          </div>

          {/* Right Header Controls: Theme Customizer, Flopper Login / Profile & Pass */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme & Font Customizer Trigger Button */}
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
              <span className="hidden lg:inline text-stone-300 font-syne">Style</span>
            </button>

            {/* Direct 48H Pass Button */}
            <button
              onClick={() => setShowKeyInfoModal(true)}
              className="hidden sm:flex px-3 py-1.5 bg-[#14141a] hover:bg-white/10 border border-[#FACC15]/40 text-[#FACC15] rounded-xl text-xs font-bold transition-all items-center gap-1.5 btn-click-effect shadow-sm"
              title="Direct Pass Active"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] font-bold text-white">
                {activeKey ? activeKey.slice(0, 10) : 'VIP PASS'}
              </span>
            </button>

            {/* Exclusive Flopper Login / Member Pill */}
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
                className="px-3 sm:px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 btn-click-effect shadow-md font-syne"
              >
                <Crown className="w-3.5 h-3.5 fill-black" />
                <span>Join VIP</span>
              </button>
            )}

            {/* Mobile bookmark button */}
            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('enrolled');
              }}
              className="md:hidden text-stone-300 p-2 border border-white/10 rounded-xl hover:text-[#FACC15] transition-colors relative bg-white/5"
            >
              <Bookmark className="w-4 h-4" />
              {enrolledIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10B981] rounded-full"></span>
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
              totalBatchesCount={batches.length}
              enrolledCount={enrolledIds.length}
            />

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

            {/* Top Toolbar: Tabs, Categories & Search */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
              
              {/* Main Tabs (Latest Batches / My Enrolled / Direct Lectures) */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scroll w-full md:w-auto p-1 bg-[#121217] rounded-xl border border-white/5 shadow-inner">
                <button
                  onClick={() => setCurrentTab('batches')}
                  className={`shrink-0 px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    currentTab === 'batches'
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'bg-transparent text-stone-400 hover:text-white border-transparent'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Latest Batches</span>
                </button>

                <button
                  onClick={() => setCurrentTab('enrolled')}
                  className={`shrink-0 px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    currentTab === 'enrolled'
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'bg-transparent text-stone-400 hover:text-white border-transparent'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Enrolled</span>
                  <span className="bg-[#10B981] text-black text-[10px] font-black px-1.5 py-0.2 rounded">
                    {enrolledIds.length}
                  </span>
                </button>

                <button
                  onClick={() => setCurrentTab('curated')}
                  className={`shrink-0 px-3.5 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    currentTab === 'curated'
                      ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                      : 'bg-transparent text-stone-400 hover:text-white border-transparent'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Direct Lectures</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-[380px]">
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
            </div>

            {/* Category Filter Pills (When on batches or enrolled tabs) */}
            {currentTab !== 'curated' && (
              <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-4 mb-4">
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all btn-click-effect ${
                      selectedCategory === cat
                        ? 'bg-[#FACC15] text-black font-bold shadow-md'
                        : 'bg-[#14141a] text-stone-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Curated Quick Lectures */}
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
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-white/10 w-full max-w-md rounded-2xl p-6 relative shadow-2xl modal-glass">
            <button
              onClick={() => setShowKeyInfoModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] mb-4">
              <Key className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white font-syne mb-1">
              Direct Streaming Pass Active
            </h3>
            <p className="text-xs text-stone-400 mb-5 leading-relaxed">
              Your device is pre-authorized with direct CloudFront decryption. All lectures and PDFs play without login barriers!
            </p>

            <div className="bg-black/50 border border-white/10 rounded-xl p-3 mb-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider">Your Active Key</span>
                <div className="font-mono text-xs text-[#10B981] font-bold">{activeKey}</div>
              </div>
              <div className="px-2 py-1 rounded bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold">
                UNLIMITED
              </div>
            </div>

            <button
              onClick={() => {
                const newKey = 'NF-' + Math.random().toString(36).substring(2, 7).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
                localStorage.setItem('studybee_premium_key', newKey);
                setActiveKey(newKey);
                showToast("New Pass Key Activated!");
                setShowKeyInfoModal(false);
              }}
              className="w-full py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-black font-bold text-xs rounded-xl transition-colors btn-click-effect shadow-md font-syne"
            >
              Regenerate Fresh Pass
            </button>
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
              className="text-amber-400 hover:underline"
            >
              Customize Atmosphere
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
