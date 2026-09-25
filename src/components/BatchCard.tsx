import React from 'react';
import { BatchItem } from '../types';
import { Check, Plus, ArrowRight, BookOpen } from 'lucide-react';

interface BatchCardProps {
  batch: BatchItem;
  isEnrolled: boolean;
  onToggleEnroll: (id: string | number) => void;
  onOpenStudy: (batch: BatchItem) => void;
}

export const BatchCard: React.FC<BatchCardProps> = ({
  batch,
  isEnrolled,
  onToggleEnroll,
  onOpenStudy,
}) => {
  return (
    <div 
      onClick={() => onOpenStudy(batch)}
      className="premium-card rounded-2xl overflow-hidden group flex flex-col relative cursor-pointer border border-white/10 hover:border-[#FACC15]/40 transition-all duration-300"
    >
      {/* Thumbnail Aspect Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black/80">
        <img
          src={batch.thumbnail || undefined}
          alt={batch.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        
        {/* Ambient Dark Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-black/20 to-transparent pointer-events-none" />

        {/* Clean Unboxed Metadata in Overlay (Zero-Pill Compliance) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          {batch.tag ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FACC15] drop-shadow-md bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
              {batch.tag}
            </span>
          ) : <span />}

          <span className="text-[10px] font-extrabold tracking-wider text-emerald-400 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md border border-emerald-500/20">
            FREE ACCESS
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 justify-between bg-[#111116] group-hover:bg-[#15151c] transition-colors">
        <div>
          {/* Subtle Category Kicker */}
          <div className="text-[11px] font-medium text-stone-400 mb-1.5 flex items-center gap-1.5">
            <span>{batch.category || 'Curriculum Batch'}</span>
            <span aria-hidden="true" className="text-stone-600">·</span>
            <span className="text-stone-500 font-mono">ID {batch.id}</span>
          </div>

          <h3 className="text-stone-100 font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#FACC15] transition-colors font-syne">
            {batch.title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/5 gap-2">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnroll(batch.id);
              }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all btn-click-effect shrink-0"
              title="Remove from My Enrolled"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>SAVED</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnroll(batch.id);
              }}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold tracking-wider flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white border border-white/10 transition-all btn-click-effect shrink-0"
              title="Save to My Enrolled"
            >
              <Plus className="w-3.5 h-3.5 text-stone-300" />
              <span>ENROLL</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenStudy(batch);
            }}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#FACC15] hover:bg-yellow-400 text-black transition-all btn-click-effect font-syne shadow-md shadow-[#FACC15]/10 shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-black" />
            <span>Open Vault</span>
            <ArrowRight className="w-3 h-3 text-black stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatchCard;
