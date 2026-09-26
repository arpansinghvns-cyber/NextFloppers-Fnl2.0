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
      className="rounded-3xl overflow-hidden group flex flex-col relative cursor-pointer border border-white/10 hover:border-white/30 transition-all duration-300 bg-gradient-to-b from-[#131319] via-[#0d0d12] to-[#08080b] hover:shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_24px_-4px_rgba(230,0,0,0.3)] hover:-translate-y-1.5"
    >
      {/* Top Edge Ambient Gradient Hairline */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent z-30 pointer-events-none group-hover:via-[#E60000]/60 transition-all" />

      {/* Thumbnail Container */}
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black">
        <img
          src={batch.thumbnail || undefined}
          alt={batch.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
        />
        
        {/* Ambient Dark Mask with subtle gradient pattern */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E60000]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none font-doto">
          {batch.tag ? (
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/15 flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E60000] animate-pulse" />
              {batch.tag}
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-black/85 backdrop-blur-md px-2 py-0.5 rounded-xl border border-white/10 shadow-md">
              #{batch.id}
            </span>
          )}

          <span className="text-[9px] font-mono font-bold tracking-wider text-emerald-400 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-emerald-500/30 uppercase shadow-md">
            ACTIVE BATCH
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 justify-between bg-gradient-to-b from-[#0e0e14] to-[#09090d] group-hover:from-[#13131b] group-hover:to-[#0c0c11] transition-colors">
        <div>
          {/* Subtle Category Kicker in Dot Matrix */}
          <div className="text-[10px] font-doto font-bold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
            <span className="text-neutral-300">{batch.category || 'CBSE CURRICULUM'}</span>
            <span className="w-1 h-1 rounded-full bg-neutral-600" />
            <span className="font-mono text-neutral-500">2026 EDITION</span>
          </div>

          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors font-sans">
            {batch.title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-white/10 gap-2 font-doto">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnroll(batch.id);
              }}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider flex items-center gap-1.5 bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all btn-click-effect shrink-0 uppercase shadow-sm"
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
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold tracking-wider flex items-center gap-1.5 bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 hover:border-white/20 transition-all btn-click-effect shrink-0 uppercase"
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
