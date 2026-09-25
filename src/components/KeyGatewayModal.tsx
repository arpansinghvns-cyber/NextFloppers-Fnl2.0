import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Crown, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Copy,
  Check,
  Zap,
  Lock
} from 'lucide-react';
import { Logo } from './Logo';
import { 
  submitUserKey, 
  generateKeyFromAdProcess, 
  isFloppyAdminUser,
  getKeyTimeRemaining 
} from '../lib/keyService';

interface KeyGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyActivated: (key: string, isAdmin?: boolean) => void;
  requiredForTitle?: string;
}

export const KeyGatewayModal: React.FC<KeyGatewayModalProps> = ({
  isOpen,
  onClose,
  onKeyActivated,
  requiredForTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'ad_checkpoint' | 'enter_key'>('ad_checkpoint');
  
  // Enter key tab state
  const [keyInput, setKeyInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ad & Redirection Checkpoint State
  // Step 1: 'waiting_ad' (countdown) -> Step 2: 'ready_redirect' -> Step 3: 'redirecting' -> Step 4: 'completed'
  const [adStep, setAdStep] = useState<'idle' | 'countdown' | 'ready_redirect' | 'verifying' | 'success'>('idle');
  const [countdown, setCountdown] = useState(8);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setCopiedKey(false);
      // Reset ad process if not already completed
      if (adStep === 'idle') {
        setAdStep('countdown');
        setCountdown(8);
      }
    }
  }, [isOpen]);

  // Countdown timer for Ad viewing step
  useEffect(() => {
    let timer: any;
    if (isOpen && adStep === 'countdown') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      } else {
        setAdStep('ready_redirect');
      }
    }
    return () => clearTimeout(timer);
  }, [isOpen, adStep, countdown]);

  if (!isOpen) return null;

  // Handle Manual Key or FloppyAdmin submission
  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const res = submitUserKey(keyInput);
    if (res.success && res.key) {
      onKeyActivated(res.key, res.isAdmin);
      onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  // Step 2: User clicks external redirection checkpoint
  const handleStartRedirection = () => {
    setAdStep('verifying');

    // Simulate opening partner sponsored redirection link
    try {
      window.open('https://t.me/nexttoppers_official', '_blank', 'noopener,noreferrer');
    } catch {
      // Browser popup blocked, continue smoothly
    }

    // Verification check timer (3 seconds)
    setTimeout(() => {
      const minted = generateKeyFromAdProcess();
      setGeneratedKey(minted.key);
      setAdStep('success');
      onKeyActivated(minted.key, false);
    }, 3200);
  };

  const handleCopyGeneratedKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div 
        className="bg-[#111116] border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl modal-glass max-h-[94vh] overflow-y-auto flowy-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center mb-3">
            <Logo size="lg" />
          </div>
          <h2 className="text-2xl font-black italic tracking-wide text-white uppercase font-syne flex items-center justify-center gap-2">
            <span>KEY</span>
            <span className="text-[#FACC15]">VERIFICATION</span>
            <span>GATEWAY</span>
          </h2>
          <p className="text-stone-400 text-xs font-medium mt-1.5 leading-relaxed">
            {requiredForTitle ? (
              <span>Access required for <strong className="text-white">"{requiredForTitle}"</strong></span>
            ) : (
              <span>An active 24H Flopper Pass is required to unlock DRM streams & study materials.</span>
            )}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#17171f] rounded-2xl border border-white/5 mb-6">
          <button
            onClick={() => setActiveTab('ad_checkpoint')}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ad_checkpoint'
                ? 'bg-[#FACC15] text-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Pass (Ad-Process)</span>
          </button>

          <button
            onClick={() => setActiveTab('enter_key')}
            className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'enter_key'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Enter Key / FloppyAdmin</span>
          </button>
        </div>

        {/* TAB 1: Ad & Redirection Checkpoint Process */}
        {activeTab === 'ad_checkpoint' && (
          <div className="space-y-4">
            
            {/* Step 1 & 2: Countdown & Sponsored Banner */}
            {(adStep === 'countdown' || adStep === 'ready_redirect') && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#161622] border border-white/10 relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FACC15] flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#FACC15]" />
                      <span>SPONSORED CHECKPOINT STEP 1 OF 2</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-stone-400">
                      {adStep === 'countdown' ? `${countdown}s remaining` : 'Ready!'}
                    </span>
                  </div>

                  {/* Simulated High-Efficiency Sponsor Card */}
                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 my-2.5">
                    <div className="text-xs font-bold text-white mb-1 flex items-center gap-2">
                      <span>⚡ Next Floppers Study Booster & Telegram Vault</span>
                    </div>
                    <p className="text-[11px] text-stone-400 leading-snug">
                      Join 50,000+ Class 9th, 10th, 11th & 12th students getting daily DPPs, handwritten formula sheets & direct mirrors.
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#FACC15] to-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
                      style={{ width: `${Math.round(((8 - countdown) / 8) * 100)}%` }}
                    />
                  </div>
                </div>

                {adStep === 'countdown' ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-stone-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                  >
                    <Clock className="w-4 h-4 animate-spin text-stone-500" />
                    <span>Please wait {countdown}s to unlock checkpoint link...</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRedirection}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FACC15] to-[#F59E0B] hover:brightness-110 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all btn-click-effect shadow-lg font-syne"
                  >
                    <span>Proceed to Redirection Checkpoint</span>
                    <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
                  </button>
                )}
              </div>
            )}

            {/* Step 3: Verifying Redirection */}
            {adStep === 'verifying' && (
              <div className="p-8 text-center rounded-2xl bg-[#161622] border border-white/10 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-[#FACC15] border-t-transparent animate-spin mb-1" />
                <h4 className="text-sm font-bold text-white font-syne">
                  Verifying Redirection Checkpoint...
                </h4>
                <p className="text-xs text-stone-400 max-w-xs">
                  Validating sponsored task completion and minting your authentic 24-hour pass in Firebase.
                </p>
              </div>
            )}

            {/* Step 4: Success & Key Minted */}
            {adStep === 'success' && generatedKey && (
              <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-500/10 via-[#14141d] to-[#14141d] border border-emerald-500/30 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-white font-syne">
                    Pass Successfully Unlocked!
                  </h4>
                  <p className="text-xs text-stone-400 mt-1">
                    Your key has been registered and activated on this device for the next 24 hours.
                  </p>
                </div>

                {/* Key Pill Display */}
                <div className="p-3 bg-black/70 border border-white/10 rounded-xl flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 truncate">
                    {generatedKey}
                  </span>
                  <button
                    onClick={handleCopyGeneratedKey}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white transition-colors shrink-0 text-xs flex items-center gap-1 font-bold"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-[#FACC15] hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all btn-click-effect shadow-md font-syne"
                >
                  Start Studying Now
                </button>
              </div>
            )}

            <div className="text-[11px] text-stone-500 leading-relaxed text-center">
              <span>Generating a pass supports the server infrastructure for free education. Passes remain valid for 24 hours per session.</span>
            </div>
          </div>
        )}

        {/* TAB 2: Enter Existing Key or FloppyAdmin Master Bypass */}
        {activeTab === 'enter_key' && (
          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
                Enter Key or Admin Bypass Code:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="e.g. SB-FLOP-XXXX-XXXX or floppyadmin"
                  className="w-full bg-[#181822] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-600 focus:outline-none focus:border-[#FACC15] font-mono transition-colors"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Tip: Enter <span className="font-mono text-[#FACC15] font-bold">floppyadmin</span> for permanent admin bypass with zero ads.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#FACC15] hover:bg-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all btn-click-effect shadow-md font-syne flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Activate Key</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default KeyGatewayModal;
