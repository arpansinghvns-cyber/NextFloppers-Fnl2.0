import React, { useEffect, useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Sparkles, Play, ExternalLink, Bookmark, Check, Radio } from 'lucide-react';
import { Lecture } from '../types';
import { MediaResolutionResult } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { UltraVideoPlayer } from './UltraVideoPlayer';

interface VideoModalProps {
  lecture?: Lecture | null;
  activeMedia?: MediaResolutionResult | null;
  onClose: () => void;
  allLectures?: Lecture[];
  onLectureSelect?: (lecture: Lecture) => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  lecture,
  activeMedia,
  onClose,
  allLectures = [],
  onLectureSelect,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isTheater, setIsTheater] = useState(false);

  const activeItem = activeMedia || (lecture ? {
    title: lecture.title,
    url: lecture.videoUrl,
    type: lecture.videoUrl.includes('youtube.com') || lecture.videoUrl.includes('youtu.be') ? 'youtube' as const : 'hls' as const,
    thumbnail: lecture.thumbnail,
    duration: undefined,
    isLive: lecture.isLive
  } : null);

  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeItem]);

  if (!activeItem) return null;

  const instructorName = lecture?.instructor || "Next Toppers Faculty";
  const videoTitle = activeItem.title || "Video Lecture";
  const videoUrl = activeItem.url;
  const isYouTube = activeItem.type === 'youtube' || videoUrl.includes('youtube') || videoUrl.includes('youtu.be');

  // Extract YouTube ID if it's youtube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const ytId = isYouTube ? getYouTubeId(videoUrl) : null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/95 backdrop-blur-2xl overflow-y-auto font-sans"
      >
        <div className={`relative w-full mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10 transition-all duration-300 ${
          isTheater 
            ? 'max-w-[1900px] flex flex-col gap-8' 
            : 'max-w-[1600px] grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8'
        }`}>
          
          {/* Main Video Arena */}
          <div className="space-y-6">
            <div className="relative group">
              {/* Top Navigation Row */}
              <div className="flex items-center justify-between mb-3 text-xs font-doto uppercase">
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all flex items-center gap-2"
                >
                  <X className="w-4 h-4 text-[#E60000]" />
                  <span>CLOSE PLAYER</span>
                </button>

                <div className="flex items-center gap-3 text-neutral-400 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    HARDWARE ENCLAVE
                  </span>
                  <span>•</span>
                  <span>NOTHING OS 3.0 CINEMA</span>
                </div>
              </div>

              {/* The Video Container */}
              <div className="w-full bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] border border-white/10 relative">
                {isYouTube && ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                    title={videoTitle}
                    className="w-full aspect-video border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <UltraVideoPlayer 
                    url={videoUrl} 
                    poster={activeItem.thumbnail || undefined}
                    title={videoTitle}
                    onToggleTheater={() => setIsTheater(prev => !prev)}
                    isTheater={isTheater}
                  />
                )}
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-4 bg-[#0a0a0e] p-5 sm:p-6 rounded-3xl border border-white/10 nothing-dot-bg">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-[#E60000] text-white text-[10px] font-doto font-bold uppercase tracking-wider shadow-[0_0_12px_rgba(230,0,0,0.4)]">
                    NEXT FLOPPERS (2.0)
                  </span>
                  {activeItem.isLive && (
                    <span className="px-2.5 py-1 rounded-xl bg-white text-black text-[10px] font-doto font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
                      <Radio className="w-3 h-3 text-[#E60000]" />
                      LIVE
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-neutral-400 uppercase bg-white/5 px-2.5 py-1 rounded-xl border border-white/5">
                    CBSE 2026 EDITION
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-bold text-white font-sans leading-snug">
                  {videoTitle}
                </h1>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black border border-white/20 text-white font-doto font-bold flex items-center justify-center text-sm shadow-inner">
                    {instructorName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5 font-doto uppercase">
                      {instructorName}
                      <Sparkles className="w-3.5 h-3.5 text-[#E60000]" />
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono">Next Toppers Faculty • Zero-Lag Mirror</div>
                  </div>

                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`ml-2 sm:ml-4 px-3.5 py-2 rounded-2xl text-xs font-doto font-bold transition-all btn-click-effect flex items-center gap-1.5 uppercase ${
                      isSaved
                        ? 'bg-white/15 text-white border border-white/30'
                        : 'bg-white text-black hover:bg-[#E60000] hover:text-white shadow-md'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>SAVED</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>SAVE TO NOTES</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 text-xs font-doto">
                    <button className="flex items-center gap-1.5 px-3 py-1 text-neutral-300 hover:text-white">
                      <ThumbsUp className="w-3.5 h-3.5 text-[#E60000]" />
                      <span>HIGH-RES</span>
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button className="px-2.5 py-1 text-neutral-400 hover:text-white">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-xs font-doto font-bold text-neutral-300 hover:text-white uppercase transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-white" />
                    <span>DIRECT LINK</span>
                  </a>
                </div>
              </div>

              {/* Description & Study Keynotes */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#07070a] border border-white/5 text-xs text-neutral-300 leading-relaxed font-sans space-y-2">
                <p>
                  {lecture?.description || "High-performance lecture playback optimized for Next Toppers syllabus with multi-quality adaptive HLS, 200% Web Audio gain boost, instantaneous frame note capture, and A-B repetition loops."}
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-mono text-neutral-400">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">0ms Caching</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">200% Mic Booster</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">Instant Note PNGs</span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">A-B Looper</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar / Recommended Lectures */}
          <div className="space-y-4">
            <div className="p-4 rounded-3xl bg-[#0a0a0e] border border-white/10">
              <h3 className="text-xs font-doto font-bold uppercase tracking-wider text-white flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                <span>CURATED REPEATING LECTURES</span>
              </h3>

              <div className="space-y-2.5">
                {allLectures.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onLectureSelect && onLectureSelect(item)}
                    className="flex gap-3 p-2.5 rounded-2xl bg-[#060608] hover:bg-[#121218] border border-white/5 hover:border-white/20 cursor-pointer transition-all group"
                  >
                    <div className="w-24 sm:w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 relative">
                      <img
                        src={item.thumbnail || "https://decicqog4ulhy.cloudfront.net/0/admin_v2/uploads/courses/thumbnail/2671188_1_logo.jpg"}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    </div>

                    <div className="flex flex-col justify-center min-w-0">
                      <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-red-400 font-sans transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-neutral-400 font-doto mt-1">
                        {item.instructor}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
export default VideoModal;
