/**
 * NT Floppers Community Service
 * Manages community-shared books, hand-written notes, study PDFs, and student suggestions.
 */

export interface CommunityBook {
  id: string;
  title: string;
  subject: string;
  classCategory: string;
  description: string;
  author: string;
  uploaderName: string;
  fileSize: string;
  format: 'PDF' | 'EPUB' | 'ZIP' | 'DOCX';
  downloadUrl: string;
  previewUrl?: string;
  upvotes: number;
  downloadsCount: number;
  uploadedAt: string;
  tags: string[];
  verified: boolean;
}

export interface CommunityReply {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  upvotes: number;
}

export interface CommunitySuggestion {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar?: string;
  category: 'Batch Request' | 'Feature Wishlist' | 'Study Tip' | 'Bug Report' | 'Exam Strategy';
  upvotes: number;
  createdAt: string;
  repliesCount: number;
  status: 'Under Review' | 'Planned' | 'Implemented' | 'Community Favorite';
  replies: CommunityReply[];
}

const STORAGE_KEY_BOOKS = 'ntflopper_community_books_v1';
const STORAGE_KEY_SUGGESTIONS = 'ntflopper_community_suggestions_v1';
const STORAGE_KEY_UPVOTED_ITEMS = 'ntflopper_upvoted_items_v1';

export const INITIAL_COMMUNITY_BOOKS: CommunityBook[] = [
  {
    id: 'book-1',
    title: 'Class 10 CBSE 2026 Toppers Hand-written Science Master Notes',
    subject: 'Science',
    classCategory: 'Class 10th',
    description: 'Complete colored hand-written notes covering all 13 chapters with chemical equations, ray diagrams, and board-repeating questions.',
    author: 'Aarambh Flopper Squad',
    uploaderName: 'Gaurav_AIR1',
    fileSize: '28.4 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/ncert-class-10-science/Class10_Science_Toppers_Notes.pdf',
    upvotes: 482,
    downloadsCount: 1840,
    uploadedAt: '2 days ago',
    tags: ['Aarambh 2026', 'Topper Notes', 'Color Coded', 'Science'],
    verified: true
  },
  {
    id: 'book-2',
    title: 'Complete Mathematics Formula Sheet & Cheat Codes (Class 10th)',
    subject: 'Mathematics',
    classCategory: 'Class 10th',
    description: 'Every formula from Real Numbers to Trigonometric Identities, Surface Areas & Statistics condensed into 12 crisp cheat sheets.',
    author: 'Flopper Math Club',
    uploaderName: 'Shubham_Flopper',
    fileSize: '6.2 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/cbse-class-10-maths-formula-sheet/Class10_Maths_FormulaSheet.pdf',
    upvotes: 619,
    downloadsCount: 3120,
    uploadedAt: '3 days ago',
    tags: ['Formulas', 'Maths 2026', 'Cheat Sheet', 'Class 10th'],
    verified: true
  },
  {
    id: 'book-3',
    title: 'HC Verma: Key Formulas, Concepts & Solved Problems Vol 1 & 2',
    subject: 'Physics',
    classCategory: 'Class 11th & 12th',
    description: 'High-yield conceptual summaries and step-by-step solutions for Mechanics, Electrodynamics, Optics, and Modern Physics.',
    author: 'Prof. H.C. Verma Study Forum',
    uploaderName: 'QuantumDev',
    fileSize: '42.1 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/hcv-concepts-summary-solved/HCV_HighYield_Notes.pdf',
    upvotes: 890,
    downloadsCount: 5490,
    uploadedAt: '1 week ago',
    tags: ['JEE', 'NEET', 'HCV Physics', 'Class 11th', 'Class 12th'],
    verified: true
  },
  {
    id: 'book-4',
    title: 'Class 12 Physics: All 45 Board Derivations with Diagrams',
    subject: 'Physics',
    classCategory: 'Class 12th',
    description: 'Guaranteed 5-mark derivations compiled from the past 10 years of CBSE Board Papers. Step-by-step proofs with vector diagrams.',
    author: 'Prarambh Faculty Forum',
    uploaderName: 'Floppy_Nikita',
    fileSize: '15.8 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/cbse-class-12-physics-derivations/Physics_45_Derivations.pdf',
    upvotes: 532,
    downloadsCount: 2280,
    uploadedAt: '4 days ago',
    tags: ['Board Exam', 'Physics', 'Derivations', 'Class 12th'],
    verified: true
  },
  {
    id: 'book-5',
    title: 'Class 10 Social Science: Mind Maps & Timeline Flashcards',
    subject: 'Social Science',
    classCategory: 'Class 10th',
    description: 'Comprehensive visual mind maps for Nationalism in India, Europe, Agriculture, Federalism, and Economic Development.',
    author: 'SST Master Collective',
    uploaderName: 'Rohan_StudyFlopper',
    fileSize: '18.5 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/class-10-sst-mindmaps/SST_Class10_Mindmaps.pdf',
    upvotes: 341,
    downloadsCount: 1670,
    uploadedAt: '5 days ago',
    tags: ['SST', 'Mind Maps', 'History Timeline', 'Class 10th'],
    verified: true
  },
  {
    id: 'book-6',
    title: 'Aarambh English Literature: Character Sketches & Theme Bank',
    subject: 'English',
    classCategory: 'Class 10th',
    description: 'Detailed analysis of First Flight and Footprints Without Feet stories, poems, poetic devices, and expected long answers.',
    author: 'Literary Society NT',
    uploaderName: 'Ananya_EnglishPro',
    fileSize: '9.3 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/class-10-english-character-sketches/English_Character_Sketches.pdf',
    upvotes: 275,
    downloadsCount: 980,
    uploadedAt: '6 days ago',
    tags: ['English', 'Literature', 'Poetic Devices', 'Class 10th'],
    verified: true
  },
  {
    id: 'book-7',
    title: 'Prarambh Chemistry: Organic Reaction Mechanisms & Mind Maps',
    subject: 'Chemistry',
    classCategory: 'Class 12th',
    description: 'Named reactions, reagents cheat sheet, conversions roadmap, and reaction mechanisms from Haloalkanes to Amines.',
    author: 'Organic Chemist Collective',
    uploaderName: 'Vikram_ChemFlopper',
    fileSize: '21.0 MB',
    format: 'PDF',
    downloadUrl: 'https://archive.org/download/class-12-organic-chemistry-mindmaps/Organic_Reaction_Roadmaps.pdf',
    upvotes: 742,
    downloadsCount: 3820,
    uploadedAt: '1 week ago',
    tags: ['Organic Chemistry', 'Named Reactions', 'Class 12th'],
    verified: true
  }
];

export const INITIAL_COMMUNITY_SUGGESTIONS: CommunitySuggestion[] = [
  {
    id: 'sug-1',
    title: 'Add A-B Loop Repeat and Audio Volume Booster in Video Player',
    content: 'Can we have a loop function where we select point A and point B to loop tough math steps, plus volume boost for low recorded lectures?',
    author: 'Kunal_Flopper',
    authorAvatar: '⚡',
    category: 'Feature Wishlist',
    upvotes: 412,
    createdAt: '1 day ago',
    repliesCount: 3,
    status: 'Implemented',
    replies: [
      {
        id: 'rep-1',
        author: 'Admin_NothingOS',
        authorAvatar: '👑',
        content: 'Implemented in the new Ultra Player! You now have 200% Web Audio Gain booster and A-B Loop repeats.',
        createdAt: 'Just now',
        upvotes: 89
      },
      {
        id: 'rep-2',
        author: 'Aarav_99',
        content: 'This will save so much time when rewatching tricky Physics derivations!',
        createdAt: '5 hours ago',
        upvotes: 24
      }
    ]
  },
  {
    id: 'sug-2',
    title: 'Upload Aarambh 2.0 Class 9th Science Chapter 3 DPP Solutions',
    content: 'Guys, does anyone have the Atoms and Molecules hand-written DPP solved PDF? Please upload it here in the Books & Files vault.',
    author: 'Priya_Class9',
    authorAvatar: '🔬',
    category: 'Batch Request',
    upvotes: 198,
    createdAt: '2 days ago',
    repliesCount: 2,
    status: 'Community Favorite',
    replies: [
      {
        id: 'rep-3',
        author: 'Rohan_StudyFlopper',
        content: 'I just uploaded the complete DPP bundle for Chapter 3! Check the Resource Library.',
        createdAt: '1 day ago',
        upvotes: 42
      }
    ]
  },
  {
    id: 'sug-3',
    title: 'Strategy for Scoring 95%+ in Class 10 Science using Flopper Lectures',
    content: 'Rule 1: Watch at 1.25x speed and make your own one-page formula sheet. Rule 2: Solve NCERT Exemplar right after lecture. Rule 3: Re-watch with our speed dial right before exam night.',
    author: 'Sameer_AIR3',
    authorAvatar: '🎯',
    category: 'Study Tip',
    upvotes: 567,
    createdAt: '3 days ago',
    repliesCount: 4,
    status: 'Community Favorite',
    replies: [
      {
        id: 'rep-4',
        author: 'Nidhi_K',
        content: 'Following this strategy religiously. My mock scores jumped from 68 to 76/80 in Science!',
        createdAt: '1 day ago',
        upvotes: 31
      }
    ]
  },
  {
    id: 'sug-4',
    title: 'Add One-Click Screenshot Note-Taker Button inside Video Player',
    content: 'A button to instantly capture high-res slides and diagrams while the teacher is writing so we do not have to pause and take snips.',
    author: 'Deepak_Flopper',
    authorAvatar: '📸',
    category: 'Feature Wishlist',
    upvotes: 320,
    createdAt: '4 days ago',
    repliesCount: 1,
    status: 'Implemented',
    replies: [
      {
        id: 'rep-5',
        author: 'Admin_NothingOS',
        authorAvatar: '👑',
        content: 'Added! Click the camera icon or press S on your keyboard to instantly save any frame as PNG.',
        createdAt: 'Just now',
        upvotes: 65
      }
    ]
  }
];

export function getCommunityBooks(): CommunityBook[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_COMMUNITY_BOOKS;
}

export function saveCommunityBooks(books: CommunityBook[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
  } catch (err) {
    console.error('Failed to save community books:', err);
  }
}

export function addCommunityBook(
  bookData: Omit<CommunityBook, 'id' | 'upvotes' | 'downloadsCount' | 'uploadedAt' | 'verified'>
): CommunityBook {
  const books = getCommunityBooks();
  const newBook: CommunityBook = {
    ...bookData,
    id: `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    upvotes: 1,
    downloadsCount: 1,
    uploadedAt: 'Just now',
    verified: true
  };
  const updated = [newBook, ...books];
  saveCommunityBooks(updated);
  return newBook;
}

export function upvoteCommunityBook(bookId: string): { upvoted: boolean; count: number } {
  const upvotedIds = getUpvotedItemIds();
  const isAlreadyUpvoted = upvotedIds.includes(`book_${bookId}`);
  const books = getCommunityBooks();
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) return { upvoted: false, count: 0 };

  if (isAlreadyUpvoted) {
    books[bookIndex].upvotes = Math.max(0, books[bookIndex].upvotes - 1);
    saveUpvotedItemIds(upvotedIds.filter(id => id !== `book_${bookId}`));
    saveCommunityBooks(books);
    return { upvoted: false, count: books[bookIndex].upvotes };
  } else {
    books[bookIndex].upvotes += 1;
    saveUpvotedItemIds([...upvotedIds, `book_${bookId}`]);
    saveCommunityBooks(books);
    return { upvoted: true, count: books[bookIndex].upvotes };
  }
}

export function incrementBookDownloads(bookId: string): void {
  const books = getCommunityBooks();
  const target = books.find(b => b.id === bookId);
  if (target) {
    target.downloadsCount += 1;
    saveCommunityBooks(books);
  }
}

export function getCommunitySuggestions(): CommunitySuggestion[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SUGGESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return INITIAL_COMMUNITY_SUGGESTIONS;
}

export function saveCommunitySuggestions(suggestions: CommunitySuggestion[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SUGGESTIONS, JSON.stringify(suggestions));
  } catch (err) {
    console.error('Failed to save community suggestions:', err);
  }
}

export function addCommunitySuggestion(
  suggestionData: Omit<CommunitySuggestion, 'id' | 'upvotes' | 'createdAt' | 'repliesCount' | 'status' | 'replies'>
): CommunitySuggestion {
  const list = getCommunitySuggestions();
  const newSuggestion: CommunitySuggestion = {
    ...suggestionData,
    id: `sug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    upvotes: 1,
    createdAt: 'Just now',
    repliesCount: 0,
    status: 'Under Review',
    replies: []
  };
  const updated = [newSuggestion, ...list];
  saveCommunitySuggestions(updated);
  return newSuggestion;
}

export function upvoteCommunitySuggestion(suggestionId: string): { upvoted: boolean; count: number } {
  const upvotedIds = getUpvotedItemIds();
  const isAlreadyUpvoted = upvotedIds.includes(`sug_${suggestionId}`);
  const suggestions = getCommunitySuggestions();
  const index = suggestions.findIndex(s => s.id === suggestionId);

  if (index === -1) return { upvoted: false, count: 0 };

  if (isAlreadyUpvoted) {
    suggestions[index].upvotes = Math.max(0, suggestions[index].upvotes - 1);
    saveUpvotedItemIds(upvotedIds.filter(id => id !== `sug_${suggestionId}`));
    saveCommunitySuggestions(suggestions);
    return { upvoted: false, count: suggestions[index].upvotes };
  } else {
    suggestions[index].upvotes += 1;
    saveUpvotedItemIds([...upvotedIds, `sug_${suggestionId}`]);
    saveCommunitySuggestions(suggestions);
    return { upvoted: true, count: suggestions[index].upvotes };
  }
}

export function addReplyToSuggestion(suggestionId: string, author: string, content: string): CommunityReply | null {
  const suggestions = getCommunitySuggestions();
  const target = suggestions.find(s => s.id === suggestionId);
  if (!target) return null;

  const newReply: CommunityReply = {
    id: `rep-${Date.now()}`,
    author: author || 'Anonymous Flopper',
    content,
    createdAt: 'Just now',
    upvotes: 0
  };

  target.replies = [...(target.replies || []), newReply];
  target.repliesCount = target.replies.length;
  saveCommunitySuggestions(suggestions);
  return newReply;
}

export function getUpvotedItemIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_UPVOTED_ITEMS);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveUpvotedItemIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_UPVOTED_ITEMS, JSON.stringify(ids));
  } catch {}
}
