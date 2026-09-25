import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw,
  Loader2, 
  AlertCircle, 
  Maximize2,
  Zap,
  Radio,
  ExternalLink,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateStreamCandidates, StreamCandidate } from '../lib/streamRelocator';

interface NexusVideoPlayerProps {
  url: string;
  poster?: string;
}

export const NexusVideoPlayer: React.FC<NexusVideoPlayerProps> = ({ url, poster }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Stream candidates generated from initial URL
  const [candidates, setCandidates] = useState<StreamCandidate[]>([]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);
  const [isNativeFallback, setIsNativeFallback] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enforceToast, setEnforceToast] = useState<string | null>(null);
  
  // Custom Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showRelocateMenu, setShowRelocateMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);

  // Initialize stream candidates whenever the prop URL changes
  useEffect(() => {
    const streamList = generateStreamCandidates(url);
    setCandidates(streamList);
    setActiveCandidateIndex(0);
    setIsNativeFallback(false);
    setError(null);
    retryCountRef.current = 0;
  }, [url]);

  const activeCandidate = candidates[activeCandidateIndex] || {
    label: 'Primary Stream',
    url: url,
    quality: 'Auto'
  };

  const isHLS = activeCandidate.url.includes('.m3u8');
  const isYouTube = activeCandidate.url.includes('youtube.com') || activeCandidate.url.includes('youtu.be');

  const triggerToast = (msg: string) => {
    setEnforceToast(msg);
    setTimeout(() => setEnforceToast(null), 3000);
  };

  // Main Player Engine with Auto-Relocation & Fault Recovery
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isYouTube) return;

    let hls: Hls | null = null;
    let cancelled = false;

    const streamUrl = activeCandidate.url;
    setLoading(true);
    setError(null);

    // If native fallback mode is forced or browser natively supports HLS and Hls.js is bypassed
    if (isNativeFallback || (!Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl'))) {
      video.src = streamUrl;
      video.load();
      video.play().catch(() => {});
      setLoading(false);
      return () => {
        video.src = '';
      };
    }

    if (isHLS && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 6,
        fragLoadingMaxRetry: 6,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (cancelled) return;
        setLoading(false);
        setError(null);
        retryCountRef.current = 0;
        video.play().catch(() => {
          // Autoplay policy: start muted or wait for interaction
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (cancelled) return;
        console.warn('HLS stream notice:', data.type, data.details);

        if (data.fatal) {
          console.error('Fatal HLS error encountered:', data.details);
          
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            // Attempt standard recovery first
            if (retryCountRef.current < 2) {
              retryCountRef.current += 1;
              hls?.startLoad();
              return;
            }

            // Auto-relocate to next available candidate CloudFront stream
            if (activeCandidateIndex < candidates.length - 1) {
              const nextIndex = activeCandidateIndex + 1;
              const nextCandidate = candidates[nextIndex];
              triggerToast(`Relocating CloudFront Stream to: ${nextCandidate.label}`);
              setActiveCandidateIndex(nextIndex);
              return;
            }

            // Try native HTML5 fallback before giving up
            if (!isNativeFallback) {
              triggerToast('Switching to Enforced Native Player...');
              setIsNativeFallback(true);
              return;
            }

            setError(`CloudFront network delivery paused on ${activeCandidate.label}. Use Enforce Stream to restore.`);
          } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls?.recoverMediaError();
          } else {
            // Other fatal errors: try next candidate
            if (activeCandidateIndex < candidates.length - 1) {
              setActiveCandidateIndex(prev => prev + 1);
            } else {
              setError("Stream buffer halted. Select an enforced mirror below.");
            }
          }
        }
      });
    } else {
      // Standard MP4 or direct video source
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        setDuration(video.duration);
      });
      video.addEventListener('error', () => {
        // Try next candidate if available
        if (activeCandidateIndex < candidates.length - 1) {
          setActiveCandidateIndex(prev => prev + 1);
        } else {
          setError("Direct stream unavailable. Try another relocated link.");
        }
      });
    }

    return () => {
      cancelled = true;
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeCandidate.url, isHLS, isNativeFallback, activeCandidateIndex, candidates]);

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!isDragging) setCurrentTime(video.currentTime);
    };
    const onDurationChange = () => setDuration(video.duration);
    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const onWaiting = () => setLoading(true);
    const onPlaying = () => {
      setLoading(false);
      setError(null);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, [isDragging]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const setSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleManualEnforceCandidate = (index: number) => {
    setError(null);
    setLoading(true);
    retryCountRef.current = 0;
    setIsNativeFallback(false);
    setActiveCandidateIndex(index);
    setShowRelocateMenu(false);
    triggerToast(`Enforcing: ${candidates[index]?.label}`);
  };

  const handleForceEnforcePrimary = () => {
    setError(null);
    setLoading(true);
    retryCountRef.current = 0;
    // Advance to next or wrap to 0
    const nextIdx = (activeCandidateIndex + 1) % (candidates.length || 1);
    setActiveCandidateIndex(nextIdx);
    triggerToast(`Enforcing stream relocation route #${nextIdx + 1}`);
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={() => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
          if (isPlaying) setShowControls(false);
        }, 3500);
      }}
      className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center select-none group"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster || undefined}
        playsInline
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Click overlay for play/pause */}
      <div 
        onClick={togglePlay} 
        className="absolute inset-0 cursor-pointer z-10"
      />

      {/* Floating Enforce Toast */}
      {enforceToast && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#FACC15] text-black text-xs font-bold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>{enforceToast}</span>
        </div>
      )}

      {/* Custom Controls Bar */}
      <AnimatePresence>
        {(showControls || !isPlaying) && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between pointer-events-none z-20 bg-gradient-to-t from-black/90 via-transparent to-black/60 p-4 sm:p-6"
          >
            {/* Top Bar with Stream Info & Enforce Menu */}
            <div className="flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <span className="bg-[#FACC15] text-black text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                  ENFORCED
                </span>
                <span className="text-white text-xs font-bold truncate max-w-[200px] sm:max-w-md">
                  {activeCandidate.label}
                </span>
              </div>

              {/* Relocation stream selector button */}
              <div className="relative">
                <button
                  onClick={() => setShowRelocateMenu(prev => !prev)}
                  className="px-3 py-1.5 rounded-lg bg-black/60 hover:bg-[#FACC15] hover:text-black text-[#FACC15] border border-[#FACC15]/40 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg"
                  title="Switch CloudFront Route"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span className="hidden sm:inline">Relocate CDN:</span>
                  <span>{activeCandidate.quality}</span>
                </button>

                {showRelocateMenu && (
                  <div className="absolute right-0 top-10 w-64 bg-[#141416] border border-white/10 rounded-xl p-2 shadow-2xl z-50 space-y-1">
                    <div className="text-[10px] font-bold text-stone-400 uppercase px-2 py-1 tracking-wider border-b border-white/5">
                      CloudFront Stream Mirrors
                    </div>
                    {candidates.map((cand, idx) => (
                      <button
                        key={cand.url + idx}
                        onClick={() => handleManualEnforceCandidate(idx)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          activeCandidateIndex === idx
                            ? 'bg-[#FACC15] text-black font-bold'
                            : 'text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        <span className="truncate pr-2">{cand.label}</span>
                        <span className="text-[10px] opacity-70 shrink-0 font-mono">{cand.quality}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setIsNativeFallback(true);
                        setShowRelocateMenu(false);
                        triggerToast('Enforcing Native HTML5 Decoder');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 hover:bg-emerald-950/30 flex items-center gap-2 border-t border-white/5 mt-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Enforce Native Player</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-3 pointer-events-auto">
              
              {/* Progress Slider */}
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FACC15] focus:outline-none"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-full bg-[#FACC15] hover:bg-yellow-400 text-black flex items-center justify-center transition-transform active:scale-95 shadow-lg"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 fill-black" />
                    ) : (
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    )}
                  </button>

                  {/* Skip Buttons */}
                  <button onClick={() => skip(-10)} className="text-stone-300 hover:text-white transition-colors" title="Rewind 10s">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button onClick={() => skip(10)} className="text-stone-300 hover:text-white transition-colors" title="Forward 10s">
                    <RotateCw className="w-4 h-4" />
                  </button>

                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <button onClick={toggleMute} className="text-stone-300 hover:text-white">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-[#FACC15] hidden sm:block"
                    />
                  </div>

                  {/* Time display */}
                  <div className="text-xs font-mono text-stone-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                {/* Right controls: Speed, Enforce button, Fullscreen */}
                <div className="flex items-center gap-3">
                  {/* Playback speed selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(prev => !prev)}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                    >
                      {playbackRate}x
                    </button>

                    {showSpeedMenu && (
                      <div className="absolute right-0 bottom-8 bg-[#18181b] border border-white/10 rounded-xl p-1 shadow-2xl z-50 min-w-[70px]">
                        {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setSpeed(rate)}
                            className={`w-full text-center px-2 py-1 rounded text-xs font-bold ${
                              playbackRate === rate ? 'bg-[#FACC15] text-black' : 'text-stone-300 hover:bg-white/10'
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Force Enforce Button */}
                  <button
                    onClick={handleForceEnforcePrimary}
                    className="p-1.5 rounded-lg bg-black/60 hover:bg-[#FACC15] hover:text-black text-[#FACC15] border border-[#FACC15]/30 transition-colors"
                    title="Enforce Next CloudFront Variant"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} className="text-stone-300 hover:text-white transition-colors">
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm z-30 pointer-events-none">
          <Loader2 className="w-12 h-12 text-[#FACC15] animate-spin mb-3" />
          <p className="text-stone-300 text-xs font-bold uppercase tracking-widest animate-pulse">
            Connecting Stream ({activeCandidate.quality})
          </p>
        </div>
      )}

      {/* ENFORCED RECOVERY OVERLAY (Replaces dead-end Transmission Severed) */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md z-40 p-6 sm:p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#FACC15]/10 border border-[#FACC15]/30 flex items-center justify-center text-[#FACC15] mb-4 shadow-[0_0_30px_rgba(250,204,21,0.2)]">
            <Zap className="w-8 h-8 animate-pulse" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-syne mb-2">
            Stream Signal Interrupted
          </h3>
          <p className="text-stone-400 text-xs max-w-md mb-6 leading-relaxed">
            The CDN link returned a stall or block. Click below to enforce transmission through an alternative CloudFront route or native decoder.
          </p>

          {/* Quick Enforce Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mb-6">
            {candidates.map((cand, idx) => (
              <button
                key={cand.url + idx}
                onClick={() => handleManualEnforceCandidate(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all btn-click-effect ${
                  activeCandidateIndex === idx
                    ? 'bg-[#FACC15] text-black shadow-lg'
                    : 'bg-[#18181b] border border-white/10 text-stone-300 hover:border-[#FACC15]/40'
                }`}
              >
                <Radio className="w-3 h-3 text-[#FACC15]" />
                <span>{cand.label}</span>
              </button>
            ))}

            <button
              onClick={() => {
                setError(null);
                setIsNativeFallback(true);
                triggerToast('Forcing Native HTML5 Stream');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#10B981] hover:bg-emerald-400 text-black flex items-center gap-1.5 shadow-md btn-click-effect"
            >
              <Zap className="w-3 h-3" />
              <span>Force Native Player</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleForceEnforcePrimary}
              className="px-6 py-2.5 bg-[#FACC15] hover:bg-yellow-400 text-black text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg font-syne flex items-center gap-2 btn-click-effect"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto-Relocate & Reconnect</span>
            </button>

            <a
              href={activeCandidate.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Direct Link</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
