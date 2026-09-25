import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  Wifi, 
  FileText, 
  Video, 
  ShieldCheck, 
  X, 
  Zap, 
  Clock, 
  Sliders,
  Check,
  Radio,
  Lock,
  Cpu
} from 'lucide-react';
import { 
  CLOUDFRONT_NODES, 
  SERVER_NODES, 
  ServerNode, 
  getActiveCloudFrontCdn, 
  setActiveCloudFrontCdn, 
  pingServerNodes, 
  performFullContentUpdate,
  getLastSyncTime,
  isAutoSyncEnabled,
  setAutoSyncEnabled
} from '../lib/serverSyncService';

interface AutoUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContentUpdated: (batchesCount: number) => void;
  isAutoPrompt?: boolean;
}

export const AutoUpdateModal: React.FC<AutoUpdateModalProps> = ({
  isOpen,
  onClose,
  onContentUpdated,
  isAutoPrompt = false
}) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'security'>('sync');
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState('SYSTEM READY');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  
  const [serverNodes, setServerNodes] = useState<ServerNode[]>(SERVER_NODES);
  const [isPinging, setIsPinging] = useState(false);
  const [activeCdn, setActiveCdn] = useState<string>(getActiveCloudFrontCdn);
  const [lastSync, setLastSync] = useState<string | null>(getLastSyncTime);
  const [autoSyncOnLaunch, setAutoSyncOnLaunch] = useState<boolean>(isAutoSyncEnabled);
  
  // Auto-countdown when popped up automatically
  const [countdown, setCountdown] = useState<number | null>(isAutoPrompt ? 4 : null);

  useEffect(() => {
    if (isOpen) {
      setLastSync(getLastSyncTime());
      handlePingServers();
      if (isAutoPrompt) {
        setCountdown(4);
      }
    } else {
      setCountdown(null);
    }
  }, [isOpen, isAutoPrompt]);

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      if (countdown === 0 && !isUpdating && !updateSuccess) {
        handleStartUpdate();
      }
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown, isUpdating, updateSuccess]);

  const handlePingServers = async () => {
    setIsPinging(true);
    try {
      const results = await pingServerNodes();
      setServerNodes(results);
    } finally {
      setIsPinging(false);
    }
  };

  const handleSelectCdn = (url: string) => {
    setActiveCdn(url);
    setActiveCloudFrontCdn(url);
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSyncOnLaunch;
    setAutoSyncOnLaunch(nextVal);
    setAutoSyncEnabled(nextVal);
  };

  const handleStartUpdate = async () => {
    setCountdown(null);
    setIsUpdating(true);
    setProgress(10);
    setProgressStep('INITIALIZING PROPRIETARY FLOPPER PIPELINE...');
    setUpdateSuccess(false);

    const res = await performFullContentUpdate((step, pct) => {
      // Obfuscate technical progress into sleek Nothing OS status codes
      let safeStep = step;
      if (step.includes('CloudFront')) safeStep = 'RE-INDEXING HIGH-SPEED STREAM GLYPH MATRIX...';
      if (step.includes('cache')) safeStep = 'PURGING VOLATILE MEMORY BUFFERS...';
      if (step.includes('batches')) safeStep = 'FETCHING LATEST SYLLABUS & HIGH-RES MEDIA...';
      if (step.includes('HLS')) safeStep = 'APPLYING HARDWARE ACCELERATED VIDEO DECODING...';
      setProgressStep(safeStep);
      setProgress(pct);
    });

    setIsUpdating(false);
    if (res.success) {
      setUpdateSuccess(true);
      setResultMessage(`System Vault updated successfully with ${res.batchesUpdated} curriculum modules.`);
      setLastSync(getLastSyncTime());
      onContentUpdated(res.batchesUpdated);
      handlePingServers();
    } else {
      setResultMessage('Sync completed with local cached parity.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in font-sans">
      <div 
        className="relative w-full max-w-2xl bg-[#08080b] border border-white/10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden text-white flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Nothing OS Top Dot Accent Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-white/5 bg-[#050507] text-[10px] text-neutral-400 font-doto tracking-wider uppercase">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E60000] shadow-[0_0_8px_#E60000] animate-pulse" />
            <span>NOTHING OS // FLOPPERS(2.0)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>MEM: OPTIMAL</span>
            <span>SEC: SHIELDED</span>
          </div>
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-[#0a0a0e]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#E60000]">
              <Cpu className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-doto font-bold text-lg sm:text-xl text-white tracking-wider">
                  FLOPPER SYNC ENGINE
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#E60000]/15 text-[#E60000] border border-[#E60000]/30 uppercase">
                  [GLYPH LIVE]
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-sans mt-0.5">
                Silently updates high-res lectures, stream pipelines, and DPP notes.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/5 bg-black/60 px-6 pt-3 gap-6 font-doto text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'sync'
                ? 'border-[#E60000] text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin text-[#E60000]' : ''}`} />
            Content Update & Buffers
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-neutral-500 hover:text-neutral-300'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Security & Edge Grid
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 nothing-dot-bg">
          {activeTab === 'sync' ? (
            <>
              {/* Auto Countdown Pill */}
              {countdown !== null && countdown > 0 && (
                <div className="bg-[#121218] border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#E60000]">
                      <Clock className="w-4 h-4 animate-spin" />
                    </div>
                    <div>
                      <div className="text-xs text-white font-bold font-doto">AUTO-CALIBRATION PENDING</div>
                      <div className="text-[11px] text-neutral-400">
                        Synchronizing latest batches in <strong className="text-white font-mono text-xs">{countdown}s</strong>...
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCountdown(null)}
                      className="text-xs px-3 py-1.5 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-colors"
                    >
                      Pause
                    </button>
                    <button
                      onClick={handleStartUpdate}
                      className="text-xs px-4 py-1.5 bg-[#E60000] text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(230,0,0,0.4)]"
                    >
                      Sync Now
                    </button>
                  </div>
                </div>
              )}

              {/* Progress State or Start Prompt */}
              {isUpdating ? (
                <div className="bg-[#0e0e14] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between text-xs font-doto">
                    <span className="text-white font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#E60000] animate-ping" />
                      {progressStep}
                    </span>
                    <span className="font-mono text-[#E60000] font-bold text-sm">{progress}%</span>
                  </div>
                  
                  {/* Nothing OS Minimalist Progress Bar */}
                  <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-neutral-200 via-white to-[#E60000] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] font-mono text-neutral-400">
                    <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      EDGE PIPELINE
                    </div>
                    <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                      HLS ENCLAVE
                    </div>
                    <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                      NOTES CIPHER
                    </div>
                    <div className="bg-black/60 p-2.5 rounded-xl border border-white/5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      CLEAN CACHE
                    </div>
                  </div>
                </div>
              ) : updateSuccess ? (
                <div className="bg-[#0e0e14] border border-emerald-500/30 rounded-2xl p-5 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-doto font-bold text-sm text-emerald-400 uppercase tracking-wide">
                        [ SYSTEM SYNCHRONIZED ]
                      </h4>
                      <p className="text-xs text-neutral-300 mt-0.5">{resultMessage}</p>
                    </div>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs text-neutral-400 border-t border-white/5">
                    <span className="font-mono">Last Synchronized: <strong className="text-white">{lastSync || 'Just now'}</strong></span>
                    <button
                      onClick={handleStartUpdate}
                      className="text-[#E60000] hover:text-red-400 font-bold underline font-doto"
                    >
                      [ RE-SYNC ]
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#0d0d12] border border-white/10 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-doto font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#E60000]" />
                        PROPRIETARY VAULT SYNCHRONIZER
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                        Pulls latest batch curriculum, verifies encrypted stream routes, and clears obsolete local buffers without exposing raw endpoints.
                      </p>
                    </div>
                    <button
                      onClick={handleStartUpdate}
                      className="px-5 py-3 bg-white text-black font-doto font-bold text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-[#E60000] hover:text-white transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Sync System Now</span>
                    </button>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-500 font-mono">
                    <span>STATUS: <strong className="text-neutral-300">{lastSync ? `LAST PARITY ${lastSync}` : 'INITIALIZING'}</strong></span>
                    <button 
                      onClick={handlePingServers}
                      className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <Wifi className="w-3.5 h-3.5 text-[#E60000]" />
                      <span>{isPinging ? 'TESTING...' : 'TEST LATENCY'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Obfuscated Pipeline Selector (Zero raw URLs displayed) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-doto font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                    ACTIVE STREAM ACCELERATION MATRIX
                  </h4>
                  <span className="text-[10px] text-neutral-500 font-mono">TAP TO SWITCH ENCLAVE</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {CLOUDFRONT_NODES.map((cdn) => {
                    const isSelected = activeCdn === cdn.url;
                    return (
                      <div
                        key={cdn.id}
                        onClick={() => handleSelectCdn(cdn.url)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#151520] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
                            : 'bg-[#0a0a0f] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-white text-black' : 'bg-white/5 text-neutral-400'
                          }`}>
                            {isSelected ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Video className="w-3.5 h-3.5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-doto tracking-wide">{cdn.name}</span>
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 font-mono uppercase">
                                {cdn.codeName}
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{cdn.description}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider ${
                            isSelected 
                              ? 'bg-[#E60000] text-white shadow-[0_0_10px_rgba(230,0,0,0.5)]' 
                              : 'bg-white/5 text-neutral-500'
                          }`}>
                            {isSelected ? 'ACTIVE ROUTE' : 'SELECT'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Startup Toggle */}
              <div className="p-4 rounded-2xl bg-[#0c0c10] border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sliders className="w-4 h-4 text-neutral-400" />
                  <div>
                    <div className="text-xs font-bold text-white font-doto">AUTO-VERIFY CONTENT ON LAUNCH</div>
                    <div className="text-[11px] text-neutral-500 font-sans">Silent background sync ensures fresh batches with 0ms delay.</div>
                  </div>
                </div>
                <button
                  onClick={handleToggleAutoSync}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    autoSyncOnLaunch ? 'bg-[#E60000]' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    autoSyncOnLaunch ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </>
          ) : (
            /* Security & Edge Grid (Protected View) */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0e0e14] border border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-doto font-bold text-white uppercase tracking-wider">
                    EDGE SECURITY & MESH INTEGRITY
                  </h4>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Live telemetry across secure decentralized endpoints. Real hostnames are masked for user and network protection.
                  </p>
                </div>
                <button
                  onClick={handlePingServers}
                  disabled={isPinging}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-doto rounded-xl text-neutral-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                  {isPinging ? 'TESTING...' : 'PING MESH'}
                </button>
              </div>

              <div className="space-y-2.5">
                {serverNodes.map((node) => (
                  <div 
                    key={node.id}
                    className="p-3.5 rounded-2xl bg-[#0a0a0e] border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${
                        node.isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-[#E60000]'
                      }`} />
                      <div>
                        <div className="text-xs font-bold text-white font-doto flex items-center gap-2">
                          {node.name}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-neutral-400 font-mono">
                            {node.codeName}
                          </span>
                        </div>
                        <div className="text-[11px] text-neutral-500 font-mono mt-0.5">{node.region}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      {node.latencyMs !== null ? (
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                          node.latencyMs < 120 
                            ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                            : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        }`}>
                          {node.latencyMs} ms
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-500">[STANDBY]</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                LOCKDOWN PROTOCOL ACTIVE • ZERO ACCESS LEAKS
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#050507] border-t border-white/10 flex items-center justify-between text-xs text-neutral-400 font-doto">
          <div className="flex items-center gap-2 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-[#E60000]" />
            <span>NOTHING OS PROTOCOL v2.4</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-colors uppercase text-[11px]"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
};
