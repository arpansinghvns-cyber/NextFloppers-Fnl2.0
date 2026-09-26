import React from 'react';
import { Play, Clock, User, Loader2, Sparkles } from 'lucide-react';
import { Lecture } from '../types';
import { useThumbnail } from '../hooks/useThumbnail';

interface LectureCardProps {
  lecture: Lecture;
  onClick: (lecture: Lecture) => void;
}

export const LectureCard: React.FC<LectureCardProps> = ({ lecture, onClick }) => {
  const { thumbnail, isGenerating } = useThumbnail(lecture.videoUrl, lecture.thumbnail);

  // Helper to extract a short, punchy title for the thumbnail overlay
  const getThumbnailText = (title: string) => {
    if (title.toLowerCase().includes('letter to god')) return 'LETTER TO GOD';
    if (title.toLowerCase().includes('development')) return 'DEVELOPMENT';
    return title.split('-')[0].trim().toUpperCase();
  };

  return (
    <div
      onClick={() => onClick(lecture)}
      className="group cursor-pointer aspect-video relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.85),0_0_24px_-4px_rgba(250,204,21,0.25)] bg-gradient-to-br from-[#161622] via-[#0e0e16] to-[#07070a]"
    >
      {/* Top Edge Ambient Gradient Hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent z-20 pointer-events-none group-hover:via-[#FACC15]/60 transition-all" />

      {isGenerating ? (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FACC15]/70 font-mono">Loading Snippet...</span>
        </div>
      ) : (
        <img
          src={thumbnail || lecture.thumbnail || undefined}
          alt={lecture.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:opacity-90 transition-all duration-700 group-hover:scale-105"
        />
      )}
      
      {/* Dynamic Crystalline Overlay with Gradient Sheen */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent opacity-95 group-hover:opacity-85 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      {/* Big Stylized Thumbnail Title in center */}
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        {lecture.isLive && (
          <div className="absolute top-3 right-3 z-20">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded-md shadow-[0_0_12px_rgba(220,38,38,0.6)] border border-red-500/50">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE</span>
            </div>
          </div>
        )}
        <div className="relative">
          <div className="relative text-2xl md:text-3xl font-black italic tracking-tighter leading-none text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] select-none pointer-events-none font-syne">
            {getThumbnailText(lecture.title)}
            <div className="h-1 w-1/3 bg-[#FACC15] mt-1.5 mx-auto rounded-full shadow-sm" />
          </div>
        </div>
      </div>
      
      {/* Bottom info section */}
      <div className="absolute inset-0 p-4 flex flex-col justify-end">
        {/* Zero-Pill Unboxed Metadata */}
        <div className="flex items-center gap-2 mb-1.5 text-[11px] text-stone-300 font-semibold">
          <span className="text-[#FACC15]">{lecture.category}</span>
          <span aria-hidden="true" className="text-stone-600">·</span>
          <span className="text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FACC15]" />
            <span>Fast CDN</span>
          </span>
        </div>
        
        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-[#FACC15] transition-colors font-syne">
          {lecture.title}
        </h3>
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3 h-3 text-stone-400" />
            <span className="truncate">{lecture.instructor}</span>
          </div>
          <span className="text-[11px] font-bold text-[#FACC15] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            Play <Play className="w-3 h-3 fill-[#FACC15]" />
          </span>
        </div>
      </div>
      
      {/* Floating Center Play Button */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-xl">
        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
      </div>
    </div>
  );
};

export default LectureCard;
