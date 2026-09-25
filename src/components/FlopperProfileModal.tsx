import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Crown, 
  Flame, 
  Zap, 
  Palette, 
  Type, 
  BookOpen, 
  Plus, 
  Trash2, 
  LogOut, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { FlopperUser, FlopperNote, ThemeId, FontId } from '../types';
import { 
  FLOPPER_AVATARS, 
  TIER_CONFIG, 
  addFlopperNote, 
  removeFlopperNote 
} from '../lib/flopperAuth';
import { THEMES, FONTS } from '../lib/themeManager';

interface FlopperProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: FlopperUser;
  onUpdateUser: (user: FlopperUser) => void;
  onLogout: () => void;
  onOpenThemeCustomizer: () => void;
}

export const FlopperProfileModal: React.FC<FlopperProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onLogout,
  onOpenThemeCustomizer
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notes' | 'perks'>('profile');

  // New note form state
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('Science');
  const [showAddNote, setShowAddNote] = useState(false);

  if (!isOpen) return null;

  const currentAvatar = FLOPPER_AVATARS.find(a => a.id === user.avatar) || FLOPPER_AVATARS[0];
  const tierInfo = TIER_CONFIG[user.tier] || TIER_CONFIG.initiate;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.flopperId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    const updated = addFlopperNote(newNoteTitle, newNoteContent, newNoteSubject);
    if (updated) {
      onUpdateUser(updated);
      setNewNoteTitle('');
      setNewNoteContent('');
      setShowAddNote(false);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    const updated = removeFlopperNote(noteId);
    if (updated) {
      onUpdateUser(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="bg-[#101015] border border-white/10 w-full max-w-xl rounded-3xl p-6 sm:p-7 relative shadow-2xl modal-glass max-h-[92vh] overflow-y-auto flowy-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Digital Hologram Identity Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#181822] to-cyan-500/10 border border-white/15 relative overflow-hidden mb-6 shadow-xl">
          {/* Subtle background circuit styling */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-28 h-28 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-black/50 border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
                {currentAvatar.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white font-syne truncate max-w-[200px]">
                    {user.name}
                  </h3>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${tierInfo.color}`}>
                    {tierInfo.badge} {tierInfo.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {user.flopperId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 text-stone-400 hover:text-white transition-colors text-[10px] flex items-center gap-1"
                    title="Copy Flopper ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats pill */}
            <div className="flex items-center gap-3 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10 self-stretch sm:self-auto justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 font-bold text-xs">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{user.streakDays}d</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-stone-500">Streak</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-cyan-400 font-bold text-xs">
                  <Zap className="w-3.5 h-3.5 fill-cyan-400" />
                  <span>{user.karmaXp}</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-stone-500">Karma XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[#16161c] rounded-xl border border-white/5 mb-5 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'profile' ? 'bg-white/10 text-white shadow-sm' : 'text-stone-400 hover:text-white'
            }`}
          >
            My Identity
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'notes' ? 'bg-white/10 text-white shadow-sm' : 'text-stone-400 hover:text-white'
            }`}
          >
            <span>Study Notes</span>
            {user.savedNotes?.length > 0 && (
              <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {user.savedNotes.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('perks')}
            className={`py-2 rounded-lg transition-all ${
              activeTab === 'perks' ? 'bg-white/10 text-white shadow-sm' : 'text-stone-400 hover:text-white'
            }`}
          >
            Society Perks
          </button>
        </div>

        {/* TAB 1: Profile & Customization Quick Launch */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#14141a] border border-white/5 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Custom Fonts & Atmosphere</span>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Change font to Space Grotesk, Outfit, Syne, or JetBrains Mono.
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenThemeCustomizer();
                }}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all btn-click-effect"
              >
                Customize
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#14141a] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                  Rank Progression
                </span>
                <span className="text-xs font-mono text-amber-300 font-bold">
                  {user.karmaXp} XP
                </span>
              </div>
              <div className="w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-white/5 mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (user.karmaXp / 1200) * 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-stone-400">
                <span>Current: {tierInfo.name}</span>
                <span>Next Tier: 1,200 XP (Overlord)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-all flex items-center gap-2 btn-click-effect"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch / Disconnect Identity</span>
              </button>

              <span className="text-[10px] text-stone-500">
                Joined: {user.joinedAt}
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: Notes Scratchpad */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Personal Lecture Notes ({user.savedNotes?.length || 0})
              </h4>
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="px-3 py-1.5 bg-amber-400 text-black text-xs font-bold rounded-lg flex items-center gap-1.5 btn-click-effect"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddNote ? 'Cancel' : 'New Note'}</span>
              </button>
            </div>

            {/* Add note sub-form */}
            {showAddNote && (
              <form onSubmit={handleSaveNote} className="p-4 rounded-xl bg-[#14141a] border border-amber-400/30 space-y-3">
                <input
                  type="text"
                  placeholder="Note Title (e.g. Chemical Equations Balancing Rules)"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-400"
                />
                <textarea
                  required
                  rows={3}
                  placeholder="Key concepts, formulas, or timestamps..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs text-white outline-none focus:border-amber-400 flowy-scroll"
                />
                <div className="flex items-center justify-between">
                  <select
                    value={newNoteSubject}
                    onChange={(e) => setNewNoteSubject(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg py-1 px-2.5 text-xs text-stone-300"
                  >
                    <option value="Science">Science</option>
                    <option value="Maths">Maths</option>
                    <option value="SST">SST</option>
                    <option value="English">English</option>
                    <option value="General">General</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-400 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg"
                  >
                    Save Note (+15 XP)
                  </button>
                </div>
              </form>
            )}

            {/* Note items list */}
            {(!user.savedNotes || user.savedNotes.length === 0) ? (
              <div className="py-10 text-center text-stone-500 text-xs bg-black/20 rounded-xl border border-white/5">
                No notes saved yet. Write down formulas and chapter summaries here!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[280px] overflow-y-auto flowy-scroll pr-1">
                {user.savedNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="p-3.5 rounded-xl bg-[#14141a] border border-white/5 hover:border-white/15 transition-all text-left"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {note.subject || 'Note'}
                        </span>
                        <h5 className="font-bold text-xs text-white">{note.title}</h5>
                      </div>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-stone-300 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>
                    <span className="text-[9px] text-stone-500 block mt-2">{note.updatedAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Society Perks */}
        {activeTab === 'perks' && (
          <div className="space-y-3">
            {Object.entries(TIER_CONFIG).map(([key, t]) => {
              const isCurrent = user.tier === key;
              return (
                <div 
                  key={key}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                    isCurrent 
                      ? 'bg-amber-500/10 border-amber-400/40 shadow-sm ring-1 ring-amber-400/20'
                      : 'bg-[#14141a] border-white/5 text-stone-400'
                  }`}
                >
                  <span className="text-2xl">{t.badge}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-xs text-white">{t.name}</h5>
                      <span className="text-[10px] font-mono text-stone-400">({t.minXp}+ XP)</span>
                      {isCurrent && (
                        <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-amber-400 text-black">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-300 mt-0.5">{t.perk}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
