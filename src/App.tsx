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
  RotateCcw,
  RefreshCw,
  Users,
  Radio
} from 'lucide-react';
import { BatchItem, Lecture, ThemeId, FlopperUser } from './types';
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
import { checkShouldPromptAutoUpdate, markAutoSyncPrompted } from './lib/serverSyncService';
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
import { AutoUpdateModal } from './components/AutoUpdateModal';
import { DualSystemUpdatePopup } from './components/DualSystemUpdatePopup';
import { CommunityHub } from './components/CommunityHub';
import { LiveClassesSection } from './components/LiveClassesSection';
import { LIVE_CLASSES, LiveClassItem } from './lib/liveClassesData';
import { 
  getStoredSyncedStreams, 
  DualSyncResult, 
  isEnforceDualCheckEnabled 
} from './lib/streamSyncService';
import { Logo } from './components/Logo';
import { 
  getInitialTheme, 
  applyTheme, 
  THEMES 
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
    category: 'Science'
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
  const [currentTab, setCurrentTab] = useState<'batches' | 'live' | 'enrolled' | 'community' | 'curated'>('batches');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Batches');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Dynamically synced live streams from CloudFront & StudyBeePro.site (never hardcoded)
  const [syncedLiveStreams, setSyncedLiveStreams] = useState<LiveClassItem[]>(getStoredSyncedStreams);
  const [isDualPopupOpen, setIsDualPopupOpen] = useState(false);

  // Active live broadcast count - strictly derived from verified uploads
  const liveBroadcastsCount = useMemo(() => {
    return syncedLiveStreams.filter(c => c.status === 'live').length;
  }, [syncedLiveStreams]);

  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('studybee_wishlist') || '[]').map(String);
    } catch {
      return [];
    }
  });

  // Theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(getInitialTheme);
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

  // CloudFront & Server Content Auto-Update state
  const [isAutoUpdateModalOpen, setIsAutoUpdateModalOpen] = useState(false);
  const [isAutoPrompt, setIsAutoPrompt] = useState(false);

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

  // Initialize theme and asynchronous background sync for GitHub Pages
  useEffect(() => {
    applyTheme(currentTheme);

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

    // Check if enforced dual update popup (CloudFront & StudyBeePro.site) should display on app launch
    const dualPrompted = sessionStorage.getItem('flopper_dual_sync_prompted');
    if (!dualPrompted && isEnforceDualCheckEnabled()) {
      sessionStorage.setItem('flopper_dual_sync_prompted', 'true');
      const timer = setTimeout(() => {
        setIsDualPopupOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (checkShouldPromptAutoUpdate()) {
      markAutoSyncPrompted();
      const timer = setTimeout(() => {
        setIsAutoPrompt(true);
        setIsAutoUpdateModalOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleDualSyncComplete = (res: DualSyncResult) => {
    setSyncedLiveStreams(res.syncedLiveStreams);
    fetchAllBatches(true).then((list) => {
      if (list && list.length > 0) {
        setBatches(list);
      }
    });
    if (res.hasNewStreams) {
      showToast(`⚡ Synced ${res.activeStreamsCount} live stream from CloudFront!`);
    } else {
      showToast("✓ CloudFront & StudyBee verified. Both systems synced.");
    }
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

  const handleContentUpdated = (batchesCount: number) => {
    fetchAllBatches(true).then((list) => {
      if (list && list.length > 0) {
        setBatches(list);
      }
    });
    showToast(`⚡ Synced ${batchesCount} batches & refreshed CloudFront streams!`);
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

  const handleAuthSuccess = (user: FlopperUser) => {
    setFlopperUser(user);
    if (user.theme) {
      setCurrentTheme(user.theme);
      applyTheme(user.theme);
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

          {/* Center Navigation Links (Nothing Segmented Navigation) */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-[#0a0a0f] rounded-2xl border border-white/10 font-doto uppercase">
            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('batches');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-2 px-4 py-2 rounded-xl btn-click-effect ${
                currentTab === 'batches' && !activeCourse 
                  ? 'bg-white text-black shadow-sm font-black' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Batches</span>
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('live');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-2 px-4 py-2 rounded-xl btn-click-effect ${
                currentTab === 'live' 
                  ? 'bg-white text-black shadow-sm font-black' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${currentTab === 'live' ? 'text-[#E60000]' : (liveBroadcastsCount > 0 ? 'text-red-500 animate-pulse' : 'text-neutral-400')}`} />
              <span>Live Schedule</span>
              {liveBroadcastsCount > 0 ? (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                  currentTab === 'live' ? 'bg-[#E60000] text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  {liveBroadcastsCount} LIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-white/10">
                  OFF-AIR
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('enrolled');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-2 px-4 py-2 rounded-xl btn-click-effect ${
                currentTab === 'enrolled' 
                  ? 'bg-white text-black shadow-sm font-black' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Enrolled</span>
              {enrolledIds.length > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${currentTab === 'enrolled' ? 'bg-[#E60000] text-white' : 'bg-white/15 text-white'}`}>
                  {enrolledIds.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('community');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-2 px-4 py-2 rounded-xl btn-click-effect ${
                currentTab === 'community' 
                  ? 'bg-white text-black shadow-sm font-black' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#E60000]" />
              <span>Community</span>
              <span className={`w-1.5 h-1.5 rounded-full ${currentTab === 'community' ? 'bg-black' : 'bg-[#E60000] animate-pulse'}`} />
            </button>

            <button
              onClick={() => {
                setActiveCourse(null);
                setCurrentTab('curated');
              }}
              className={`text-xs font-bold transition-all flex items-center gap-2 px-4 py-2 rounded-xl btn-click-effect ${
                currentTab === 'curated' 
                  ? 'bg-white text-black shadow-sm font-black' 
                  : 'text-neutral-400 hover:text-white'
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
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vault (/)..."
                className="w-full bg-[#0d0d12] border border-white/10 rounded-2xl pl-9 pr-7 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/30 transition-colors font-mono"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-500 border border-white/10 px-1.5 py-0.5 rounded-lg bg-black">
                  /
                </span>
              )}
            </div>

            {/* CloudFront CDN & Content Live Auto-Update Trigger */}
            <button
              onClick={() => setIsDualPopupOpen(true)}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect shadow-sm font-doto tracking-wider uppercase"
              title="Enforce updates checking both CloudFront and studybeepro.site"
            >
              <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
              <RefreshCw className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline text-[11px] text-white">DUAL SYNC</span>
            </button>

            {/* Atmosphere / Theme Trigger */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect shadow-sm font-doto uppercase"
              title="Customize Themes & Fonts"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-sm"
                style={{ backgroundColor: activeThemeObj.primaryColor }}
              />
              <Type className="w-3.5 h-3.5 text-neutral-400" />
              <span className="hidden sm:inline text-neutral-200 text-[11px]">ATMOS</span>
            </button>

            {/* Mandatory Key / FloppyAdmin Status Trigger */}
            {isFloppyAdmin ? (
              <button
                onClick={() => setShowKeyInfoModal(true)}
                className="flex px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-2xl text-xs font-bold transition-all items-center gap-1.5 btn-click-effect shadow-sm font-doto uppercase"
                title="FloppyAdmin Master Bypass Active (Unlimited)"
              >
                <span className="w-2 h-2 rounded-full bg-[#E60000]" />
                <span>ADMIN</span>
              </button>
            ) : hasValidKey ? (
              <button
                onClick={() => setShowKeyInfoModal(true)}
                className="hidden sm:flex px-3 py-2 bg-[#0c0c10] hover:bg-white/10 border border-white/15 text-white rounded-2xl text-xs font-bold transition-all items-center gap-2 btn-click-effect shadow-sm font-doto uppercase"
                title="Pass Active (Tap to view details)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-white">
                  {timeRemaining?.hours ? `${timeRemaining.hours}h left` : 'PASS ACTIVE'}
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenKeyGateway()}
                className="px-4 py-2 bg-[#E60000] hover:bg-red-600 text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 btn-click-effect shadow-[0_0_20px_rgba(230,0,0,0.4)] font-doto"
                title="Access Key Required - Complete Ad-Process to get Key"
              >
                <Key className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                <span>GET KEY</span>
              </button>
            )}

            {/* Member Card or Join VIP */}
            {flopperUser ? (
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/15 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect shadow-sm group font-doto uppercase"
                title="Open Next Floppers Member Card"
              >
                <span className="text-base">{userAvatarObj?.icon || '👑'}</span>
                <span className="font-bold text-white text-xs max-w-[80px] sm:max-w-[110px] truncate">
                  {flopperUser.name.split(' ')[0]}
                </span>
                <span className="hidden sm:inline font-mono text-[10px] text-[#E60000] font-bold">
                  {flopperUser.streakDays}d🔥
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="hidden sm:flex px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl text-xs font-bold transition-all items-center gap-1.5 btn-click-effect font-doto uppercase"
              >
                <Crown className="w-3.5 h-3.5 text-neutral-300" />
                <span>VIP</span>
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
              isFlowFocusMode={isFlowFocusMode}
              onToggleFlowFocusMode={handleToggleFlowFocusMode}
              onOpenThemeCustomizer={() => setIsThemeModalOpen(true)}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              onOpenProfileModal={() => setIsProfileModalOpen(true)}
              onQuickFilter={(cat) => {
                setCurrentTab('batches');
                setSelectedCategory(cat);
              }}
              onOpenCommunity={() => {
                setActiveCourse(null);
                setCurrentTab('community');
              }}
              onOpenLiveClasses={() => {
                setActiveCourse(null);
                setCurrentTab('live');
              }}
              onOpenKeyGateway={() => handleOpenKeyGateway()}
              onOpenAutoUpdateModal={() => {
                setIsAutoPrompt(false);
                setIsAutoUpdateModalOpen(true);
              }}
              onOpenDualUpdatePopup={() => setIsDualPopupOpen(true)}
              totalBatchesCount={batches.length}
              enrolledCount={enrolledIds.length}
            />

            {/* Key Notification Banner if user has NO key */}
            {!hasValidKey && !isFloppyAdmin && (
              <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-[#0a0a0e] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl nothing-dot-bg">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-[#E60000]">
                    <Key className="w-6 h-6 stroke-[2]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white font-doto uppercase tracking-wider flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
                      <span>PASS KEY REQUIRED FOR PLAYBACK</span>
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                      Complete a fast sponsored checkpoint (8s) to mint your 24-hour pass, or use floppyadmin master key.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenKeyGateway()}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#E60000] hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all btn-click-effect font-doto shrink-0 shadow-[0_0_20px_rgba(230,0,0,0.4)]"
                >
                  GET KEY (24H PASS)
                </button>
              </div>
            )}

            {/* Focus Flow Mode Indicator */}
            {isFlowFocusMode && (
              <div className="mb-5 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-neutral-200 font-doto">
                <span className="flex items-center gap-2.5 font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>FLOW FOCUS ACTIVE // MINIMALIST STUDY VIEW</span>
                </span>
                <button
                  onClick={handleToggleFlowFocusMode}
                  className="text-neutral-400 hover:text-white underline text-[11px] uppercase tracking-wider"
                >
                  [ EXIT FOCUS ]
                </button>
              </div>
            )}

            {/* Mobile/Tablet Sub Navbar Tabs */}
            <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto hide-scroll p-1.5 bg-[#0a0a0f] rounded-2xl border border-white/10 mb-5 font-doto uppercase text-xs">
              <button
                onClick={() => setCurrentTab('batches')}
                className={`flex-1 min-w-[95px] text-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'batches' ? 'bg-white text-black font-black shadow-sm' : 'text-neutral-400'
                }`}
              >
                All Batches
              </button>
              <button
                onClick={() => setCurrentTab('live')}
                className={`flex-1 min-w-[95px] text-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  currentTab === 'live' ? 'bg-white text-black font-black shadow-sm' : 'text-neutral-400'
                }`}
              >
                <Radio className={`w-3 h-3 ${liveBroadcastsCount > 0 ? 'text-[#E60000] animate-pulse' : 'text-neutral-500'}`} />
                <span>Live {liveBroadcastsCount > 0 ? `(${liveBroadcastsCount})` : '(Off-Air)'}</span>
              </button>
              <button
                onClick={() => setCurrentTab('enrolled')}
                className={`flex-1 min-w-[95px] text-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'enrolled' ? 'bg-white text-black font-black shadow-sm' : 'text-neutral-400'
                }`}
              >
                Enrolled ({enrolledIds.length})
              </button>
              <button
                onClick={() => setCurrentTab('community')}
                className={`flex-1 min-w-[105px] text-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'community' ? 'bg-white text-black font-black shadow-sm' : 'text-neutral-400'
                }`}
              >
                Community
              </button>
              <button
                onClick={() => setCurrentTab('curated')}
                className={`flex-1 min-w-[105px] text-center px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  currentTab === 'curated' ? 'bg-white text-black font-black shadow-sm' : 'text-neutral-400'
                }`}
              >
                Direct
              </button>
            </div>

            {/* Search Bar (Mobile & Tablet) */}
            <div className="xl:hidden relative w-full mb-5">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-neutral-500" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search batches (10th, 9th, 12th, Commerce, Nirmaan)..."
                className="w-full bg-[#0a0a0e] border border-white/10 text-white text-xs sm:text-sm rounded-2xl block pl-11 pr-10 py-3 transition-all placeholder:text-neutral-500 focus:outline-none focus:border-white/30 focus:bg-[#0f0f14] font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Controls */}
            {currentTab !== 'curated' && currentTab !== 'community' && currentTab !== 'live' && (
              <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-3.5 mb-6 font-doto uppercase">
                {CATEGORY_TABS.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all btn-click-effect tracking-wider ${
                      selectedCategory === cat
                        ? 'bg-white text-black shadow-md border border-white'
                        : 'bg-[#0a0a0e] text-neutral-400 hover:text-white border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Live Classes Broadcast Center */}
            {currentTab === 'live' ? (
              <LiveClassesSection
                onPlayLecture={handlePlayLecture}
                onOpenBatch={(bId) => {
                  const found = batches.find(b => b.id === bId || String(b.id) === String(bId));
                  if (found) {
                    setActiveCourse(found);
                  } else {
                    showToast('Module selected.');
                  }
                }}
                onShowToast={showToast}
                onOpenDualUpdatePopup={() => setIsDualPopupOpen(true)}
                syncedLiveStreams={syncedLiveStreams}
              />
            ) : currentTab === 'community' ? (
              <CommunityHub
                user={flopperUser}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
                onShowToast={showToast}
              />
            ) : currentTab === 'curated' ? (
              <div>
                <div className="mb-5 p-4 sm:p-5 rounded-3xl bg-[#0a0a0e] border border-white/10 nothing-dot-bg">
                  <h2 className="text-base sm:text-lg font-bold text-white font-doto uppercase tracking-wider flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
                    <span>CURATED DIRECT STREAM ARCHIVE</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1 font-sans">
                    Zero-redirect instant access to high-priority Science, Math, and English core lectures.
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
                  <div className="flex flex-col items-center justify-center py-20 text-center bg-[#0a0a0e] border border-white/10 rounded-3xl nothing-dot-bg p-6">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-4 text-[#E60000]">
                      <GraduationCap className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1 font-doto uppercase tracking-wider">
                      [ NO BATCHES MATCHED ]
                    </h3>
                    <p className="text-neutral-400 text-xs max-w-sm mb-5 font-sans leading-relaxed">
                      {currentTab === 'enrolled'
                        ? 'No saved modules in your vault. Click SAVE on any course to pin it here.'
                        : 'No results found for your query. Try clearing search filters.'}
                    </p>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="px-5 py-2.5 bg-white text-black font-doto font-bold rounded-2xl text-xs uppercase tracking-wider hover:bg-[#E60000] hover:text-white transition-all shadow-md"
                      >
                        RESET SEARCH
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

      {/* Theme Atmosphere Modal */}
      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onThemeChange={handleThemeChange}
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

      {/* CloudFront CDN & Content Live Auto-Update Modal */}
      <AutoUpdateModal
        isOpen={isAutoUpdateModalOpen}
        onClose={() => setIsAutoUpdateModalOpen(false)}
        onContentUpdated={handleContentUpdated}
        isAutoPrompt={isAutoPrompt}
      />

      {/* Small Popup Enforcing Dual System Updates (CloudFront & StudyBeePro.site) */}
      <DualSystemUpdatePopup
        isOpen={isDualPopupOpen}
        onClose={() => setIsDualPopupOpen(false)}
        onSyncComplete={handleDualSyncComplete}
        autoStartOnOpen={true}
      />

      {/* Footer */}
      <footer className="w-full border-t border-white/10 py-8 bg-[#050507] mt-auto font-doto uppercase">
        <div className="max-w-[92rem] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
            <span className="font-bold text-white tracking-wider">NEXT FLOPPERS (2.0)</span>
            <span className="text-neutral-600">/</span>
            <span className="font-mono text-neutral-400 text-[11px]">NOTHING OS EDUCATION VAULT</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>ATMOS: <strong className="text-white">{activeThemeObj.name}</strong></span>
            <span className="text-neutral-700">•</span>
            <span>NOTHING OS 3.0 MESH</span>
            <span className="text-neutral-700">•</span>
            <button 
              onClick={() => setIsThemeModalOpen(true)}
              className="text-[#E60000] hover:underline font-bold"
            >
              [ ATMOSPHERE ]
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
