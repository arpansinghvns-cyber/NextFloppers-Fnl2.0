import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Radio, 
  X, 
  Zap, 
  ShieldCheck, 
  Wifi, 
  Clock, 
  Server, 
  Layers, 
  Activity,
  AlertCircle
} from 'lucide-react';
import { 
  enforceDualSystemCheck, 
  DualSyncResult, 
  CLOUDFRONT_STREAM_ENDPOINTS, 
  STUDYBEE_ENDPOINTS,
  isEnforceDualCheckEnabled,
  setEnforceDualCheckEnabled,
  getLastDualSyncInfo
} from '../lib/streamSyncService';

interface DualSystemUpdatePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSyncComplete?: (result: DualSyncResult) => void;
  autoStartOnOpen?: boolean;
}

export const DualSystemUpdatePopup: React.FC<DualSystemUpdatePopupProps> = ({
  isOpen,
  onClose,
  onSyncComplete,
  autoStartOnOpen = false
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('STANDBY // READY TO ENFORCE');
  const [syncResult, setSyncResult] = useState<DualSyncResult | null>(null);
  const [enforceOnLaunch, setEnforceOnLaunch] = useState<boolean>(isEnforceDualCheckEnabled);
  const [lastSync, setLastSync] = useState(getLastDualSyncInfo);

  useEffect(() => {
    if (isOpen) {
      setLastSync(getLastDualSyncInfo());
      if (autoStartOnOpen && !isChecking && !syncResult) {
        handleEnforceUpdate();
      }
    }
  }, [isOpen, autoStartOnOpen]);

  const handleToggleEnforce = () => {
    const nextVal = !enforceOnLaunch;
    setEnforceOnLaunch(nextVal);
    setEnforceDualCheckEnabled(nextVal);
  };

  const handleEnforceUpdate = async () => {
    setIsChecking(true);
    setProgress(5);
    setProgressStep('INITIALIZING DUAL-CHANNEL PROTOCOL...');

    try {
      const res = await enforceDualSystemCheck((step, pct) => {
        setProgressStep(step);
        setProgress(pct);
      });

      setSyncResult(res);
      setLastSync(getLastDualSyncInfo());
      if (onSyncComplete) {
        onSyncComplete(res);
      }
    } catch {
      setProgressStep('SYNC ENCOUNTERED LOCAL FALLBACK CACHE');
    } finally {
      setIsChecking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-lg bg-[#08080c] border border-white/15 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden text-white flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Nothing OS Dot Strip */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/10 bg-[#050508] text-[10px] text-neutral-400 font-doto tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E60000] shadow-[0_0_8px_#E60000] animate-pulse" />
            <span>NOTHING OS // STREAM & SYNC ENFORCER</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Header Description */}
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#E60000]" />
              <h3 className="text-sm sm:text-base font-bold text-white font-doto tracking-wide uppercase">
                ENFORCE UPDATES: CLOUDFRONT & STUDYBEE
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Verifies live streams and syllabus updates directly from <span className="text-white font-mono">CloudFront CDN</span> and <span className="text-white font-mono">studybeepro.site</span>. No artificial streams added.
            </p>
          </div>

          {/* Dual Systems Channel Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            {/* System 1: CloudFront Systems */}
            <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-[#E60000]" />
                    CLOUDFRONT
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    syncResult ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {syncResult ? `${syncResult.cloudfront.latencyMs}ms · ACTIVE` : 'READY'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-2 font-sans">
                  HLS Live Stream & VOD Edge Distributions
                </p>
                <div className="text-[9px] text-neutral-500 mt-1 truncate">
                  dbil3go8szhu6.cloudfront.net + 3 mirrors
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">Live Uploads:</span>
                <span className="text-neutral-300 font-bold">
                  {syncResult ? (syncResult.activeStreamsCount > 0 ? `${syncResult.activeStreamsCount} Active` : '0 (Off-Air)') : 'Checking...'}
                </span>
              </div>
            </div>

            {/* System 2: StudyBeePro.site Systems */}
            <div className="p-3.5 rounded-2xl bg-black/70 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    STUDYBEEPRO.SITE
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    syncResult ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {syncResult ? `${syncResult.studybeepro.latencyMs}ms · ONLINE` : 'READY'}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 mt-2 font-sans">
                  Primary Course Vault & Decryption Gateways
                </p>
                <div className="text-[9px] text-neutral-500 mt-1 truncate">
                  nt.studybeepro.site/api/nig + /foy
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                <span className="text-neutral-500">Vault Parity:</span>
                <span className="text-neutral-300 font-bold">
                  {syncResult ? `${syncResult.batchesSyncedCount} Batches Synced` : 'Ready'}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Telemetry Status */}
          <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-red-500" />
                <span className="truncate max-w-[280px]">{progressStep}</span>
              </span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
            
            {/* Sleek Dot Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden relative">
              <div 
                className="h-full bg-[#E60000] rounded-full transition-all duration-300 shadow-[0_0_10px_#E60000]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Result Status Banner */}
            {syncResult && (
              <div className="pt-1 flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[11px] text-neutral-300 leading-snug">
                  {syncResult.message}
                </div>
              </div>
            )}
          </div>

          {/* Info pill about genuine streams */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-900/60 border border-white/5 text-[11px] text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>Official live classes broadcast Monday–Saturday at <strong>5:00 PM</strong> and <strong>8:00 PM</strong>.</span>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-neutral-400">
              <input 
                type="checkbox"
                checked={enforceOnLaunch}
                onChange={handleToggleEnforce}
                className="rounded border-white/20 bg-black text-[#E60000] focus:ring-0 w-3.5 h-3.5"
              />
              <span>Auto-enforce dual check on startup</span>
            </label>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleEnforceUpdate}
                disabled={isChecking}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#E60000] hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold font-doto tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,0,0,0.35)] btn-click-effect"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                <span>{isChecking ? 'CHECKING...' : 'ENFORCE UPDATE NOW'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tiny Last Sync Footer */}
        {lastSync && (
          <div className="px-5 py-2 bg-black/60 border-t border-white/5 text-[9px] font-mono text-neutral-500 flex items-center justify-between">
            <span>LAST VERIFIED: {lastSync.timestamp}</span>
            <span>SYSTEMS: OK</span>
          </div>
        )}
      </div>
    </div>
  );
};
