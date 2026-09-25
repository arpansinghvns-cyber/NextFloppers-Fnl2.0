import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Key, 
  User, 
  Lock, 
  LogIn, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Award,
  Crown
} from 'lucide-react';
import { FlopperUser } from '../types';
import { 
  claimInstantFlopperPass, 
  loginFlopper, 
  FLOPPER_AVATARS, 
  TIER_CONFIG 
} from '../lib/flopperAuth';

interface FlopperLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: FlopperUser) => void;
}

export const FlopperLoginModal: React.FC<FlopperLoginModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess
}) => {
  const [tab, setTab] = useState<'instant' | 'login' | 'register'>('instant');
  
  // Login form state
  const [loginQuery, setLoginQuery] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regHandle, setRegHandle] = useState('');
  const [regAvatar, setRegAvatar] = useState('bee');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstantClaim = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        const user = claimInstantFlopperPass(regName || 'Flopper Student');
        onAuthSuccess(user);
        onClose();
      } catch (err: any) {
        setError('Failed to claim pass: ' + err.message);
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginQuery.trim()) {
      setError('Please provide your Flopper ID or Email');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const user = loginFlopper(loginQuery, loginPass);
        onAuthSuccess(user);
        onClose();
      } catch (err: any) {
        setError('Login failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const flopperId = regHandle.trim() 
          ? (regHandle.startsWith('@') ? regHandle : `@${regHandle}`)
          : `FLOP-${Math.floor(1000 + Math.random() * 9000)}-MEMBER`;
        
        const user = loginFlopper(flopperId);
        user.name = regName.trim();
        user.avatar = regAvatar;
        onAuthSuccess(user);
        onClose();
      } catch (err: any) {
        setError('Registration failed: ' + err.message);
      } finally {
        setLoading(false);
      }
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-[#111115] border border-white/10 w-full max-w-lg rounded-3xl p-6 sm:p-8 relative shadow-2xl modal-glass max-h-[92vh] overflow-y-auto flowy-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/20 to-orange-500/10 border border-amber-400/30 mb-3 shadow-lg shadow-amber-500/10">
            <Crown className="w-7 h-7 text-[#FACC15]" />
          </div>
          <h2 className="text-2xl font-black italic tracking-wide text-white uppercase font-syne">
            NEXT <span className="text-[#FACC15]">FLOPPERS</span> SOCIETY
          </h2>
          <p className="text-stone-400 text-xs font-medium uppercase tracking-widest mt-1">
            Exclusive Student Identity & VIP Pass
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#17171d] rounded-2xl border border-white/5 mb-6">
          <button
            onClick={() => { setTab('instant'); setError(null); }}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'instant'
                ? 'bg-amber-400 text-black shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Pass</span>
          </button>

          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'login'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Flopper Login</span>
          </button>

          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'register'
                ? 'bg-white/10 text-white shadow-md'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mint Identity</span>
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: 1-Click Instant Pass */}
        {tab === 'instant' && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/20">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xl">🐝</span>
                <h4 className="text-sm font-bold text-white font-syne">Instant VIP Member Pass</h4>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed mb-3">
                No passwords or email confirmations needed! Claim a dedicated Flopper Pass ID with pre-authorized CloudFront streaming, study notes scratchpad, and customizable fonts.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>CloudFront Stream Decrypt</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Custom Fonts & Themes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Karma & Streak Tracker</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full CBT Test Suite</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Your Preferred Name / Nickname (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Prashant Flopper or Board Slayer"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs sm:text-sm focus:border-amber-400/50 focus:bg-[#1d1d26] outline-none"
              />
            </div>

            <button
              onClick={handleInstantClaim}
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all btn-click-effect shadow-lg shadow-amber-400/20 font-syne flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Generating Identity...</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Claim Instant Flopper Pass & Enter</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: Member Login */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Flopper ID, Handle or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-stone-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLOP-8921-X, @flopperking, or email"
                  value={loginQuery}
                  onChange={(e) => setLoginQuery(e.target.value)}
                  className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs sm:text-sm focus:border-amber-400/50 focus:bg-[#1d1d26] outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Passcode / PIN (Optional for pass holders)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-stone-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Enter passcode (or leave blank if using Flopper ID)"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-xs sm:text-sm focus:border-amber-400/50 focus:bg-[#1d1d26] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#FACC15] hover:bg-yellow-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all btn-click-effect shadow-md font-syne flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Authenticating...' : 'Enter Next Floppers Portal'}
            </button>
          </form>
        )}

        {/* TAB 3: Mint Custom Identity */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Choose Flopper Avatar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {FLOPPER_AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setRegAvatar(av.id)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      regAvatar === av.id
                        ? 'bg-amber-400/20 border-amber-400 text-white scale-105'
                        : 'bg-[#18181f] border-white/5 text-stone-400 hover:text-white'
                    }`}
                  >
                    <div className="text-2xl mb-1">{av.icon}</div>
                    <div className="text-[10px] font-bold truncate">{av.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Your Real or Display Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aryan Topper-Crusher"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs sm:text-sm focus:border-amber-400/50 focus:bg-[#1d1d26] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Custom Handle / Flopper Tag (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. @topper_destroyer"
                value={regHandle}
                onChange={(e) => setRegHandle(e.target.value)}
                className="w-full bg-[#18181f] border border-white/10 rounded-xl py-2.5 px-4 text-white text-xs sm:text-sm focus:border-amber-400/50 focus:bg-[#1d1d26] outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all btn-click-effect shadow-md font-syne flex items-center justify-center gap-2 mt-2"
            >
              {loading ? 'Minting Identity...' : 'Mint Flopper Identity & Launch'}
            </button>
          </form>
        )}

        {/* Footer info note */}
        <div className="mt-6 pt-5 border-t border-white/5 text-center">
          <p className="text-[11px] text-stone-400">
            Next Floppers Exclusive Identity • 100% Free • Direct Stream Unlocked
          </p>
        </div>
      </div>
    </div>
  );
};
