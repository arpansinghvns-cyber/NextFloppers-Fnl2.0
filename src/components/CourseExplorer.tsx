import React, { useState, useEffect, useMemo } from 'react';
import { BatchItem, ContentItem, CourseOverviewData } from '../types';
import { 
  fetchCourseOverview, 
  fetchFolderContent, 
  resolveMediaContent, 
  MediaResolutionResult 
} from '../lib/api';
import { 
  ArrowLeft, 
  Home, 
  ChevronRight, 
  Folder, 
  FileText, 
  Play, 
  Loader2, 
  FolderOpen, 
  Clock, 
  FileCode2, 
  ExternalLink,
  BookOpen,
  Info,
  Download,
  Zap,
  Eye,
  Search,
  X,
  Filter,
  Layers,
  Sparkles,
  Key
} from 'lucide-react';

import { 
  hasActiveKey, 
  isFloppyAdminUser, 
  getActiveKey 
} from '../lib/keyService';

interface FolderStep {
  id: string;
  title: string;
}

interface CourseExplorerProps {
  batch: BatchItem;
  onBack: () => void;
  onPlayVideo: (media: MediaResolutionResult) => void;
  onStartTest: (testId: string, testTitle: string) => void;
  onRequireKey: (title?: string) => void;
}

export const CourseExplorer: React.FC<CourseExplorerProps> = ({
  batch,
  onBack,
  onPlayVideo,
  onStartTest,
  onRequireKey,
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'overview'>('content');
  const [overview, setOverview] = useState<CourseOverviewData | null>(null);
  const [folderHistory, setFolderHistory] = useState<FolderStep[]>([
    { id: '0', title: 'Course Content' },
  ]);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingMediaId, setResolvingMediaId] = useState<string | null>(null);
  const [pdfModalData, setPdfModalData] = useState<{ title: string; url: string } | null>(null);
  const [useGooglePdfFallback, setUseGooglePdfFallback] = useState(false);
  
  // In-Course Search & Type Filter
  const [inCourseSearch, setInCourseSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'folders' | 'videos' | 'pdfs' | 'tests'>('all');

  // Load Overview & Initial Folder
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [ovData, folderData] = await Promise.all([
          fetchCourseOverview(batch.id),
          fetchFolderContent(batch.id, '0')
        ]);
        if (isMounted) {
          setOverview(ovData);
          setItems(folderData);
        }
      } catch (e) {
        console.error("Error loading course initial data:", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [batch.id]);

  // Navigate into a folder
  const handleOpenFolder = async (folderId: string, folderTitle: string) => {
    setLoading(true);
    setInCourseSearch(''); // reset search on entering folder
    const existingIndex = folderHistory.findIndex(f => f.id === folderId);
    let nextHistory: FolderStep[];
    if (existingIndex > -1) {
      nextHistory = folderHistory.slice(0, existingIndex + 1);
    } else {
      nextHistory = [...folderHistory, { id: folderId, title: folderTitle }];
    }
    setFolderHistory(nextHistory);

    try {
      const folderData = await fetchFolderContent(batch.id, folderId);
      setItems(folderData);
    } catch (e) {
      console.error("Error loading folder:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleBreadcrumbClick = (stepIndex: number) => {
    const step = folderHistory[stepIndex];
    handleOpenFolder(step.id, step.title);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
  };

  // Filter items in real time
  const filteredItems = useMemo(() => {
    let res = items;

    if (typeFilter !== 'all') {
      if (typeFilter === 'folders') {
        res = res.filter(i => i.type === 'folder');
      } else if (typeFilter === 'videos') {
        res = res.filter(i => i.type === 'file' && i.data?.file_type !== 1);
      } else if (typeFilter === 'pdfs') {
        res = res.filter(i => i.type === 'file' && i.data?.file_type === 1);
      } else if (typeFilter === 'tests') {
        res = res.filter(i => i.type === 'test');
      }
    }

    if (inCourseSearch.trim()) {
      const q = inCourseSearch.toLowerCase().trim();
      res = res.filter(i => i.title.toLowerCase().includes(q));
    }

    return res;
  }, [items, typeFilter, inCourseSearch]);

  // Click file (video or pdf) - Key check enforced
  const handleItemClick = async (item: ContentItem) => {
    if (item.type === 'folder') {
      handleOpenFolder(item.entity_id, item.title);
      return;
    }

    // Require Key for Tests
    if (item.type === 'test') {
      if (!hasActiveKey() && !isFloppyAdminUser()) {
        onRequireKey(item.title);
        return;
      }
      onStartTest(item.entity_id, item.title);
      return;
    }

    if (item.type === 'file') {
      // Require Key for Videos & PDFs
      if (!hasActiveKey() && !isFloppyAdminUser()) {
        onRequireKey(item.title);
        return;
      }

      const fileType = item.data?.file_type;
      const isPdf = fileType === 1;

      setResolvingMediaId(item.entity_id);

      try {
        const media = await resolveMediaContent(batch.id, item);

        if (media) {
          if (media.requiresKey) {
            onRequireKey(item.title);
            return;
          }

          if (isPdf || media.type === 'pdf') {
            setUseGooglePdfFallback(false);
            setPdfModalData({ title: media.title, url: media.url });
          } else {
            onPlayVideo(media);
          }
        } else {
          // If direct dynamic_link or fallback exists
          const fallbackUrl = item.data?.file_url || item.data?.dynamic_link;
          if (fallbackUrl) {
            if (isPdf) {
              setPdfModalData({ title: item.title, url: fallbackUrl });
            } else {
              window.open(fallbackUrl, '_blank');
            }
          }
        }
      } catch (e) {
        console.error("Error resolving content:", e);
      } finally {
        setResolvingMediaId(null);
      }
    }
  };

  return (
    <div className="w-full max-w-[92rem] mx-auto px-4 sm:px-6 pt-4 pb-20">
      
      {/* Top Header / Navigation */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-[#121217] hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all btn-click-effect flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#FACC15]" />
          <span>Back to All Batches</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          {isFloppyAdminUser() ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 font-bold">
              <span>👑 FloppyAdmin Master Bypass</span>
            </span>
          ) : hasActiveKey() ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Pass Active ({getActiveKey()?.slice(0, 10)})</span>
            </span>
          ) : (
            <button
              onClick={() => onRequireKey(batch.title)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FACC15]/15 hover:bg-[#FACC15]/25 border border-[#FACC15]/40 text-[#FACC15] font-bold transition-all btn-click-effect shadow-sm"
            >
              <Key className="w-3.5 h-3.5" />
              <span>🔑 Key Required (Tap to Unlock)</span>
            </button>
          )}
        </div>
      </div>

      {/* Batch Hero Banner Card */}
      <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-7 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 shadow-xl">
        <div className="w-full md:w-64 h-36 sm:h-40 shrink-0 rounded-xl overflow-hidden bg-black/80 border border-white/10 relative group">
          <img
            src={batch.thumbnail}
            alt={batch.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-sm border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-extrabold text-emerald-400">
            UNLOCKED
          </div>
        </div>

        <div className="flex-1 w-full flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
            <span className="text-[#FACC15] font-semibold">{batch.category || "Next Toppers Curriculum"}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-stone-500">Batch #{batch.id}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-white font-syne mb-2 leading-snug">
            {batch.title}
          </h1>

          <p className="text-stone-400 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            Full curriculum unlocked with zero login barrier. Browse live and recorded sessions, chapter PDFs, and CBT tests.
          </p>

          {/* Tab Controls (Segmented Control) */}
          <div className="flex items-center gap-2 pt-3 border-t border-white/5">
            <button
              onClick={() => setActiveTab('content')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect ${
                activeTab === 'content'
                  ? 'bg-[#FACC15] text-black shadow-md'
                  : 'bg-white/5 text-stone-400 hover:text-white border border-white/5'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Browse Curriculum Content</span>
            </button>

            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 btn-click-effect ${
                activeTab === 'overview'
                  ? 'bg-[#FACC15] text-black shadow-md'
                  : 'bg-white/5 text-stone-400 hover:text-white border border-white/5'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Syllabus & Overview</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 sm:p-8 mb-10">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2 font-syne">
            <BookOpen className="w-5 h-5 text-[#FACC15]" />
            About this Batch & Syllabus
          </h2>
          <div
            className="prose prose-invert max-w-none text-stone-300 text-sm leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{
              __html: overview?.description || `<p>${batch.title} complete educational batch curriculum, interactive classes and study materials.</p>`
            }}
          />
        </div>
      )}

      {/* CONTENT TAB */}
      {activeTab === 'content' && (
        <div>
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll py-2 px-3 bg-[#111116] border border-white/10 rounded-xl mb-4 text-xs">
            {folderHistory.map((folder, index) => {
              const isLast = index === folderHistory.length - 1;
              const isFirst = index === 0;

              return (
                <div key={folder.id} className="flex items-center shrink-0">
                  <button
                    onClick={() => handleBreadcrumbClick(index)}
                    disabled={isLast}
                    className={`flex items-center gap-1.5 transition-colors font-semibold ${
                      isLast
                        ? 'text-white font-bold cursor-default'
                        : 'text-stone-400 hover:text-[#FACC15] cursor-pointer'
                    }`}
                  >
                    {isFirst && <Home className="w-3.5 h-3.5 text-[#FACC15]" />}
                    <span>{folder.title}</span>
                  </button>
                  {!isLast && (
                    <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-stone-600 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>

          {/* In-Course Toolbar: Fast Search & Type Filter Tabs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-[#111116]/80 p-2.5 rounded-xl border border-white/5">
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={inCourseSearch}
                onChange={(e) => setInCourseSearch(e.target.value)}
                placeholder="Search lectures, notes, DPPs, chapters..."
                className="w-full bg-[#16161d] border border-white/10 rounded-lg pl-9 pr-8 py-1.5 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-[#FACC15]/60 transition-colors"
              />
              {inCourseSearch && (
                <button
                  onClick={() => setInCourseSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Type Filter Buttons */}
            <div className="flex items-center gap-1 overflow-x-auto hide-scroll text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                  typeFilter === 'all'
                    ? 'bg-[#FACC15] text-black'
                    : 'bg-white/5 text-stone-400 hover:text-white'
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setTypeFilter('folders')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                  typeFilter === 'folders'
                    ? 'bg-[#FACC15] text-black'
                    : 'bg-white/5 text-stone-400 hover:text-white'
                }`}
              >
                Folders
              </button>
              <button
                onClick={() => setTypeFilter('videos')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                  typeFilter === 'videos'
                    ? 'bg-[#FACC15] text-black'
                    : 'bg-white/5 text-stone-400 hover:text-white'
                }`}
              >
                Lectures
              </button>
              <button
                onClick={() => setTypeFilter('pdfs')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                  typeFilter === 'pdfs'
                    ? 'bg-[#FACC15] text-black'
                    : 'bg-white/5 text-stone-400 hover:text-white'
                }`}
              >
                PDFs / Notes
              </button>
              <button
                onClick={() => setTypeFilter('tests')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0 ${
                  typeFilter === 'tests'
                    ? 'bg-[#FACC15] text-black'
                    : 'bg-white/5 text-stone-400 hover:text-white'
                }`}
              >
                CBT Tests
              </button>
            </div>
          </div>

          {/* Loader Skeleton Cards */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[#111116] border border-white/5 rounded-2xl h-[220px] p-4 flex flex-col justify-between animate-pulse">
                  <div className="h-[120px] bg-white/5 rounded-xl w-full" />
                  <div className="h-4 bg-white/10 rounded w-3/4 mt-3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-[#111116]/50 border border-white/5 rounded-2xl">
              <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mb-3">
                <FolderOpen className="w-7 h-7 text-stone-500" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                {inCourseSearch ? 'No Matching Items Found' : 'Folder is Empty'}
              </h3>
              <p className="text-stone-400 text-xs max-w-sm mb-4">
                {inCourseSearch 
                  ? `No lectures or notes match "${inCourseSearch}". Try clearing your search.` 
                  : 'No subfolders or lectures found in this section.'}
              </p>
              {inCourseSearch ? (
                <button
                  onClick={() => setInCourseSearch('')}
                  className="px-4 py-2 bg-[#FACC15] text-black rounded-lg text-xs font-bold"
                >
                  Clear Search
                </button>
              ) : folderHistory.length > 1 ? (
                <button
                  onClick={() => handleBreadcrumbClick(folderHistory.length - 2)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
                >
                  Go to Previous Folder
                </button>
              ) : null}
            </div>
          )}

          {/* Content Grid */}
          {!loading && filteredItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredItems.map((item, idx) => {
                // Folder Item
                if (item.type === 'folder') {
                  const counts = item.data?.content_counts || {};
                  const fCount = counts.folders?.total || 0;
                  const vCount = (counts.video?.paid || 0) + (counts.video?.free || 0);
                  const pCount = (counts.pdf?.paid || 0) + (counts.pdf?.free || 0);
                  const tCount = (counts.test?.paid || 0) + (counts.test?.free || 0);

                  const metaParts: string[] = [];
                  if (fCount > 0) metaParts.push(`${fCount} folders`);
                  if (vCount > 0) metaParts.push(`${vCount} videos`);
                  if (pCount > 0) metaParts.push(`${pCount} PDFs`);
                  if (tCount > 0) metaParts.push(`${tCount} tests`);

                  return (
                    <div
                      key={item.entity_id || idx}
                      onClick={() => handleOpenFolder(item.entity_id, item.title)}
                      className="premium-card rounded-2xl cursor-pointer group flex flex-col overflow-hidden h-[230px] btn-click-effect border border-white/5 hover:border-[#FACC15]/40"
                    >
                      <div className="h-[135px] w-full relative overflow-hidden bg-[#14141a] border-b border-white/5 flex items-center justify-center">
                        {item.data?.thumbnail ? (
                          <img
                            src={item.data.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <Folder className="w-12 h-12 text-[#FACC15] drop-shadow-[0_0_15px_rgba(250,204,21,0.35)]" />
                          </div>
                        )}
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between bg-[#111116] group-hover:bg-[#15151c] transition-colors">
                        <h3 className="text-white font-semibold text-xs leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                        {/* Clean unboxed metadata separator */}
                        <div className="text-[10px] text-stone-400 font-medium">
                          {metaParts.length > 0 ? metaParts.join(' · ') : 'Open folder'}
                        </div>
                      </div>
                    </div>
                  );
                }

                // File Item (Video or PDF)
                if (item.type === 'file') {
                  const fileType = item.data?.file_type;
                  const isPdf = fileType === 1;
                  const isResolving = resolvingMediaId === item.entity_id;

                  // Video File
                  if (!isPdf) {
                    const durationText = formatDuration(item.data?.duration);
                    const isLive = item.data?.is_live === 1;
                    const isYouTube = item.data?.video_type === 1;

                    return (
                      <div
                        key={item.entity_id || idx}
                        onClick={() => handleItemClick(item)}
                        className="premium-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-[230px] btn-click-effect border border-white/5 hover:border-[#FACC15]/40 relative"
                      >
                        <div className="relative h-[135px] w-full bg-black overflow-hidden border-b border-white/5">
                          <img
                            src={
                              item.data?.thumbnail ||
                              "https://decicqog4ulhy.cloudfront.net/0/admin_v2/uploads/courses/thumbnail/2671188_1_logo.jpg"
                            }
                            alt={item.title}
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                          />

                          {/* Kicker badge */}
                          <div className="absolute top-2 left-2">
                            {isYouTube ? (
                              <span className="bg-red-500/80 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow">
                                YOUTUBE
                              </span>
                            ) : isLive ? (
                              <span className="bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow animate-pulse">
                                LIVE
                              </span>
                            ) : (
                              <span className="bg-black/70 backdrop-blur-sm text-[#FACC15] text-[9px] font-bold px-2 py-0.5 rounded border border-[#FACC15]/30">
                                VIDEO
                              </span>
                            )}
                          </div>

                          {/* Duration */}
                          {durationText && (
                            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono text-white">
                              {durationText}
                            </div>
                          )}

                          {/* Play overlay button */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-10 h-10 bg-[#FACC15] rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                              {isResolving ? (
                                <Loader2 className="w-5 h-5 text-black animate-spin" />
                              ) : (
                                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-3.5 flex-1 flex flex-col justify-between bg-[#111116] group-hover:bg-[#15151c] transition-colors">
                          <h3 className="text-stone-200 font-semibold text-xs leading-snug line-clamp-2 group-hover:text-white">
                            {item.title}
                          </h3>
                          <div className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-500" />
                            <span>{durationText || 'Lecture'}</span>
                            <span aria-hidden="true">·</span>
                            <span>Direct CDN</span>
                            {isResolving && <span className="text-[#FACC15] font-bold ml-auto animate-pulse">Decrypting...</span>}
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // PDF File Card
                  return (
                    <div
                      key={item.entity_id || idx}
                      onClick={() => handleItemClick(item)}
                      className="premium-card rounded-2xl overflow-hidden cursor-pointer group flex flex-col h-[230px] btn-click-effect border border-white/5 hover:border-red-500/40 relative"
                    >
                      <div className="relative h-[135px] w-full bg-[#16161c] flex items-center justify-center border-b border-white/5">
                        {isResolving ? (
                          <Loader2 className="w-10 h-10 text-red-400 animate-spin" />
                        ) : (
                          <FileText className="w-12 h-12 text-red-400 group-hover:scale-110 transition-transform" />
                        )}
                        <div className="absolute top-2 left-2">
                          <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-bold px-2 py-0.5 rounded">
                            PDF NOTES
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 flex-1 flex flex-col justify-between bg-[#111116] group-hover:bg-[#15151c] transition-colors">
                        <h3 className="text-stone-200 font-semibold text-xs leading-snug line-clamp-2 group-hover:text-white">
                          {item.title}
                        </h3>
                        <div className="text-[10px] text-red-400 font-bold tracking-wider flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{isResolving ? 'OPENING PDF...' : 'TAP TO VIEW PDF'}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Test Item
                if (item.type === 'test') {
                  return (
                    <div
                      key={item.entity_id || idx}
                      className="col-span-full premium-card rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-white/5 hover:border-[#FACC15]/40"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                          <FileCode2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1 text-xs text-indigo-400 font-semibold">
                            <span>CBT Assessment</span>
                            <span aria-hidden="true">·</span>
                            <span>No Login Barrier</span>
                          </div>
                          <h3 className="text-white font-bold text-sm leading-snug">
                            {item.title}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() => onStartTest(item.entity_id, item.title)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#FACC15] hover:bg-yellow-400 text-black transition-all btn-click-effect shadow-md font-syne shrink-0"
                      >
                        Start Assessment
                      </button>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}

      {/* PDF Modal Viewer - Zero Login */}
      {pdfModalData && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-[#111116] border border-white/10 w-full max-w-5xl h-[90vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#16161d]">
              <div className="flex items-center gap-2.5 truncate max-w-lg">
                <FileText className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-white font-bold text-sm truncate">{pdfModalData.title}</span>
                <span className="text-emerald-400 text-xs font-bold">· Free</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  onClick={() => setUseGooglePdfFallback(prev => !prev)}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-stone-300 rounded-lg hidden sm:flex items-center gap-1"
                  title="Toggle Viewer Engine"
                >
                  <Eye className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>{useGooglePdfFallback ? 'Direct Embed' : 'Google Viewer'}</span>
                </button>

                <a
                  href={pdfModalData.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#FACC15] hover:bg-yellow-400 text-black rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md btn-click-effect font-syne"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download PDF</span>
                </a>

                <a
                  href={pdfModalData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white rounded-lg"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setPdfModalData(null)}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Modal Body / PDF Frame */}
            <div className="flex-1 w-full bg-[#18181b] relative">
              <iframe
                src={
                  useGooglePdfFallback
                    ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfModalData.url)}&embedded=true`
                    : pdfModalData.url
                }
                title={pdfModalData.title}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseExplorer;
