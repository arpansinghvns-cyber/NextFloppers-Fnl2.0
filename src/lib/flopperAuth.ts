import { FlopperUser, FlopperNote, FlopperTier, ThemeId, FontId } from '../types';

const STORAGE_KEY_USER = 'nextflopper_active_user';
const STORAGE_KEY_REGISTRY = 'nextflopper_registered_users';

export const FLOPPER_AVATARS = [
  { id: 'bee', icon: '🐝', name: 'Cyber Bee', bg: 'from-amber-500/20 to-yellow-600/20 text-yellow-400' },
  { id: 'owl', icon: '🦉', name: 'Night Owl', bg: 'from-indigo-500/20 to-purple-600/20 text-purple-400' },
  { id: 'cat', icon: '🐱', name: 'Quantum Kitty', bg: 'from-cyan-500/20 to-blue-600/20 text-cyan-400' },
  { id: 'astro', icon: '👨‍🚀', name: 'Cosmic Scholar', bg: 'from-blue-500/20 to-sky-600/20 text-blue-400' },
  { id: 'crown', icon: '👑', name: 'Topper Slayer', bg: 'from-yellow-500/20 to-amber-600/20 text-amber-300' },
  { id: 'ninja', icon: '🥷', name: 'Silent Flopper', bg: 'from-stone-500/20 to-zinc-700/20 text-stone-300' },
  { id: 'dragon', icon: '🐉', name: 'Exam Wyrm', bg: 'from-rose-500/20 to-red-600/20 text-rose-400' },
  { id: 'spark', icon: '⚡', name: 'Static Flopper', bg: 'from-emerald-500/20 to-teal-600/20 text-emerald-400' }
];

export const TIER_CONFIG: Record<FlopperTier, { name: string; minXp: number; badge: string; color: string; perk: string }> = {
  initiate: {
    name: 'Flopper Initiate',
    minXp: 0,
    badge: '🥉',
    color: 'text-stone-300 border-stone-500/30 bg-stone-500/10',
    perk: 'Zero-Login Lecture & PDF Streaming'
  },
  crusher: {
    name: 'Aarambh Crusher',
    minXp: 100,
    badge: '🥈',
    color: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10',
    perk: 'Direct CloudFront CDN Bypass & Fast Seek'
  },
  demon: {
    name: 'Board Exam Demon',
    minXp: 300,
    badge: '🥇',
    color: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
    perk: 'CBT Assessment Rapid Engine & Analytics'
  },
  hunter: {
    name: 'Topper Hunter',
    minXp: 600,
    badge: '🔥',
    color: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    perk: 'Custom Fonts & Themes Live Sync'
  },
  overlord: {
    name: 'Supreme Flopper Overlord',
    minXp: 1200,
    badge: '👑',
    color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/15 shadow-amber-500/20',
    perk: 'Unlimited VIP Master Pass + Society Hall of Fame'
  }
};

export function calculateTier(xp: number): FlopperTier {
  if (xp >= 1200) return 'overlord';
  if (xp >= 600) return 'hunter';
  if (xp >= 300) return 'demon';
  if (xp >= 100) return 'crusher';
  return 'initiate';
}

export function getActiveFlopper(): FlopperUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveActiveFlopper(user: FlopperUser): void {
  try {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    // also sync to registry
    const registry = getRegisteredUsers();
    const idx = registry.findIndex(u => u.flopperId.toLowerCase() === user.flopperId.toLowerCase());
    if (idx >= 0) {
      registry[idx] = user;
    } else {
      registry.push(user);
    }
    localStorage.setItem(STORAGE_KEY_REGISTRY, JSON.stringify(registry));
  } catch (e) {
    console.error('Failed saving flopper user:', e);
  }
}

export function getRegisteredUsers(): FlopperUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REGISTRY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function claimInstantFlopperPass(preferredName?: string): FlopperUser {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const randomCode = Math.random().toString(36).substring(2, 5).toUpperCase();
  const flopperId = `FLOP-${randomSuffix}-${randomCode}`;
  const name = preferredName?.trim() || `Flopper Citizen #${randomSuffix}`;

  const newUser: FlopperUser = {
    flopperId,
    name,
    email: `${flopperId.toLowerCase()}@nextfloppers.club`,
    tier: 'crusher',
    avatar: 'bee',
    karmaXp: 120, // start with instant Aarambh Crusher perk
    streakDays: 1,
    savedNotes: [
      {
        id: 'note-welcome',
        title: 'Welcome to NEXT FLOPPERS Exclusive Society!',
        content: 'Your Flopper ID gives you uninterrupted access to all Next Toppers batches, direct CloudFront playback, custom fonts, and study notes.',
        subject: 'General',
        updatedAt: new Date().toLocaleDateString()
      }
    ],
    enrolledBatches: ['487', '478'], // auto-enroll Aarambh 10th & 9th
    bookmarks: ['sci-4', 'sci-2'],
    isExclusivePassActive: true,
    theme: (localStorage.getItem('flopper_active_theme') as ThemeId) || 'amber',
    font: (localStorage.getItem('flopper_active_font') as FontId) || 'syne',
    joinedAt: new Date().toLocaleDateString()
  };

  saveActiveFlopper(newUser);
  return newUser;
}

export function loginFlopper(flopperIdOrEmail: string, passcode?: string): FlopperUser {
  const query = flopperIdOrEmail.trim().toLowerCase();
  const registry = getRegisteredUsers();

  const found = registry.find(
    u => u.flopperId.toLowerCase() === query || 
         (u.email && u.email.toLowerCase() === query) ||
         u.name.toLowerCase() === query
  );

  if (found) {
    // update streak if new day
    found.karmaXp += 10;
    found.tier = calculateTier(found.karmaXp);
    saveActiveFlopper(found);
    return found;
  }

  // If not found in local registry, create an exclusive Flopper membership for them!
  const isCustomId = query.startsWith('flop-') || query.startsWith('@');
  const flopperId = isCustomId ? query.toUpperCase() : `FLOP-${Math.floor(1000 + Math.random() * 9000)}-VIP`;
  const name = flopperIdOrEmail.includes('@') ? flopperIdOrEmail.split('@')[0] : flopperIdOrEmail;

  const newUser: FlopperUser = {
    flopperId,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email: flopperIdOrEmail.includes('@') ? flopperIdOrEmail : `${flopperId.toLowerCase()}@nextfloppers.club`,
    tier: 'crusher',
    avatar: 'crown',
    karmaXp: 150,
    streakDays: 1,
    savedNotes: [],
    enrolledBatches: [],
    bookmarks: [],
    isExclusivePassActive: true,
    theme: (localStorage.getItem('flopper_active_theme') as ThemeId) || 'amber',
    font: (localStorage.getItem('flopper_active_font') as FontId) || 'syne',
    joinedAt: new Date().toLocaleDateString()
  };

  saveActiveFlopper(newUser);
  return newUser;
}

export function logoutFlopper(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch {}
}

export function addFlopperKarma(points: number): FlopperUser | null {
  const user = getActiveFlopper();
  if (!user) return null;

  user.karmaXp += points;
  user.tier = calculateTier(user.karmaXp);
  saveActiveFlopper(user);
  return user;
}

export function addFlopperNote(title: string, content: string, subject = 'General'): FlopperUser | null {
  const user = getActiveFlopper();
  if (!user) return null;

  const newNote: FlopperNote = {
    id: 'note-' + Date.now(),
    title: title.trim() || 'Untitled Study Note',
    content: content.trim(),
    subject,
    updatedAt: new Date().toLocaleDateString()
  };

  user.savedNotes = [newNote, ...user.savedNotes];
  user.karmaXp += 15; // reward note taking!
  user.tier = calculateTier(user.karmaXp);
  saveActiveFlopper(user);
  return user;
}

export function removeFlopperNote(noteId: string): FlopperUser | null {
  const user = getActiveFlopper();
  if (!user) return null;

  user.savedNotes = user.savedNotes.filter(n => n.id !== noteId);
  saveActiveFlopper(user);
  return user;
}
