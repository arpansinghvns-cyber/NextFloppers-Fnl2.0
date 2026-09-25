import React, { useEffect, useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Share2, MoreHorizontal, Sparkles, Play, ExternalLink } from 'lucide-react';
import { Lecture } from '../types';
import { MediaResolutionResult } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { NexusVideoPlayer } from './NexusVideoPlayer';
import { cn } from '../lib/utils';

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
  const [isSubscribed, setIsSubscribed] = useState(false);

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
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/95 overflow-y-auto"
      >
        <div className="relative w-full max-w-[1600px] mx-auto px-4 lg:px-10 py-6 lg:py-12 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          
          {/* Main Content Area */}
          <div className="space-y-6">
            <div className="relative group">
              <button
                onClick={onClose}
                className="absolute -top-10 left-0 p-2 text-stone-400 hover:text-[#FACC15] transition-all z-20 flex items-center gap-1.5 text-xs font-bold"
              >
                <X className="w-5 h-5" />
                <span>Close Player</span>
              </button>

              <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative mt-4">
                {isYouTube && ytId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`}
                    title={videoTitle}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <NexusVideoPlayer url={videoUrl} poster={activeItem.thumbnail || undefined} />
                )}
              </div>
            </div>

            {/* Title & Metadata */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#FACC15] text-black text-[10px] font-black uppercase tracking-wider">
                    NEXT FLOPPERS
                  </span>
                  {activeItem.isLive && (
                    <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white font-syne leading-snug">
                  {videoTitle}
                </h1>
              </div>

              {/* Action bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FACC15] text-black font-black flex items-center justify-center font-syne text-sm">
                    {instructorName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      {instructorName}
                      <Sparkles className="w-3.5 h-3.5 text-[#FACC15] fill-[#FACC15]" />
                    </div>
                    <div className="text-[11px] text-stone-400">Next Toppers Faculty • Free Access</div>
                  </div>

                  <button
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`ml-3 px-4 py-1.5 rounded-lg text-xs font-bold transition-all btn-click-effect ${
                      isSubscribed
                        ? 'bg-white/10 text-stone-300 border border-white/10'
                        : 'bg-[#FACC15] text-black hover:bg-yellow-400 shadow-md font-syne'
                    }`}
                  >
                    {isSubscribed ? 'Enrolled' : 'Enroll Batch'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-1 text-xs">
                    <button className="flex items-center gap-1.5 px-3 py-1 text-stone-300 hover:text-white">
                      <ThumbsUp className="w-3.5 h-3.5 text-[#FACC15]" />
                      <span>Free</span>
                    </button>
                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                    <button className="px-2 py-1 text-stone-400 hover:text-white">
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold text-stone-300 hover:text-white"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#FACC15]" />
                    <span>Stream Source</span>
                  </a>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#141416] border border-white/5 text-xs text-stone-300 leading-relaxed">
                <p>
                  {lecture?.description || "High definition lecture streaming for Next Toppers curriculum with multi-quality resolution, interactive controls, and chapter coverage."}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar / Recommended Lectures */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Curated Science & Board Lectures
            </h3>

            <div className="space-y-3">
              {allLectures.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  onClick={() => onLectureSelect && onLectureSelect(item)}
                  className="flex gap-3 p-2 rounded-xl bg-[#121212] hover:bg-[#18181a] border border-white/5 hover:border-[#FACC15]/30 cursor-pointer transition-all group"
                >
                  <div className="w-28 aspect-video rounded-lg overflow-hidden bg-black shrink-0 relative">
                    <img
                      src={item.thumbnail || "https://decicqog4ulhy.cloudfront.net/0/admin_v2/uploads/courses/thumbnail/2671188_1_logo.jpg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-[#FACC15] fill-[#FACC15]" />
                    </div>
                  </div>

                  <div className="flex flex-col justify-center min-w-0">
                    <h4 className="text-xs font-semibold text-white line-clamp-2 leading-snug group-hover:text-[#FACC15]">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-stone-400 mt-1">
                      {item.instructor}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
