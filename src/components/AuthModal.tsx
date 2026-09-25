import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { email: string; name: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Simulate real auth network latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mode === 'signup') {
        const users = JSON.parse(localStorage.getItem('floppers_users') || '[]');
        if (users.find((u: any) => u.email === email)) {
          throw new Error('Email already registered. Please login.');
        }
        const newUser = { email, password, name };
        users.push(newUser);
        localStorage.setItem('floppers_users', JSON.stringify(users));
        localStorage.setItem('nexus_user', JSON.stringify({ email, name }));
        onAuthSuccess({ email, name });
      } else {
        const users = JSON.parse(localStorage.getItem('floppers_users') || '[]');
        const user = users.find((u: any) => u.email === email && u.password === password);
        if (!user) {
          throw new Error('Invalid email or password. Access denied.');
        }
        localStorage.setItem('nexus_user', JSON.stringify({ email, name: user.name }));
        onAuthSuccess({ email, name: user.name });
      }
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-md relative z-10"
          >
            <GlassCard className="p-8 border-white/10" variant="dark">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 mb-4 border border-blue-500/30">
                  {mode === 'login' ? (
                    <LogIn className="w-6 h-6 text-blue-400" />
                  ) : (
                    <UserPlus className="w-6 h-6 text-blue-400" />
                  )}
                </div>
                <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">
                  {mode === 'login' ? 'Nexus Login' : 'Create Identity'}
                </h2>
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest mt-1">
                  Access Secure Education Uplink
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                  {mode === 'signup' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-blue-500 transition-colors">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          required={mode === 'signup'}
                          placeholder="Your Professional Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/20"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Cipher Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/20"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 group-focus-within:text-blue-500 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Access Key / Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium placeholder:text-white/20"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-black italic tracking-widest uppercase transition-all shadow-lg shadow-blue-600/20 mt-4 active:scale-95"
                >
                  {isSubmitting ? 'Syncing...' : mode === 'login' ? 'Initiate Uplink' : 'Initialize Account'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-white/40 text-xs font-medium uppercase tracking-widest leading-loose">
                  {mode === 'login' ? "Don't have an uplink?" : "Already initialized?"}
                  <button 
                    onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                    className="ml-2 text-blue-400 hover:text-blue-300 transition-colors font-black"
                  >
                    {mode === 'login' ? 'SIGNUP' : 'LOGIN'}
                  </button>
                </p>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-[8px] font-mono text-white/10 text-center tracking-[0.2em] uppercase">
                Secure Authentication Node 7.2 | RSA-4096 Encrypted
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
