import React from 'react';
import { BatchItem } from '../types';
import { Check, Plus, ArrowRight } from 'lucide-react';

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
      className="nothing-card rounded-3xl overflow-hidden group flex flex-col relative cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300 bg-[#0a0a0e] hover:shadow-[0_0_30px_rgba(255,255,255,0.06)]"
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
        <img
          src={batch.thumbnail || undefined}
          alt={batch.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
        />
        
        {/* Ambient Dark Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0e] via-black/30 to-transparent pointer-events-none" />

        {/* Nothing OS Status Badge Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none font-doto">
          {batch.tag ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
              {batch.tag}
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-xl border border-white/5">
              #{batch.id}
            </span>
          )}

          <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/20 uppercase">
            ACTIVE BATCH
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 justify-between bg-[#0a0a0e] group-hover:bg-[#0e0e14] transition-colors">
        <div>
          {/* Subtle Category Kicker in Dot Matrix */}
          <div className="text-[10px] font-doto font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
            <span>{batch.category || 'CBSE CURRICULUM'}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span className="font-mono text-neutral-500">2026 EDITION</span>
          </div>

          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors font-sans">
            {batch.title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/5 gap-2 font-doto">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnroll(batch.id);
              }}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider flex items-center gap-1.5 bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all btn-click-effect shrink-0 uppercase"
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
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all btn-click-effect shrink-0 uppercase"
              title="Save to My Enrolled Batches"
            >
              <Plus className="w-3.5 h-3.5 text-neutral-400" />
              <span>SAVE</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-300 group-hover:text-white transition-colors uppercase tracking-wider font-doto">
            <span>OPEN</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E60000] group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
