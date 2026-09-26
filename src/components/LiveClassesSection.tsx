import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Clock, 
  Calendar, 
  Bell, 
  BellRing, 
  Search, 
  X, 
  BookOpen, 
  Tv, 
  CheckCircle2, 
  FolderOpen,
  ArrowRight,
  Info,
  RefreshCw,
  Server
} from 'lucide-react';
import { LIVE_CLASSES, LiveClassItem, TIMETABLE_SLOTS, WEEK_DAYS, convertLiveToLecture } from '../lib/liveClassesData';
import { fetchLiveStreamsFromBatchFolders, endLiveStream, isStreamEnded } from '../lib/streamSyncService';
import { Lecture } from '../types';

interface LiveClassesSectionProps {
  onPlayLecture: (lecture: Lecture) => void;
  onOpenBatch?: (batchId: number | string) => void;
  onShowToast: (msg: string) => void;
  onOpenDualUpdatePopup?: () => void;
  syncedLiveStreams?: LiveClassItem[];
}

const CATEGORY_FILTERS = [
  "Today's Schedule",
  'Class 12th',
  'Class 11th',
  'Class 10th',
  'Class 9th',
  'Class 8th',
  'Class 7th',
  '5:00 PM Slot',
  '8:00 PM Slot',
  'Science',
  'Maths',
  'SST',
  'Full Weekly Matrix'
];

export type GradeTab = 'All' | 'Class 12th' | 'Class 11th' | 'Class 10th' | 'Class 9th' | 'Class 8th' | 'Class 7th';
export const ALL_GRADE_TABS: GradeTab[] = ['All', 'Class 12th', 'Class 11th', 'Class 10th', 'Class 9th', 'Class 8th', 'Class 7th'];

export const LiveClassesSection: React.FC<LiveClassesSectionProps> = ({
  onPlayLecture,
  onOpenBatch,
  onShowToast,
  onOpenDualUpdatePopup,
  syncedLiveStreams = []
}) => {
  const [selectedFilter, setSelectedFilter] = useState("Today's Schedule");
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState<typeof WEEK_DAYS[number]>('Monday');
  const [selectedGradeTab, setSelectedGradeTab] = useState<GradeTab>('All');
  const [isScanning, setIsScanning] = useState(false);

  const handleScanBatches = async () => {
    if (onOpenDualUpdatePopup) {
      onOpenDualUpdatePopup();
      return;
    }
    setIsScanning(true);
    onShowToast("Scanning batches for active live lectures...");
    try {
      await fetchLiveStreamsFromBatchFolders();
      onShowToast("Batches scanned! Stream list updated.");
    } catch {
      onShowToast("Scan complete.");
    } finally {
      setIsScanning(false);
    }
  };
  
  const [reminders, setReminders] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('ntflopper_live_reminders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const toggleReminder = (id: string, title: string, time: string) => {
    let next: string[];
    if (reminders.includes(id)) {
      next = reminders.filter(rId => rId !== id);
      onShowToast(`Reminder turned off for ${title.slice(0, 22)}...`);
    } else {
      next = [...reminders, id];
      onShowToast(`🔔 Reminder set! We will alert you before ${time}`);
    }
    setReminders(next);
    try {
      localStorage.setItem('ntflopper_live_reminders', JSON.stringify(next));
    } catch {}
  };

  const handleEndStream = (e: React.MouseEvent, streamId: string, title: string) => {
    e.stopPropagation();
    endLiveStream(streamId);
    onShowToast(`🔴 Ended "${title.slice(0, 22)}...". Removed from Live list.`);
  };

  // Merge synced live streams (fetched from batch folders) at the top of the schedule
  const allClasses = useMemo(() => {
    const seenIds = new Set<string>();
    const result: LiveClassItem[] = [];
    
    // Active live streams always take top priority if not ended
    syncedLiveStreams.forEach(item => {
      if (!isStreamEnded(item.id)) {
        seenIds.add(item.id);
        result.push(item);
      }
    });

    LIVE_CLASSES.forEach(item => {
      if (!seenIds.has(item.id) && !isStreamEnded(item.id)) {
        result.push(item);
      }
    });

    return result;
  }, [syncedLiveStreams]);

  // Filtered Items
  const filteredList = useMemo(() => {
    return allClasses.filter(item => {
      // Grade tab
      if (selectedGradeTab !== 'All' && item.grade !== selectedGradeTab) {
        return false;
      }

      // Search Query
      const matchSearch = searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      // Active live streams always appear in Today's Schedule and their respective grade/subject tabs
      if (item.status === 'live') {
        if (selectedFilter === "Today's Schedule") return true;
        if (selectedFilter === 'Class 12th') return item.grade === 'Class 12th';
        if (selectedFilter === 'Class 11th') return item.grade === 'Class 11th';
        if (selectedFilter === 'Class 10th') return item.grade === 'Class 10th';
        if (selectedFilter === 'Class 9th') return item.grade === 'Class 9th';
        if (selectedFilter === 'Class 8th') return item.grade === 'Class 8th';
        if (selectedFilter === 'Class 7th') return item.grade === 'Class 7th';
        if (selectedFilter === '5:00 PM Slot') return item.timeSlot === '5:00 PM';
        if (selectedFilter === '8:00 PM Slot') return item.timeSlot === '8:00 PM';
        if (selectedFilter === 'Science') return item.subject === 'Science';
        if (selectedFilter === 'Maths') return item.subject === 'Maths';
        if (selectedFilter === 'SST') return item.subject === 'SST';
        return true;
      }

      // Filter Tabs for scheduled items
      if (selectedFilter === "Today's Schedule") {
        return item.scheduledTime.startsWith('Today') || item.dayOfWeek === 'Monday';
      }
      if (selectedFilter === 'Class 12th') return item.grade === 'Class 12th';
      if (selectedFilter === 'Class 11th') return item.grade === 'Class 11th';
      if (selectedFilter === 'Class 10th') return item.grade === 'Class 10th';
      if (selectedFilter === 'Class 9th') return item.grade === 'Class 9th';
      if (selectedFilter === 'Class 8th') return item.grade === 'Class 8th';
      if (selectedFilter === 'Class 7th') return item.grade === 'Class 7th';
      if (selectedFilter === '5:00 PM Slot') {
        return item.timeSlot === '5:00 PM';
      }
      if (selectedFilter === '8:00 PM Slot') {
        return item.timeSlot === '8:00 PM';
      }
      if (selectedFilter === 'Science') {
        return item.subject === 'Science';
      }
      if (selectedFilter === 'Maths') {
        return item.subject === 'Maths';
      }
      if (selectedFilter === 'SST') {
        return item.subject === 'SST';
      }
      return true;
    });
  }, [allClasses, selectedFilter, searchQuery, selectedGradeTab]);

  // Next upcoming or active live class for spotlight
  const nextUpClass = useMemo(() => {
    if (syncedLiveStreams.length > 0) {
      return syncedLiveStreams[0]; // Active live stream (e.g. Our Environment - L3 from Science folder)
    }
    return allClasses[0] || null;
  }, [syncedLiveStreams, allClasses]);

  return (
    <div className="space-y-7 animate-fade-in font-sans">
      {/* Top Telemetry & Status Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#09090d] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 nothing-dot-bg">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-amber-400 relative">
            <Radio className="w-6 h-6 text-neutral-400" />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${syncedLiveStreams.length > 0 ? 'bg-red-500 animate-ping' : 'bg-amber-400'} ring-4 ring-black`} />
          </div>
          <div>
            <div className="flex items-center gap-2 font-doto uppercase">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wider">
                LIVE CLASSES & TIMETABLE
              </h2>
              {syncedLiveStreams.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#E60000] text-white animate-pulse shadow-[0_0_12px_#E60000]">
                  {syncedLiveStreams.length} STREAM LIVE NOW IN BATCHES
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-white/10">
                  OFF-AIR • PARITY CONFIRMED
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5 font-sans">
              {syncedLiveStreams.length > 0
                ? `Active broadcast in batch folder: "${syncedLiveStreams[0].title}" • Click Watch Live to stream immediately.`
                : 'No stream currently on air. Live classes broadcast at 5:00 PM and 8:00 PM Monday–Saturday.'}
            </p>
          </div>
        </div>

        {/* Real Slot Badges & Database Update Enforcer Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-black/60 px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              <span className="text-white font-bold">5:00 PM</span>
              <span className="text-[10px] text-neutral-500">&</span>
              <span className="text-white font-bold">8:00 PM</span>
              <span className="text-[10px] text-neutral-400 ml-1">SLOTS</span>
            </div>
          </div>

          {onOpenDualUpdatePopup && (
            <button
              onClick={onOpenDualUpdatePopup}
              className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-mono font-bold transition-all flex items-center gap-2 btn-click-effect shadow-sm"
              title="Update Next Toppers live and upcoming classes database"
            >
              <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
              <RefreshCw className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline">UPDATE:</span>
              <span>LIVE DATABASE</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Live Streams from Batch Folders */}
      {syncedLiveStreams.length > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-red-950/20 border border-red-500/40 space-y-4 shadow-[0_0_40px_rgba(230,0,0,0.15)] nothing-dot-bg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <h3 className="font-doto font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center gap-2">
                <span>ACTIVE LIVE STREAMS</span>
                <span className="text-[#E60000] text-xs">[FROM BATCH FOLDERS]</span>
              </h3>
            </div>
            <span className="text-xs font-mono text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20 w-fit">
              {syncedLiveStreams.length} BROADCAST ACTIVE
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {syncedLiveStreams.map((stream) => (
              <div
                key={stream.id}
                className="p-4 rounded-2xl bg-black/85 border border-white/15 hover:border-red-500/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group shadow-xl"
              >
                <div 
                  onClick={() => onPlayLecture(convertLiveToLecture(stream))}
                  className="flex items-center gap-4 cursor-pointer min-w-0 flex-1"
                >
                  <div className="w-24 h-16 rounded-xl overflow-hidden relative shrink-0 bg-neutral-900 border border-white/10 shadow-md">
                    <img src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#E60000] text-white flex items-center gap-1 shadow-[0_0_8px_#E60000]">
                      <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white/10 text-neutral-300 truncate max-w-[170px]">
                        {stream.batchName}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">● Streaming Now</span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1 mt-1 font-doto">
                      {stream.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{stream.instructor} • {stream.subject} • {stream.chapter}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 font-doto">
                  <button
                    onClick={() => onPlayLecture(convertLiveToLecture(stream))}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-[#E60000] hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(230,0,0,0.4)] btn-click-effect"
                  >
                    <Tv className="w-3.5 h-3.5 fill-white" />
                    <span>GO LIVE</span>
                  </button>
                  <button
                    onClick={(e) => handleEndStream(e, stream.id, stream.title)}
                    className="px-3 py-2.5 bg-red-950/60 hover:bg-red-900 border border-red-500/30 text-red-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1"
                    title="End live stream and remove from Live list"
                  >
                    <X className="w-3.5 h-3.5 text-red-400" />
                    <span className="hidden sm:inline">END</span>
                  </button>
                  {onOpenBatch && stream.batchId && (
                    <button
                      onClick={() => onOpenBatch(stream.batchId)}
                      className="px-3 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white rounded-xl text-xs font-bold uppercase transition-all"
                      title="Open full batch folder in Course Explorer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Up Spotlight Banner (Honest Schedule & Active Live Stream) */}
      {nextUpClass && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#16121d]/95 via-[#0c0c14]/95 to-[#060609]/95 border border-white/15 p-5 sm:p-7 shadow-[0_12px_45px_rgba(0,0,0,0.9)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#E60000]/20 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 gradient-dot-pattern opacity-35 pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/40 to-transparent pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center">
            {/* Spotlight Visual Card */}
            <div className="w-full lg:w-1/2 aspect-video rounded-2xl overflow-hidden relative group bg-black border border-white/15 shadow-2xl shrink-0">
              <img
                src={nextUpClass.thumbnail}
                alt={nextUpClass.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Status Badge */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                {nextUpClass.status === 'live' ? (
                  <span className="px-3 py-1 rounded-xl bg-[#E60000] text-white text-xs font-doto font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_#E60000]">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    LIVE NOW STREAMING
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-doto font-bold uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-[#E60000]" />
                    NEXT BROADCAST • 5:00 PM
                  </span>
                )}
                <span className="px-2.5 py-1 rounded-xl bg-neutral-900/90 text-[11px] font-mono text-neutral-300 border border-white/10">
                  {nextUpClass.grade}
                </span>
              </div>

              {/* Center Schedule Pill */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-white/20 text-white shadow-2xl flex items-center gap-2">
                  {nextUpClass.status === 'live' ? (
                    <>
                      <Tv className="w-4 h-4 text-[#E60000]" />
                      <span className="text-xs font-doto font-bold uppercase tracking-wider text-white">STREAMING LIVE NOW</span>
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4 text-[#E60000]" />
                      <span className="text-xs font-doto font-bold uppercase tracking-wider">{nextUpClass.scheduledTime}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Batch Tag Bottom */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10">
                <span className="truncate">{nextUpClass.batchName}</span>
                <span className={`${nextUpClass.status === 'live' ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'} shrink-0`}>
                  {nextUpClass.status === 'live' ? 'BROADCASTING' : 'SLOT 1'}
                </span>
              </div>
            </div>

            {/* Spotlight Info Details */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2 font-doto text-xs uppercase">
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/10 text-white font-bold">
                    {nextUpClass.subject}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-300 font-mono text-[11px]">
                    {nextUpClass.chapter}
                  </span>
                </div>

                <h3 className="text-lg sm:text-2xl font-bold text-white leading-snug font-sans">
                  {nextUpClass.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-400 mt-2 font-sans leading-relaxed line-clamp-3">
                  {nextUpClass.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 font-doto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black border border-white/20 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                    {nextUpClass.instructor.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white uppercase">{nextUpClass.instructor}</div>
                    <div className="text-[10px] font-mono text-neutral-400">Next Toppers Faculty</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {nextUpClass.status === 'live' ? (
                    <button
                      onClick={() => onPlayLecture(convertLiveToLecture(nextUpClass))}
                      className="px-6 py-2.5 rounded-2xl bg-[#E60000] hover:bg-red-600 text-white font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_#E60000] btn-click-effect"
                    >
                      <Tv className="w-4 h-4 fill-white" />
                      <span>GO LIVE NOW</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleReminder(nextUpClass.id, nextUpClass.title, nextUpClass.scheduledTime)}
                      className={`px-5 py-2.5 rounded-2xl font-bold uppercase text-xs tracking-wider flex items-center gap-2 transition-all active:scale-95 ${
                        reminders.includes(nextUpClass.id)
                          ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                          : 'bg-white text-black hover:bg-[#E60000] hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                      }`}
                    >
                      {reminders.includes(nextUpClass.id) ? (
                        <>
                          <BellRing className="w-4 h-4 fill-current" />
                          <span>REMINDER SET</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4" />
                          <span>SET REMINDER</span>
                        </>
                      )}
                    </button>
                  )}

                  {onOpenBatch && (
                    <button
                      onClick={() => onOpenBatch(nextUpClass.batchId)}
                      className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                      title="Open batch folder to study recorded lectures"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-neutral-400" />
                      <span>OPEN BATCH</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grade Selector Tabs (Class 12th / 11th / 10th / 9th / 8th / 7th / All) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4 font-doto uppercase">
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll pb-1 sm:pb-0">
          <span className="text-xs text-neutral-400 font-mono mr-1 shrink-0">GRADE:</span>
          {ALL_GRADE_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedGradeTab(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 ${
                selectedGradeTab === tab
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-black/50 text-neutral-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Live Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search subject, faculty, chapter..."
            className="w-full bg-[#0a0a0e] border border-white/10 rounded-2xl pl-10 pr-8 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category & Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll pb-1 text-xs font-doto uppercase">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-2.5 rounded-2xl transition-all whitespace-nowrap border flex items-center gap-2 ${
              selectedFilter === cat
                ? 'bg-white text-black font-black border-white shadow-md'
                : 'bg-[#0a0a0e] text-neutral-400 hover:text-white border-white/10 hover:border-white/20'
            }`}
          >
            {cat === "Today's Schedule" && <Clock className="w-3.5 h-3.5 text-[#E60000]" />}
            {cat === 'Full Weekly Matrix' && <Calendar className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* FULL WEEKLY TIMETABLE MATRIX VIEW */}
      {selectedFilter === 'Full Weekly Matrix' ? (
        <div className="bg-[#0a0a0e] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-6 nothing-dot-bg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-doto">
                <Calendar className="w-5 h-5 text-[#E60000]" />
                <h3 className="font-bold text-white text-base uppercase">
                  AARAMBH 2.0 WEEKLY LIVE TIMETABLE (CLASS 9 & 10)
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Official weekly schedule for evening live streams at 5:00 PM and 8:00 PM IST.
              </p>
            </div>

            {/* Day Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll">
              {WEEK_DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-doto font-bold uppercase transition-all border ${
                    selectedDay === day
                      ? 'bg-[#E60000] text-white border-[#E60000] shadow-[0_0_15px_#E60000]'
                      : 'bg-black/60 text-neutral-400 border-white/10 hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Timetable Slots for Selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TIMETABLE_SLOTS.map(slot => {
              const classesInSlot = allClasses.filter(c => 
                c.dayOfWeek === selectedDay && 
                c.timeSlot === slot.time &&
                (selectedGradeTab === 'All' || c.grade === selectedGradeTab)
              );

              return (
                <div key={slot.time} className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 font-doto">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#E60000]" />
                      <span className="text-xs font-bold text-white uppercase">{slot.label}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">{slot.duration}</span>
                  </div>

                  {classesInSlot.length === 0 ? (
                    <div className="py-6 text-center text-xs text-neutral-500 font-mono">
                      No live broadcast currently active in batch folders for this slot.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {classesInSlot.map(cls => (
                        <div 
                          key={cls.id}
                          className="p-3.5 rounded-xl bg-[#0e0e14] border border-white/5 hover:border-white/20 transition-all space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                              {cls.grade} • {cls.subject}
                            </span>
                            <span className="text-neutral-400">By {cls.instructor}</span>
                          </div>

                          <h4 className="text-xs font-bold text-white font-sans line-clamp-1">
                            {cls.title}
                          </h4>

                          <p className="text-[11px] text-neutral-400 font-sans line-clamp-2">
                            {cls.chapter}
                          </p>

                          <div className="pt-2 flex items-center justify-between text-xs">
                            <button
                              onClick={() => toggleReminder(cls.id, cls.title, `${selectedDay} ${cls.timeSlot}`)}
                              className={`text-[10px] font-doto font-bold uppercase px-3 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                                reminders.includes(cls.id)
                                  ? 'bg-emerald-500 text-black border-emerald-500'
                                  : 'bg-black/60 text-neutral-300 border-white/15 hover:text-white'
                              }`}
                            >
                              <Bell className="w-3 h-3" />
                              <span>{reminders.includes(cls.id) ? 'REMINDER SET' : 'REMIND ME'}</span>
                            </button>

                            {onOpenBatch && (
                              <button
                                onClick={() => onOpenBatch(cls.batchId)}
                                className="text-[10px] font-doto text-neutral-400 hover:text-white uppercase flex items-center gap-1"
                              >
                                <span>VIEW BATCH</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-start gap-3 text-xs text-neutral-400 font-sans">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p>
              Class schedules follow the official Next Toppers 2026-27 batch calendar. Live streams activate automatically 5 minutes before scheduled session time (5:00 PM or 8:00 PM IST).
            </p>
          </div>
        </div>
      ) : (
        /* STANDARD SCHEDULED CARDS GRID */
        <div>
          {filteredList.length === 0 ? (
            <div className="p-12 text-center bg-[#0a0a0e] border border-white/10 rounded-3xl space-y-4 nothing-dot-bg">
              <Tv className="w-12 h-12 text-neutral-600 mx-auto" />
              <h3 className="font-doto font-bold text-white text-base uppercase">NO LIVE BROADCAST IN BATCHES</h3>
              <p className="text-xs text-neutral-400 font-sans max-w-md mx-auto">
                No active live stream was found matching "{searchQuery || selectedFilter}". Lectures will automatically go live here the instant an instructor broadcasts in any batch folder.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleScanBatches}
                  disabled={isScanning}
                  className="px-5 py-2.5 bg-[#E60000] text-white font-doto font-bold text-xs uppercase rounded-2xl hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'SCANNING BATCHES...' : 'SCAN BATCHES FOR LIVE LECTURES'}</span>
                </button>
                {onOpenBatch && (
                  <button
                    onClick={() => onOpenBatch(176)}
                    className="px-5 py-2.5 bg-white/10 text-white font-doto font-bold text-xs uppercase rounded-2xl hover:bg-white hover:text-black transition-colors"
                  >
                    EXPLORE AARAMBH 10th
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
              {filteredList.map((item) => {
                const isReminderSet = reminders.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-3xl bg-[#0a0a0e] border border-white/10 hover:border-white/30 transition-all flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden"
                  >
                    <div>
                      {/* Thumbnail Container */}
                      <div className="w-full aspect-video rounded-2xl overflow-hidden relative bg-black border border-white/5">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                        {/* Timing Badge (Live Now or Scheduled) */}
                        <div className="absolute top-2.5 left-2.5">
                          {item.status === 'live' ? (
                            <span className="px-2.5 py-1 rounded-xl bg-[#E60000] text-white text-[10px] font-doto font-bold flex items-center gap-1.5 uppercase shadow-[0_0_12px_#E60000]">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                              LIVE NOW
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-white/15 text-white text-[10px] font-mono font-bold flex items-center gap-1.5 uppercase">
                              <Clock className="w-3 h-3 text-[#E60000]" />
                              {item.timeSlot}
                            </span>
                          )}
                        </div>

                        {/* Grade Pill */}
                        <div className="absolute top-2.5 right-2.5">
                          <span className="px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-mono text-neutral-300 border border-white/10">
                            {item.grade}
                          </span>
                        </div>

                        {/* Scheduled Day Tag */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-mono text-neutral-300">
                          <span className="bg-black/80 px-2 py-0.5 rounded-md border border-white/10">
                            {item.status === 'live' ? 'Broadcasting Now' : item.dayOfWeek}
                          </span>
                          <span className={`${item.status === 'live' ? 'text-red-400 font-bold' : 'text-neutral-400'}`}>
                            {item.status === 'live' ? 'LIVE STREAM' : (item.timeSlot === '5:00 PM' ? 'Evening Slot' : 'Prime Slot')}
                          </span>
                        </div>
                      </div>

                      {/* Class Metadata */}
                      <div className="mt-3.5 space-y-1.5">
                        <div className="flex items-center gap-2 font-doto text-[10px] uppercase text-neutral-400">
                          <span className="text-white font-bold">{item.subject}</span>
                          <span>•</span>
                          <span className="font-mono truncate">{item.batchName}</span>
                        </div>

                        <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors font-sans">
                          {item.title}
                        </h4>

                        <p className="text-[11px] text-neutral-400 font-sans line-clamp-2 mt-1">
                          {item.chapter}
                        </p>
                      </div>
                    </div>

                    {/* Footer Controls */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-doto text-xs">
                      <div className="text-[10px] text-neutral-400 font-mono">
                        By <strong className="text-white">{item.instructor}</strong>
                      </div>

                      {item.status === 'live' ? (
                        <button
                          onClick={() => onPlayLecture(convertLiveToLecture(item))}
                          className="text-[10px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl bg-[#E60000] hover:bg-red-600 text-white shadow-[0_0_15px_#E60000] flex items-center gap-1.5 transition-all btn-click-effect"
                        >
                          <Tv className="w-3 h-3 fill-white" />
                          <span>GO LIVE</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleReminder(item.id, item.title, item.scheduledTime)}
                          className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                            isReminderSet 
                              ? 'bg-emerald-500 text-black border-emerald-500' 
                              : 'bg-black/60 text-neutral-300 border-white/15 hover:border-white/40 hover:text-white'
                          }`}
                          title={isReminderSet ? "Reminder active" : "Set alert for this class"}
                        >
                          {isReminderSet ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                          <span>{isReminderSet ? 'ACTIVE' : 'REMIND ME'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveClassesSection;
