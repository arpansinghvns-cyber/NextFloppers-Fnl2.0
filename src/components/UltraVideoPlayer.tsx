import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Volume1,
  Maximize, 
  Minimize, 
  RotateCcw, 
  RotateCw,
  Camera,
  Repeat,
  Moon,
  Clock,
  Settings2,
  Tv,
  HelpCircle,
  X,
  Check,
  Zap,
  Sliders,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Radio
} from 'lucide-react';
import { 
  generateStreamCandidates, 
  StreamCandidate, 
  KNOWN_CHANNEL_DIRECT_VIDEOS, 
  KNOWN_CHANNEL_SESSION_HASHES 
} from '../lib/streamRelocator';
import { endLiveStream } from '../lib/streamSyncService';

interface UltraVideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  lectureId?: string;
  isLive?: boolean;
  onToggleTheater?: () => void;
  isTheater?: boolean;
  onStreamEnded?: (id: string) => void;
}

export const UltraVideoPlayer: React.FC<UltraVideoPlayerProps> = ({ 
  url, 
  poster,
  title = "Ultra Stream",
  lectureId,
  isLive = false,
  onToggleTheater,
  isTheater = false,
  onStreamEnded
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // Audio Booster Ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const networkErrorCountRef = useRef<number>(0);
  const isCleaningUpRef = useRef<boolean>(false);

  // Stream Candidates
  const [candidates, setCandidates] = useState<StreamCandidate[]>([]);
  const [activeCandidateIndex, setActiveCandidateIndex] = useState(0);
  const [isNativeFallback, setIsNativeFallback] = useState(false);

  // Playback State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  
  // Volume & Audio Booster (up to 200%)
  const [volume, setVolume] = useState(1);
  const [boostLevel, setBoostLevel] = useState<number>(100); // 100% to 200%
  const [isMuted, setIsMuted] = useState(false);

  // Speed & Quality
  const [playbackRate, setPlaybackRate] = useState(1);
  const [availableQualities, setAvailableQualities] = useState<{ id: number; label: string; height?: number }[]>([]);
  const [currentQualityId, setCurrentQualityId] = useState<number>(-1); // -1 is Auto
  
  // A-B Loop State
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);

  // Visual & UI States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'none' | 'speed' | 'quality' | 'booster' | 'sleep' | 'mirror' | 'hud'>('none');
  const [screenshotFlash, setScreenshotFlash] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [ambientGlow, setAmbientGlow] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stream Candidate Setup
  useEffect(() => {
    const list = generateStreamCandidates(url);
    setCandidates(list);
    setActiveCandidateIndex(0);
    setIsNativeFallback(false);
    setError(null);
  }, [url]);

  const activeCandidate = candidates[activeCandidateIndex] || {
    label: 'Primary Node',
    url: url,
    quality: 'Auto'
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Setup Web Audio Gain Booster (Safe on user gesture, only when boost > 100)
  const setupAudioBooster = useCallback(() => {
    const video = videoRef.current;
    if (!video || audioCtxRef.current || boostLevel <= 100) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      const source = ctx.createMediaElementSource(video);
      source.connect(gain);
      gain.connect(ctx.destination);

      audioCtxRef.current = ctx;
      gainNodeRef.current = gain;
      sourceNodeRef.current = source;
      gain.gain.value = boostLevel / 100;
    } catch {
      // AudioContext already attached or cross-origin restrictions
    }
  }, [boostLevel]);

  const handleSetBoost = (percent: number) => {
    setBoostLevel(percent);
    setupAudioBooster();
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = percent / 100;
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    triggerToast(`🔊 Audio Boost set to ${percent}%`);
  };

  // Main Player Engine
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    isCleaningUpRef.current = false;
    const streamUrl = activeCandidate.url;
    setLoading(true);
    setError(null);
    networkErrorCountRef.current = 0;

    if (isNativeFallback || (!Hls.isSupported() && video.canPlayType('application/vnd.apple.mpegurl'))) {
      video.src = streamUrl;
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
      return () => {
        isCleaningUpRef.current = true;
        video.src = '';
      };
    }

    if (Hls.isSupported() && streamUrl.includes('.m3u8')) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        autoStartLoad: true
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setLoading(false);
        setError(null);
        networkErrorCountRef.current = 0;
        const levels = data.levels.map((lvl, index) => ({
          id: index,
          label: lvl.height ? `${lvl.height}p` : `Level ${index + 1}`,
          height: lvl.height
        }));
        // Sort highest first
        levels.sort((a, b) => (b.height || 0) - (a.height || 0));
        setAvailableQualities([{ id: -1, label: 'Auto (Adaptive)' }, ...levels]);
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setLoading(false);
            })
            .catch(() => {
              // Autoplay without user gesture blocked: show center play button so user can tap
              setIsPlaying(false);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (isCleaningUpRef.current) return;
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              networkErrorCountRef.current += 1;
              if (networkErrorCountRef.current <= 1) {
                hls?.startLoad();
              } else {
                hls?.destroy();
                setLoading(false);
                setError('Primary stream node unreachable. Switching to backup mirror...');
                handleNextCandidate();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              hls?.destroy();
              setLoading(false);
              setError('Primary mirror failed. Attempting next secure node...');
              handleNextCandidate();
              break;
          }
        }
      });

      return () => {
        isCleaningUpRef.current = true;
        hls?.destroy();
        hlsRef.current = null;
      };
    } else {
      video.src = streamUrl;
      video.load();
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setLoading(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
      return () => {
        isCleaningUpRef.current = true;
        video.src = '';
      };
    }
  }, [activeCandidate.url, isNativeFallback]);

  // A-B Looping Check & Sleep Timer
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const cur = video.currentTime;
      setCurrentTime(cur);

      // Check A-B Loop
      if (isLooping && loopA !== null && loopB !== null && loopB > loopA) {
        if (cur >= loopB) {
          video.currentTime = loopA;
        }
      }

      // Buffer progress
      if (video.buffered.length > 0) {
        for (let i = video.buffered.length - 1; i >= 0; i--) {
          if (video.buffered.start(i) <= cur) {
            setBuffered(video.buffered.end(i));
            break;
          }
        }
      }
    };

    const handleEnded = () => {
      triggerToast('🔴 Broadcast ended. Stream moved to recorded archive.');
      const targetId = lectureId || '29342';
      endLiveStream(targetId);
      if (onStreamEnded) {
        onStreamEnded(targetId);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isLooping, loopA, loopB, lectureId, onStreamEnded]);

  const handleManualEndStream = () => {
    const targetId = lectureId || '29342';
    endLiveStream(targetId);
    triggerToast('🔴 Live stream ended by user. Removed from live list.');
    if (onStreamEnded) {
      onStreamEnded(targetId);
    }
  };

  // Sleep Timer Interval
  useEffect(() => {
    if (sleepTimerMinutes === null) {
      setSleepTimerRemaining(null);
      return;
    }

    setSleepTimerRemaining(sleepTimerMinutes * 60);

    const interval = setInterval(() => {
      setSleepTimerRemaining(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          videoRef.current?.pause();
          setSleepTimerMinutes(null);
          triggerToast('🌙 Sleep Timer triggered. Lecture paused.');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerMinutes]);

  const handleNextCandidate = () => {
    if (activeCandidateIndex + 1 < candidates.length) {
      setActiveCandidateIndex(prev => prev + 1);
      triggerToast(`Switching to backup stream mirror #${activeCandidateIndex + 2}`);
    } else {
      setIsNativeFallback(true);
      triggerToast('Switched to Native Direct Decoder fallback.');
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setupAudioBooster();
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  // Seek
  const handleSeek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, seconds), duration);
  };

  const handleJump = (offset: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + offset), duration);
  };

  // Speed
  const handleSetSpeed = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    triggerToast(`⚡ Playback Speed: ${rate}x`);
  };

  // Quality switch (HLS)
  const handleSetQuality = (levelId: number, label: string) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelId;
      setCurrentQualityId(levelId);
      triggerToast(`Resolution set to ${label}`);
    }
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  // Take Instant High-Res Screenshot Note
  const handleTakeScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const timestamp = formatTime(currentTime).replace(/:/g, '-');
      const filename = `flopper-lecture-note-${timestamp}.png`;

      // Trigger flash animation
      setScreenshotFlash(true);
      setTimeout(() => setScreenshotFlash(false), 300);

      // Download
      canvas.toBlob(blob => {
        if (!blob) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        triggerToast(`📸 Note captured at ${formatTime(currentTime)}!`);
      }, 'image/png');
    } catch {
      triggerToast('Unable to capture screenshot due to CORS security.');
    }
  };

  // Picture-in-Picture
  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      triggerToast('Picture-in-Picture not supported in this browser.');
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Mouse move handler for auto-hiding controls
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && activeMenu === 'none') {
        setShowControls(false);
      }
    }, 3200);
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing in inputs
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          onToggleTheater?.();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 's':
          e.preventDefault();
          handleTakeScreenshot();
          break;
        case 'r':
          e.preventDefault();
          setIsLooping(prev => !prev);
          break;
        case 'arrowleft':
          e.preventDefault();
          handleJump(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          handleJump(5);
          break;
        case 'j':
          e.preventDefault();
          handleJump(-10);
          break;
        case 'l':
          e.preventDefault();
          handleJump(10);
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(1, volume + 0.1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, volume - 0.1));
          break;
        case '?':
          setActiveMenu(prev => prev === 'hud' ? 'none' : 'hud');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, volume, onToggleTheater, currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}:${(mins % 60).toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying && activeMenu === 'none') setShowControls(false);
      }}
      className={`relative w-full rounded-3xl overflow-hidden bg-black select-none group font-sans ${
        isTheater ? 'aspect-[21/9]' : 'aspect-video'
      }`}
    >
      {/* Dynamic Glyph Ambient Glow behind player */}
      {ambientGlow && (
        <div 
          className="absolute inset-0 -z-10 blur-3xl opacity-40 transition-opacity duration-1000 pointer-events-none"
          style={{
            background: isPlaying 
              ? 'radial-gradient(circle, rgba(230,0,0,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)'
              : 'none'
          }}
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        poster={poster}
        playsInline
        onClick={togglePlay}
        onPlay={() => {
          setIsPlaying(true);
          setLoading(false);
        }}
        onPause={() => setIsPlaying(false)}
        onCanPlay={() => setLoading(false)}
        onLoadedData={() => setLoading(false)}
        onLoadedMetadata={() => {
          setLoading(false);
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
          }
        }}
        onWaiting={() => {
          if (!videoRef.current?.paused) {
            setLoading(true);
          }
        }}
        onPlaying={() => {
          setIsPlaying(true);
          setLoading(false);
        }}
        onError={() => {
          if (isCleaningUpRef.current) return;
          if (hlsRef.current) return;
          const err = videoRef.current?.error;
          if (err && err.code) {
            setLoading(false);
            handleNextCandidate();
          }
        }}
        className="w-full h-full object-contain cursor-pointer"
      />

      {/* Play/Pause Center Overlay when paused */}
      {!isPlaying && !error && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer z-20 group transition-all"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#E60000] text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 border border-white/20">
            <Play className="w-8 h-8 fill-current ml-1" />
          </div>
        </div>
      )}

      {/* White Flash Effect on Screenshot */}
      {screenshotFlash && (
        <div className="absolute inset-0 bg-white pointer-events-none z-50 animate-ping opacity-75" />
      )}

      {/* Floating HUD Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-black/85 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl text-xs font-doto font-bold text-white shadow-2xl flex items-center gap-2 animate-fade-in uppercase">
          <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Spinner / Buffering */}
      {loading && isPlaying && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-30">
          <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-[#E60000] animate-spin mb-3" />
          <span className="font-doto text-xs font-bold text-neutral-300 tracking-wider uppercase">
            BUFFERING SECURE STREAM...
          </span>
        </div>
      )}

      {/* Error / Fallback Card */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-30 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#E60000]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md">
            <h4 className="text-white font-doto font-bold text-sm uppercase">[ STREAM EXCEPTION ]</h4>
            <p className="text-neutral-400 text-xs">{error}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleNextCandidate}
              className="px-5 py-2.5 bg-white text-black font-doto font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-[#E60000] hover:text-white transition-colors shadow-lg"
            >
              SWITCH TO BACKUP MIRROR
            </button>
            <button
              onClick={() => {
                const chanMatch = url.match(/\/(\d+)\//);
                const chId = chanMatch ? chanMatch[1] : '';
                const directVideo = KNOWN_CHANNEL_DIRECT_VIDEOS[chId];
                const sessionHash = KNOWN_CHANNEL_SESSION_HASHES[chId];

                if (directVideo) {
                  triggerToast('⚡ Switched to Direct Normal Video from Server');
                  setCandidates(prev => [{ label: 'Direct Server Video (Fast MP4)', url: directVideo, quality: '720p Direct', isPrimary: true }, ...prev]);
                  setActiveCandidateIndex(0);
                  setError(null);
                  return;
                }

                if (sessionHash) {
                  const fixedHls = `https://dbil3go8szhu6.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${chId}/${sessionHash}/index_2.m3u8`;
                  triggerToast('⚡ Reconstructed Verified CloudFront Stream');
                  setCandidates(prev => [{ label: 'Verified HLS Stream (480p)', url: fixedHls, quality: '480p Verified', isPrimary: true }, ...prev]);
                  setActiveCandidateIndex(0);
                  setError(null);
                  return;
                }

                triggerToast('🔑 Resolving via StudyPanda & StudyBee Gateway Node...');
                const studyBeeRelay = `https://nt.studybeepro.site/api/foy?stream_url=${encodeURIComponent(url)}`;
                setCandidates(prev => [{ label: 'StudyBee / StudyPanda Verified Node', url: studyBeeRelay, quality: 'Verified 480p', isPrimary: true }, ...prev]);
                setActiveCandidateIndex(0);
                setError(null);
              }}
              className="px-5 py-2.5 bg-red-950 border border-red-500/40 text-white font-doto font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-red-900 transition-colors shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>RESOLVE VIA STUDYPANDA / STUDYBEE</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Header Overlay */}
      <div 
        className={`absolute top-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 flex items-center justify-between z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E60000] shadow-[0_0_10px_#E60000] animate-pulse" />
          <h3 className="text-xs sm:text-sm font-bold text-white font-doto tracking-wide uppercase line-clamp-1 max-w-sm sm:max-w-md">
            {title}
          </h3>
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-neutral-300 uppercase border border-white/10">
            {boostLevel > 100 ? `${boostLevel}% BOOST` : 'ULTRA HD'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* End Live Stream Button */}
          {isLive && (
            <button
              onClick={handleManualEndStream}
              className="px-3 py-1 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-doto font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5 transition-all btn-click-effect"
              title="Turn off live stream and archive class"
            >
              <Radio className="w-3 h-3 text-white animate-pulse" />
              <span>END STREAM</span>
            </button>
          )}

          {/* A-B Loop Indicator */}
          {isLooping && (
            <div className="px-2.5 py-1 rounded-xl bg-[#E60000]/20 border border-[#E60000]/40 text-[#E60000] text-[10px] font-doto font-bold uppercase flex items-center gap-1.5 animate-pulse">
              <Repeat className="w-3 h-3" />
              <span>LOOP [{loopA ? formatTime(loopA) : '0:00'} - {loopB ? formatTime(loopB) : 'END'}]</span>
            </div>
          )}

          {/* Sleep Timer Display */}
          {sleepTimerRemaining !== null && (
            <div className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-white text-[10px] font-mono flex items-center gap-1.5">
              <Moon className="w-3 h-3 text-neutral-300" />
              <span>{Math.floor(sleepTimerRemaining / 60)}m left</span>
            </div>
          )}

          {/* Keyboard Shortcuts Trigger */}
          <button
            onClick={() => setActiveMenu(prev => prev === 'hud' ? 'none' : 'hud')}
            className="w-8 h-8 rounded-xl bg-black/60 hover:bg-white/10 border border-white/10 text-neutral-300 hover:text-white flex items-center justify-center text-xs transition-colors"
            title="Keyboard Shortcuts Cheat Sheet (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Big Play / Pause Touch Area */}
      <div 
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center z-20 cursor-pointer"
      >
        {!isPlaying && !loading && (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-110 active:scale-95">
            <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div 
        className={`absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent transition-opacity duration-300 z-30 space-y-3 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress & Scrubber Bar with Buffer Indicator */}
        <div className="relative group/scrubber flex items-center">
          <div className="relative w-full h-1.5 hover:h-3 rounded-full bg-white/15 cursor-pointer transition-all overflow-hidden">
            {/* Buffered */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-white/25 transition-all"
              style={{ width: `${(buffered / (duration || 1)) * 100}%` }}
            />
            {/* Played */}
            <div 
              className="absolute left-0 top-0 bottom-0 bg-[#E60000] shadow-[0_0_10px_#E60000] transition-all"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            {/* Loop Segment Markers */}
            {loopA !== null && duration > 0 && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white z-10"
                style={{ left: `${(loopA / duration) * 100}%` }}
              />
            )}
            {loopB !== null && duration > 0 && (
              <div 
                className="absolute top-0 bottom-0 w-1 bg-white z-10"
                style={{ left: `${(loopB / duration) * 100}%` }}
              />
            )}
          </div>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs font-doto">
          {/* Left Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
            </button>

            {/* Jump -10s */}
            <button
              onClick={() => handleJump(-10)}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="Skip back 10 seconds (J / ←)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Jump +10s */}
            <button
              onClick={() => handleJump(10)}
              className="w-8 h-8 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
              title="Skip forward 10 seconds (L / →)"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume Control + Booster */}
            <div className="flex items-center gap-2 group/volume relative">
              <button 
                onClick={toggleMute}
                className="w-8 h-8 rounded-xl hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center transition-colors"
                title="Mute / Unmute (M)"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-16 h-1 accent-[#E60000] cursor-pointer hidden sm:inline-block"
              />

              {/* 200% Audio Gain Booster Switch */}
              <button
                onClick={() => setActiveMenu(prev => prev === 'booster' ? 'none' : 'booster')}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors ${
                  boostLevel > 100 
                    ? 'bg-[#E60000] text-white shadow-[0_0_10px_#E60000]' 
                    : 'bg-white/10 text-neutral-400 hover:text-white'
                }`}
                title="Audio Gain Booster (up to 200% volume)"
              >
                {boostLevel}%
              </button>
            </div>

            {/* Current Time / Duration */}
            <span className="text-[11px] font-mono text-neutral-400">
              <strong className="text-white">{formatTime(currentTime)}</strong> / {formatTime(duration)}
            </span>
          </div>

          {/* Right Action Hub */}
          <div className="flex items-center gap-2">
            {/* Snapshot Note Button */}
            <button
              onClick={handleTakeScreenshot}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white flex items-center gap-1.5 transition-colors uppercase text-[10px] font-bold"
              title="Instant Screenshot Note (S)"
            >
              <Camera className="w-3.5 h-3.5 text-[#E60000]" />
              <span className="hidden sm:inline">SNAP NOTE</span>
            </button>

            {/* A-B Loop Button */}
            <button
              onClick={() => {
                if (!isLooping) {
                  setLoopA(currentTime);
                  setLoopB(Math.min(duration, currentTime + 30));
                  setIsLooping(true);
                  triggerToast('🔁 A-B Loop set for 30s. Click again to clear.');
                } else {
                  setIsLooping(false);
                  setLoopA(null);
                  setLoopB(null);
                  triggerToast('Loop cleared.');
                }
              }}
              className={`p-2 rounded-xl transition-colors ${
                isLooping ? 'bg-[#E60000] text-white' : 'hover:bg-white/10 text-neutral-400 hover:text-white'
              }`}
              title="A-B Section Loop (L)"
            >
              <Repeat className="w-4 h-4" />
            </button>

            {/* Speed Dial Trigger */}
            <button
              onClick={() => setActiveMenu(prev => prev === 'speed' ? 'none' : 'speed')}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors"
              title="Playback Speed"
            >
              {playbackRate}x
            </button>

            {/* Quality Switcher Trigger */}
            <button
              onClick={() => setActiveMenu(prev => prev === 'quality' ? 'none' : 'quality')}
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold transition-colors uppercase"
              title="Video Quality"
            >
              {currentQualityId === -1 
                ? 'AUTO' 
                : availableQualities.find(q => q.id === currentQualityId)?.label || 'AUTO'}
            </button>

            {/* Sleep Timer Trigger */}
            <button
              onClick={() => setActiveMenu(prev => prev === 'sleep' ? 'none' : 'sleep')}
              className={`p-2 rounded-xl transition-colors ${
                sleepTimerMinutes !== null ? 'bg-white text-black' : 'hover:bg-white/10 text-neutral-400 hover:text-white'
              }`}
              title="Sleep Timer"
            >
              <Moon className="w-4 h-4" />
            </button>

            {/* Theater Mode Toggle */}
            {onToggleTheater && (
              <button
                onClick={onToggleTheater}
                className={`p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors hidden sm:block ${
                  isTheater ? 'text-white' : ''
                }`}
                title="Theater Mode (T)"
              >
                <Tv className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Flyout Modal Menus (Speed, Quality, Booster, Sleep, HUD) */}
      {activeMenu !== 'none' && (
        <div 
          onClick={() => setActiveMenu('none')}
          className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-sm bg-[#09090d] border border-white/15 rounded-3xl p-5 text-white shadow-2xl space-y-4 font-doto uppercase"
          >
            {/* Speed Menu */}
            {activeMenu === 'speed' && (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E60000]" />
                    PLAYBACK SPEED DIAL
                  </h4>
                  <button onClick={() => setActiveMenu('none')} className="text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        handleSetSpeed(s);
                        setActiveMenu('none');
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                        playbackRate === s
                          ? 'bg-[#E60000] border-[#E60000] text-white shadow-[0_0_15px_rgba(230,0,0,0.5)]'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Quality Menu */}
            {activeMenu === 'quality' && (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#E60000]" />
                    STREAM QUALITY RESOLUTION
                  </h4>
                  <button onClick={() => setActiveMenu('none')} className="text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 font-mono">
                  {availableQualities.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => {
                        handleSetQuality(q.id, q.label);
                        setActiveMenu('none');
                      }}
                      className={`w-full p-3 rounded-2xl text-xs font-bold transition-all border flex items-center justify-between ${
                        currentQualityId === q.id
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      <span>{q.label}</span>
                      {currentQualityId === q.id && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Audio Booster Menu */}
            {activeMenu === 'booster' && (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold tracking-wider flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-[#E60000]" />
                    AUDIO GAIN BOOSTER
                  </h4>
                  <button onClick={() => setActiveMenu('none')} className="text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-neutral-400 font-sans normal-case leading-relaxed">
                  Boosts low instructor microphones up to 200% via Web Audio Hardware Gain.
                </p>
                <div className="grid grid-cols-4 gap-2 font-mono">
                  {[100, 125, 150, 200].map((b) => (
                    <button
                      key={b}
                      onClick={() => {
                        handleSetBoost(b);
                        setActiveMenu('none');
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                        boostLevel === b
                          ? 'bg-[#E60000] border-[#E60000] text-white shadow-[0_0_15px_rgba(230,0,0,0.5)]'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      {b}%
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Sleep Timer Menu */}
            {activeMenu === 'sleep' && (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold tracking-wider flex items-center gap-2">
                    <Moon className="w-4 h-4 text-neutral-300" />
                    AUTO-SLEEP TIMER
                  </h4>
                  <button onClick={() => setActiveMenu('none')} className="text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  {[
                    { label: 'Off', val: null },
                    { label: '15 Minutes', val: 15 },
                    { label: '30 Minutes', val: 30 },
                    { label: '45 Minutes', val: 45 },
                    { label: '60 Minutes', val: 60 }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setSleepTimerMinutes(item.val);
                        setActiveMenu('none');
                        triggerToast(item.val ? `Sleep timer set for ${item.val} minutes` : 'Sleep timer disabled');
                      }}
                      className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                        sleepTimerMinutes === item.val
                          ? 'bg-white text-black border-white shadow-lg'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Keyboard Shortcuts HUD */}
            {activeMenu === 'hud' && (
              <>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="text-sm font-bold tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#E60000]" />
                    KEYBOARD SHORTCUTS
                  </h4>
                  <button onClick={() => setActiveMenu('none')} className="text-neutral-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  {[
                    { key: 'SPACE / K', desc: 'Play / Pause' },
                    { key: 'F', desc: 'Toggle Fullscreen' },
                    { key: 'T', desc: 'Toggle Theater Mode' },
                    { key: 'M', desc: 'Mute / Unmute' },
                    { key: 'S', desc: 'Capture Instant Note' },
                    { key: 'R', desc: 'Toggle A-B Repeat Loop' },
                    { key: '← / →', desc: 'Seek 5 Seconds' },
                    { key: 'J / L', desc: 'Seek 10 Seconds' },
                    { key: '↑ / ↓', desc: 'Volume Level' }
                  ].map((hk) => (
                    <div key={hk.key} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="px-2 py-0.5 rounded bg-black border border-white/20 text-white font-bold">{hk.key}</span>
                      <span className="text-neutral-400">{hk.desc}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
