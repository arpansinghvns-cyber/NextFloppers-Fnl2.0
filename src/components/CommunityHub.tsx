import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Upload, 
  FileText, 
  Download, 
  ThumbsUp, 
  MessageSquare, 
  Search, 
  Plus, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  X, 
  Share2, 
  Send, 
  Radio, 
  FileCheck, 
  Tag, 
  Flame, 
  Layers, 
  Bookmark,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  User,
  ShieldAlert
} from 'lucide-react';
import { 
  CommunityBook, 
  CommunitySuggestion, 
  getCommunityBooks, 
  addCommunityBook, 
  upvoteCommunityBook, 
  incrementBookDownloads, 
  getCommunitySuggestions, 
  addCommunitySuggestion, 
  upvoteCommunitySuggestion, 
  addReplyToSuggestion,
  getUpvotedItemIds
} from '../lib/communityService';
import { FlopperUser } from '../types';

interface CommunityHubProps {
  user: FlopperUser | null;
  onOpenLoginModal: () => void;
  onShowToast: (msg: string) => void;
}

const BOOK_CATEGORIES = [
  'All',
  'Science',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Social Science',
  'English'
];

const SUGGESTION_CATEGORIES = [
  'All',
  'Batch Request',
  'Feature Wishlist',
  'Study Tip',
  'Exam Strategy',
  'Bug Report'
];

export const CommunityHub: React.FC<CommunityHubProps> = ({
  user,
  onOpenLoginModal,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'books' | 'suggestions'>('books');
  const [books, setBooks] = useState<CommunityBook[]>(getCommunityBooks);
  const [suggestions, setSuggestions] = useState<CommunitySuggestion[]>(getCommunitySuggestions);
  const [upvotedIds, setUpvotedIds] = useState<string[]>(getUpvotedItemIds);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBookCategory, setSelectedBookCategory] = useState('All');
  const [selectedSugCategory, setSelectedSugCategory] = useState('All');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);

  // New Book Upload Form
  const [bookTitle, setBookTitle] = useState('');
  const [bookSubject, setBookSubject] = useState('Science');
  const [bookClass, setBookClass] = useState('Class 10th');
  const [bookDesc, setBookDesc] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookFormat, setBookFormat] = useState<'PDF' | 'EPUB' | 'ZIP' | 'DOCX'>('PDF');
  const [bookUrl, setBookUrl] = useState('');
  const [selectedFileObj, setSelectedFileObj] = useState<File | null>(null);

  // New Suggestion Form
  const [sugTitle, setSugTitle] = useState('');
  const [sugCategory, setSugCategory] = useState<'Batch Request' | 'Feature Wishlist' | 'Study Tip' | 'Bug Report' | 'Exam Strategy'>('Feature Wishlist');
  const [sugContent, setSugContent] = useState('');

  // Expanded replies state
  const [expandedSugId, setExpandedSugId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Handle Book Upvote
  const handleBookUpvote = (bookId: string) => {
    const res = upvoteCommunityBook(bookId);
    setBooks(getCommunityBooks());
    setUpvotedIds(getUpvotedItemIds());
    if (res.upvoted) {
      onShowToast("🔥 Upvoted! Added +1 to Community Vault karma.");
    }
  };

  // Handle Book Download
  const handleDownloadBook = (book: CommunityBook) => {
    incrementBookDownloads(book.id);
    setBooks(getCommunityBooks());
    window.open(book.downloadUrl, '_blank');
    onShowToast(`📥 Accessing "${book.title.slice(0, 30)}..."`);
  };

  // Handle Suggestion Upvote
  const handleSuggestionUpvote = (sugId: string) => {
    const res = upvoteCommunitySuggestion(sugId);
    setSuggestions(getCommunitySuggestions());
    setUpvotedIds(getUpvotedItemIds());
    if (res.upvoted) {
      onShowToast("⚡ Supported suggestion! Flopper Admins notified.");
    }
  };

  // Submit New Book
  const handleUploadBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) {
      onShowToast("Please enter a book or file title.");
      return;
    }

    const calculatedSize = selectedFileObj 
      ? `${(selectedFileObj.size / (1024 * 1024)).toFixed(1)} MB` 
      : '12.4 MB';

    const finalUrl = selectedFileObj 
      ? URL.createObjectURL(selectedFileObj) 
      : (bookUrl.trim() || 'https://archive.org/details/books');

    const created = addCommunityBook({
      title: bookTitle.trim(),
      subject: bookSubject,
      classCategory: bookClass,
      description: bookDesc.trim() || 'Community shared study material and hand-written solutions.',
      author: bookAuthor.trim() || (user?.name || 'Flopper Student'),
      uploaderName: user?.flopperId || (user?.name ? `@${user.name.replace(/\s+/g, '_')}` : 'AnonymousFlopper'),
      fileSize: calculatedSize,
      format: bookFormat,
      downloadUrl: finalUrl,
      tags: [bookSubject, bookClass, 'Community Verified']
    });

    setBooks(getCommunityBooks());
    setIsUploadModalOpen(false);
    // Reset Form
    setBookTitle('');
    setBookDesc('');
    setBookAuthor('');
    setBookUrl('');
    setSelectedFileObj(null);
    onShowToast(`🎉 "${created.title.slice(0, 30)}..." published to Community Vault!`);
  };

  // Submit New Suggestion
  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugTitle.trim() || !sugContent.trim()) {
      onShowToast("Please provide both a title and details for your suggestion.");
      return;
    }

    const created = addCommunitySuggestion({
      title: sugTitle.trim(),
      content: sugContent.trim(),
      category: sugCategory,
      author: user?.name || 'Anonymous Flopper',
      authorAvatar: user ? '👑' : '⚡'
    });

    setSuggestions(getCommunitySuggestions());
    setIsSuggestionModalOpen(false);
    setSugTitle('');
    setSugContent('');
    onShowToast(`💡 Suggestion published! Community can now upvote.`);
  };

  // Submit Reply
  const handleReplySubmit = (sugId: string) => {
    if (!replyText.trim()) return;
    const authorName = user?.name || 'Anonymous Flopper';
    addReplyToSuggestion(sugId, authorName, replyText.trim());
    setSuggestions(getCommunitySuggestions());
    setReplyText('');
    onShowToast("💬 Comment posted.");
  };

  // Filtered Books
  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const matchSearch = searchQuery === '' || 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.classCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedBookCategory === 'All' || book.subject === selectedBookCategory;
      return matchSearch && matchCategory;
    });
  }, [books, searchQuery, selectedBookCategory]);

  // Filtered Suggestions
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(sug => {
      const matchSearch = searchQuery === '' ||
        sug.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sug.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sug.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedSugCategory === 'All' || sug.category === selectedSugCategory;
      return matchSearch && matchCategory;
    });
  }, [suggestions, searchQuery, selectedSugCategory]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Community Hero Header Widget */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#09090d] border border-white/10 relative overflow-hidden nothing-dot-bg">
        {/* Subtle Glyph Red Flare */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#E60000]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-doto uppercase">
              <span className="w-2 h-2 rounded-full bg-[#E60000] shadow-[0_0_10px_#E60000] animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wider">
                NT FLOPPERS COMMUNITY HUB (2.0)
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-white/10 text-neutral-300">
                OPEN VAULT
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white font-doto tracking-wide uppercase">
              STUDENT RESOURCE VAULT & SUGGESTIONS
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Upload and download hand-written topper notes, reference books, formula cheat sheets, or share batch requests directly with the community.
            </p>
          </div>

          {/* Quick Upload / Post Buttons */}
          <div className="flex items-center gap-3 shrink-0 font-doto text-xs uppercase">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-white text-black font-bold flex items-center gap-2 hover:bg-[#E60000] hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" />
              <span>UPLOAD BOOK / FILE</span>
            </button>

            <button
              onClick={() => setIsSuggestionModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 flex items-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#E60000]" />
              <span>SHARE SUGGESTION</span>
            </button>
          </div>
        </div>

        {/* Live Community Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 font-doto text-xs">
          <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">COMMUNITY BOOKS & NOTES</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">{books.length} Active Files</div>
          </div>
          <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">TOTAL DOWNLOADS</div>
            <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">18,450+ Fetched</div>
          </div>
          <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">SUGGESTIONS & REQUESTS</div>
            <div className="text-base sm:text-lg font-bold text-white mt-0.5">{suggestions.length} Discussions</div>
          </div>
          <div className="bg-black/60 p-3 rounded-2xl border border-white/5">
            <div className="text-[10px] text-neutral-500 uppercase tracking-wider">VERIFICATION RATING</div>
            <div className="text-base sm:text-lg font-bold text-[#E60000] mt-0.5">99.8% Clean PDF</div>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation (Books vs Suggestions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-doto uppercase">
        <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0e] rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => setActiveSubTab('books')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'books'
                ? 'bg-white text-black shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>RESOURCE LIBRARY ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('suggestions')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeSubTab === 'suggestions'
                ? 'bg-white text-black shadow-md font-black'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>SUGGESTIONS & WISHLIST ({suggestions.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeSubTab === 'books' ? "Search books, notes, formulas..." : "Search ideas, requests..."}
            className="w-full bg-[#0a0a0e] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 font-mono"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SECTION 1: BOOKS & FILE VAULT */}
      {activeSubTab === 'books' && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 font-doto text-xs uppercase">
            {BOOK_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedBookCategory(cat)}
                className={`px-4 py-2 rounded-2xl transition-all whitespace-nowrap border ${
                  selectedBookCategory === cat
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#0a0a0e] text-neutral-400 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Books Grid */}
          {filteredBooks.length === 0 ? (
            <div className="p-12 text-center bg-[#0a0a0e] border border-white/10 rounded-3xl space-y-3 nothing-dot-bg">
              <FileText className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="font-doto font-bold text-white text-sm uppercase">NO FILES FOUND</h3>
              <p className="text-xs text-neutral-400 font-sans max-w-sm mx-auto">
                Be the first to upload this subject's hand-written notes or reference book to the community vault!
              </p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="px-5 py-2.5 bg-white text-black font-doto font-bold text-xs uppercase rounded-2xl hover:bg-[#E60000] hover:text-white transition-colors"
              >
                UPLOAD FIRST FILE
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBooks.map((book) => {
                const isUpvoted = upvotedIds.includes(`book_${book.id}`);
                return (
                  <div
                    key={book.id}
                    className="p-5 rounded-3xl bg-[#0a0a0e] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between group hover:shadow-[0_0_30px_rgba(255,255,255,0.04)]"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3 font-doto text-[10px] uppercase">
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-neutral-300 font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E60000]" />
                          {book.subject}
                        </span>

                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
                          {book.format} · {book.fileSize}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 font-sans group-hover:text-white">
                        {book.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                        {book.description}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {book.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-mono text-neutral-500 bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Metadata & Actions */}
                    <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between font-doto text-xs">
                      <div className="text-[10px] text-neutral-400 font-mono">
                        <div>By <strong className="text-neutral-200">{book.author}</strong></div>
                        <div className="text-neutral-500">{book.uploadedAt}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleBookUpvote(book.id)}
                          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                            isUpvoted
                              ? 'bg-[#E60000] border-[#E60000] text-white shadow-[0_0_10px_rgba(230,0,0,0.5)]'
                              : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                          }`}
                          title="Upvote Book"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-mono font-bold">{book.upvotes}</span>
                        </button>

                        {/* Download / Open File Button */}
                        <button
                          onClick={() => handleDownloadBook(book)}
                          className="px-3.5 py-1.5 rounded-xl bg-white text-black font-bold hover:bg-[#E60000] hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Download / View PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span className="uppercase text-[11px]">GET</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: SUGGESTIONS & WISHLIST BOARD */}
      {activeSubTab === 'suggestions' && (
        <div className="space-y-5">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-2 font-doto text-xs uppercase">
            {SUGGESTION_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSugCategory(cat)}
                className={`px-4 py-2 rounded-2xl transition-all whitespace-nowrap border ${
                  selectedSugCategory === cat
                    ? 'bg-white text-black font-bold border-white'
                    : 'bg-[#0a0a0e] text-neutral-400 hover:text-white border-white/10 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Suggestions List */}
          <div className="space-y-3">
            {filteredSuggestions.map((sug) => {
              const isUpvoted = upvotedIds.includes(`sug_${sug.id}`);
              const isExpanded = expandedSugId === sug.id;

              return (
                <div
                  key={sug.id}
                  className="p-5 rounded-3xl bg-[#0a0a0e] border border-white/10 space-y-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shrink-0">
                        {sug.authorAvatar || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-doto text-[10px] uppercase">
                          <span className="px-2 py-0.5 rounded bg-white/10 text-neutral-300 font-bold">
                            {sug.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                            sug.status === 'Implemented' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : sug.status === 'Planned'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : 'bg-white/5 text-neutral-400'
                          }`}>
                            [{sug.status}]
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-white mt-1.5 font-sans leading-snug">
                          {sug.title}
                        </h3>

                        <p className="text-xs text-neutral-300 mt-1 font-sans leading-relaxed">
                          {sug.content}
                        </p>

                        <div className="text-[11px] font-mono text-neutral-500 mt-2">
                          Posted by <strong className="text-neutral-400">{sug.author}</strong> · {sug.createdAt}
                        </div>
                      </div>
                    </div>

                    {/* Upvote Pill */}
                    <button
                      onClick={() => handleSuggestionUpvote(sug.id)}
                      className={`px-3.5 py-2 rounded-2xl border flex flex-col items-center justify-center transition-all shrink-0 font-doto ${
                        isUpvoted
                          ? 'bg-[#E60000] border-[#E60000] text-white shadow-[0_0_15px_rgba(230,0,0,0.5)]'
                          : 'bg-white/5 border-white/10 text-neutral-300 hover:bg-white/10'
                      }`}
                      title="Support Suggestion"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mb-0.5" />
                      <span className="text-xs font-bold font-mono">{sug.upvotes}</span>
                    </button>
                  </div>

                  {/* Discussion / Replies Toggle */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between font-doto text-xs">
                    <button
                      onClick={() => setExpandedSugId(isExpanded ? null : sug.id)}
                      className="text-neutral-400 hover:text-white flex items-center gap-1.5 transition-colors uppercase text-[11px]"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-[#E60000]" />
                      <span>{sug.replies?.length || 0} REPLIES</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Expanded Replies Thread */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-white/5 space-y-3 animate-fade-in">
                      {sug.replies && sug.replies.length > 0 ? (
                        <div className="space-y-2.5">
                          {sug.replies.map((reply) => (
                            <div key={reply.id} className="p-3 rounded-2xl bg-black/60 border border-white/5 text-xs">
                              <div className="flex items-center justify-between font-doto text-[10px] text-neutral-400 uppercase mb-1">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  {reply.authorAvatar && <span>{reply.authorAvatar}</span>}
                                  {reply.author}
                                </span>
                                <span>{reply.createdAt}</span>
                              </div>
                              <p className="text-neutral-300 font-sans">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-500 font-mono py-2">
                          No replies yet. Share your thoughts below!
                        </div>
                      )}

                      {/* Reply Input */}
                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleReplySubmit(sug.id);
                          }}
                          placeholder="Write a comment or solution..."
                          className="flex-1 bg-black/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 font-sans"
                        />
                        <button
                          onClick={() => handleReplySubmit(sug.id)}
                          className="px-4 py-2.5 bg-white text-black font-doto font-bold text-xs uppercase rounded-2xl hover:bg-[#E60000] hover:text-white transition-colors shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: UPLOAD BOOK / FILE */}
      {isUploadModalOpen && (
        <div 
          onClick={() => setIsUploadModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in font-sans"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[#08080b] border border-white/15 rounded-3xl p-6 text-white shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-doto">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E60000] animate-pulse" />
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                  UPLOAD BOOK / STUDY FILE
                </h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadBookSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                  Book / Notes Title *
                </label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g., Class 10 Real Numbers Handwritten Formula Sheet"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                    Subject
                  </label>
                  <select
                    value={bookSubject}
                    onChange={(e) => setBookSubject(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Social Science">Social Science</option>
                    <option value="English">English</option>
                    <option value="Commerce">Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                    Class / Stream
                  </label>
                  <select
                    value={bookClass}
                    onChange={(e) => setBookClass(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="Class 10th">Class 10th</option>
                    <option value="Class 9th">Class 9th</option>
                    <option value="Class 11th">Class 11th</option>
                    <option value="Class 12th">Class 12th</option>
                    <option value="NEET">NEET</option>
                    <option value="JEE">JEE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                  Author / Topper Name
                </label>
                <input
                  type="text"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="e.g., NCERT Squad / Self Handwritten"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                  Description / Chapter Coverage
                </label>
                <textarea
                  rows={2}
                  value={bookDesc}
                  onChange={(e) => setBookDesc(e.target.value)}
                  placeholder="Explain what is inside: formulas, solved examples, mind maps..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              {/* Local File Selector or Direct Download Link */}
              <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="text-[11px] font-doto uppercase text-white font-bold flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#E60000]" />
                  <span>SELECT LOCAL FILE (PDF, EPUB, DOCX)</span>
                </div>

                <input
                  type="file"
                  accept=".pdf,.epub,.docx,.zip"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFileObj(e.target.files[0]);
                      const name = e.target.files[0].name;
                      if (!bookTitle) setBookTitle(name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="w-full text-xs text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-white/15 file:text-xs file:font-doto file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                />

                <div className="text-center text-[10px] text-neutral-500 font-mono">- OR ENTER DIRECT DOWNLOAD URL -</div>

                <input
                  type="url"
                  value={bookUrl}
                  onChange={(e) => setBookUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://archive.org/..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 font-doto uppercase text-xs">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2.5 text-neutral-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-bold rounded-2xl hover:bg-[#E60000] hover:text-white transition-all shadow-md"
                >
                  PUBLISH FILE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SHARE SUGGESTION */}
      {isSuggestionModalOpen && (
        <div 
          onClick={() => setIsSuggestionModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in font-sans"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-[#08080b] border border-white/15 rounded-3xl p-6 text-white shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 font-doto">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#E60000]" />
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider">
                  SHARE SUGGESTION OR BATCH REQUEST
                </h3>
              </div>
              <button onClick={() => setIsSuggestionModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                  Category
                </label>
                <select
                  value={sugCategory}
                  onChange={(e) => setSugCategory(e.target.value as any)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-white/30 font-doto"
                >
                  <option value="Feature Wishlist">Feature Wishlist</option>
                  <option value="Batch Request">Batch Request</option>
                  <option value="Study Tip">Study Tip</option>
                  <option value="Exam Strategy">Exam Strategy</option>
                  <option value="Bug Report">Bug Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                  Suggestion Title *
                </label>
                <input
                  type="text"
                  required
                  value={sugTitle}
                  onChange={(e) => setSugTitle(e.target.value)}
                  placeholder="e.g., Please add Aarambh Class 9th Math Chapter 6 DPPs"
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-doto uppercase text-neutral-400 mb-1.5">
                  Details / Explanation *
                </label>
                <textarea
                  rows={4}
                  required
                  value={sugContent}
                  onChange={(e) => setSugContent(e.target.value)}
                  placeholder="Describe your idea or request in detail so other floppers can support and upvote..."
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 resize-none font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 font-doto uppercase text-xs">
                <button
                  type="button"
                  onClick={() => setIsSuggestionModalOpen(false)}
                  className="px-4 py-2.5 text-neutral-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-white text-black font-bold rounded-2xl hover:bg-[#E60000] hover:text-white transition-all shadow-md"
                >
                  POST SUGGESTION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CommunityHub;
