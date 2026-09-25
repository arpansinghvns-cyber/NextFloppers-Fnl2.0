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
    <div className="premium-card rounded-xl overflow-hidden group flex flex-col relative">
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-black border-b border-white/5">
        <img
          src={batch.thumbnail || undefined}
          alt={batch.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-90 pointer-events-none"></div>

        {/* Free Tag */}
        <div className="absolute top-3 right-3 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-2 py-1 rounded flex items-center justify-center z-10 shadow-sm">
          <span className="text-emerald-400 text-[9px] font-black tracking-widest uppercase">FREE</span>
        </div>

        {/* Batch Tag / Category */}
        {batch.tag && (
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded flex items-center justify-center z-10">
            <span className="text-[#FACC15] text-[9px] font-bold tracking-wider uppercase">{batch.tag}</span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-1 relative z-20 justify-between">
        <h3 className="text-gray-200 font-semibold text-sm leading-relaxed mb-4 line-clamp-2 group-hover:text-white transition-colors">
          {batch.title}
        </h3>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5 gap-2">
          {isEnrolled ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnroll(batch.id);
              }}
              className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider flex items-center gap-1.5 hover:bg-emerald-500/20 transition-colors btn-click-effect shrink-0"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>ENROLLED</span>
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleEnroll(batch.id);
              }}
              className="bg-[#10B981] hover:bg-emerald-400 text-black px-3 py-1.5 rounded-lg text-[11px] font-bold tracking-wider flex items-center gap-1.5 transition-colors btn-click-effect shadow-md shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-black stroke-[3]" />
              <span>ENROLL</span>
            </button>
          )}

          <button
            onClick={() => onOpenStudy(batch)}
            className="bg-[#FACC15] hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors btn-click-effect shadow-md font-syne shrink-0"
          >
            <span>Let's Study</span>
            <ArrowRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
