import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Student, 
  Message, 
  RollingTheme, 
  RollingSettings,
  PlacedSticker 
} from '../types';
import { NOTE_COLORS, FONT_OPTIONS } from '../constants/themes';
import { GasService } from '../services/gasService';
import { StickerDecorateLayer } from './StickerDecorateLayer';
import { 
  Sparkles, 
  Calendar, 
  Trash2, 
  Maximize2, 
  X, 
  PenTool, 
  Heart, 
  Share2, 
  Camera, 
  Check, 
  Copy, 
  Search, 
  RotateCcw, 
  User, 
  FileText, 
  ArrowUpDown, 
  ChevronDown,
  Palette
} from 'lucide-react';

export type MessageSortOption = 'newest' | 'oldest' | 'author';

interface RollingBoardProps {
  currentStudent: Student | null;
  messages: Message[];
  currentTheme: RollingTheme;
  settings: RollingSettings;
  onOpenCompose: () => void;
  onDeleteMessage: (msgId: string) => Promise<void>;
  onExportImage: () => void;
}

export const RollingBoard: React.FC<RollingBoardProps> = ({
  currentStudent,
  messages,
  currentTheme,
  settings,
  onOpenCompose,
  onDeleteMessage,
  onExportImage,
}) => {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFilterType, setSearchFilterType] = useState<'all' | 'author' | 'content'>('all');
  const [sortBy, setSortBy] = useState<MessageSortOption>('newest');

  // Decoration Mode state
  const [isDecoratingMode, setIsDecoratingMode] = useState<boolean>(false);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);

  // Placed Stickers per Student (persisted in localStorage)
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>(() => {
    if (!currentStudent) return [];
    try {
      const saved = localStorage.getItem(`rolling_stickers_${currentStudent.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reload stickers when active student changes
  useEffect(() => {
    if (currentStudent) {
      try {
        const saved = localStorage.getItem(`rolling_stickers_${currentStudent.id}`);
        setPlacedStickers(saved ? JSON.parse(saved) : []);
      } catch {
        setPlacedStickers([]);
      }
    } else {
      setPlacedStickers([]);
    }
  }, [currentStudent?.id]);

  const saveStickers = (newStickers: PlacedSticker[]) => {
    setPlacedStickers(newStickers);
    if (currentStudent) {
      try {
        localStorage.setItem(`rolling_stickers_${currentStudent.id}`, JSON.stringify(newStickers));
      } catch (err) {
        console.error('Failed to save stickers', err);
      }
    }
  };

  const handleAddSticker = (data: Omit<PlacedSticker, 'id' | 'zIndex'>) => {
    const maxZ = placedStickers.reduce((max, s) => Math.max(max, s.zIndex || 1), 1);
    const newSticker: PlacedSticker = {
      ...data,
      id: 'stk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      zIndex: maxZ + 1,
    };
    saveStickers([...placedStickers, newSticker]);
  };

  const handleUpdateSticker = (id: string, updates: Partial<PlacedSticker>) => {
    saveStickers(placedStickers.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleDeleteSticker = (id: string) => {
    saveStickers(placedStickers.filter((s) => s.id !== id));
  };

  const handleClearAllStickers = () => {
    saveStickers([]);
  };

  // Helper to parse date to timestamp ms
  const parseDateToMs = (dateStr?: string): number => {
    if (!dateStr) return 0;
    const isoStr = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    const parsed = Date.parse(isoStr);
    if (!isNaN(parsed)) return parsed;
    const direct = Date.parse(dateStr);
    if (!isNaN(direct)) return direct;
    return 0;
  };

  // Filter and sort messages based on search query, scope, and sort option
  const filteredMessages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    
    // 1. Search scope filter
    let list = messages;
    if (q) {
      list = messages.filter((msg) => {
        const authorMatch = (msg.author || '').toLowerCase().includes(q);
        const contentMatch = (msg.content || '').toLowerCase().includes(q);
        if (searchFilterType === 'author') return authorMatch;
        if (searchFilterType === 'content') return contentMatch;
        return authorMatch || contentMatch;
      });
    }

    // 2. Sort by option: 'newest' (최신순), 'oldest' (오래된순), 'author' (작성자 이름순)
    return [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        const diff = parseDateToMs(b.createdAt) - parseDateToMs(a.createdAt);
        if (diff !== 0) return diff;
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'oldest') {
        const diff = parseDateToMs(a.createdAt) - parseDateToMs(b.createdAt);
        if (diff !== 0) return diff;
        return (a.id || '').localeCompare(b.id || '');
      }
      if (sortBy === 'author') {
        const authorA = (a.author || '').trim();
        const authorB = (b.author || '').trim();
        const cmp = authorA.localeCompare(authorB, 'ko');
        if (cmp !== 0) return cmp;
        return parseDateToMs(b.createdAt) - parseDateToMs(a.createdAt);
      }
      return 0;
    });
  }, [messages, searchQuery, searchFilterType, sortBy]);

  // Extract unique authors for fast 1-click filter chips
  const uniqueAuthors = useMemo(() => {
    const set = new Set<string>();
    messages.forEach((m) => {
      const name = (m.author || '').trim();
      if (name && name !== '익명' && name !== '익명의 친구') {
        set.add(name);
      }
    });
    return Array.from(set).slice(0, 10);
  }, [messages]);

  // Highlight keyword helper
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === query.trim().toLowerCase() ? (
            <mark key={i} className="bg-amber-300 text-slate-900 px-0.5 rounded-xs font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  const studentName = currentStudent?.name || '우리 친구';
  const boardTitle = settings.boardTitle || currentTheme.defaultTitleTemplate(studentName);
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Dynamic banner & title styling that harmoniously adapts to active theme
  const bannerBgColor = settings.titleColor || currentTheme.primaryColor;
  const titleTextColor = currentTheme.titleTextColor || 'text-white';
  const badgeClass = currentTheme.badgeClass || 'bg-[#FFF6A9] text-[#6d4411] border-[#FFCA88]';
  const cardCounterClass = currentTheme.cardCounterClass || 'text-[#FFF6A9]';

  // Background styling based on theme and settings
  const getBoardBgStyle = () => {
    if (settings.layout === 'corkboard') {
      return 'bg-[#d8a36c] bg-[radial-gradient(#976937_1px,transparent_1px)] [background-size:16px_16px]';
    }
    if (settings.theme === 'graduation') {
      return 'bg-grid-chalkboard';
    }
    return `${currentTheme.boardBg} ${currentTheme.boardPatternClass}`;
  };

  return (
    <div className="relative pb-24">
      {/* Zoom / Full Message Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{selectedMessage.sticker}</span>
              <div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF6A9] text-[#6d4411] font-bold border border-[#FFCA88]">
                  {currentStudent?.name}에게 보낸 편지
                </span>
                <h3 className="text-base font-bold text-slate-800 font-jua mt-0.5">
                  보낸 사람: {selectedMessage.author}
                </h3>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-[#FFFDE8] border border-[#FFCA88]/70 my-3">
              <p
                className={`text-lg leading-relaxed text-slate-800 whitespace-pre-wrap break-keep ${
                  FONT_OPTIONS.find((f) => f.id === selectedMessage.font)?.fontClass || 'font-himelody'
                }`}
              >
                {selectedMessage.content}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
              <span>작성일시: {selectedMessage.createdAt}</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('이 메시지를 정말 삭제하시겠습니까?')) {
                    onDeleteMessage(selectedMessage.id);
                    setSelectedMessage(null);
                  }
                }}
                className="text-[#DE7272] hover:text-[#c45353] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Rolling Paper Target Area (Captured by html2canvas) */}
      <div
        id="rolling-paper-capture-target"
        className={`max-w-6xl mx-auto my-6 rounded-3xl shadow-xl overflow-hidden border border-[#FFCA88]/40 transition-colors ${getBoardBgStyle()}`}
      >
        {/* Top Celebration Header Banner with Theme Harmonious Color */}
        <div
          style={{ backgroundColor: bannerBgColor }}
          className="relative px-5 py-6 sm:px-8 sm:py-8 md:px-10 shadow-md overflow-hidden transition-colors duration-300 text-white"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6">
            <div className="space-y-2 flex-1 min-w-0 pr-0 md:pr-4">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs border shrink-0 ${badgeClass}`}>
                  {settings.schoolClass || '우리 반'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 shrink-0">
                  {currentTheme.badge}
                </span>
                {settings.showDate && (
                  <span className="flex items-center gap-1 text-xs text-white/90 ml-1 font-pretendard shrink-0">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{currentDate}</span>
                  </span>
                )}
              </div>

              {/* Title strictly guaranteed to be on ONE single line (whitespace-nowrap with responsive sizing and ellipsis) */}
              <div className="overflow-hidden">
                <h1 
                  title={boardTitle}
                  className={`text-lg sm:text-2xl md:text-[26px] lg:text-3xl xl:text-4xl font-title font-semibold tracking-tight ${titleTextColor} drop-shadow-xs leading-normal whitespace-nowrap overflow-hidden text-ellipsis`}
                >
                  {boardTitle}
                </h1>
              </div>

              <p className="text-xs sm:text-sm md:text-base text-white/95 font-pretendard whitespace-nowrap overflow-hidden text-ellipsis">
                {currentTheme.tagline}
              </p>
            </div>

            {/* Student Profile Card & Counter on Banner */}
            <div className="flex items-center gap-3.5 bg-white/20 backdrop-blur-md px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-white/30 self-start md:self-auto shrink-0 shadow-xs">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white text-slate-800 flex items-center justify-center text-2xl sm:text-3xl shadow-sm">
                {currentTheme.bannerIcon}
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-white/80 font-bold">
                  주인공
                </div>
                <div className="text-lg sm:text-xl font-title font-semibold text-white leading-tight">{studentName}</div>
                <div className={`text-xs font-bold mt-0.5 ${cardCounterClass}`}>
                  총 {messages.length}개의 따뜻한 메시지
                </div>
                {currentStudent && (
                  <button
                    type="button"
                    onClick={async () => {
                      const url = GasService.getShareUrl(currentStudent.name);
                      try {
                        await navigator.clipboard.writeText(url);
                        setCopiedShare(true);
                        setTimeout(() => setCopiedShare(false), 2000);
                      } catch {
                        // ignore
                      }
                    }}
                    className={`mt-2 flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 ${
                      copiedShare
                        ? 'bg-emerald-500 text-white border border-emerald-400'
                        : 'bg-[#FFF6A9] hover:bg-white text-[#6d4411] border border-[#FFCA88]'
                    }`}
                    title={`${studentName}에게 쓰는 공유 링크를 복사하여 아이들에게 보내세요`}
                  >
                    {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedShare ? '공유 링크 복사됨!' : `'${studentName}' 링크 복사`}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar (data-html2canvas-ignore prevents it from appearing on exported images) */}
        {messages.length > 0 && (
          <div 
            data-html2canvas-ignore="true" 
            className="px-5 sm:px-8 md:px-10 pt-5 pb-1"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-200/90 space-y-3">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                {/* Search Input Box */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="작성자 이름 또는 메시지 내용 검색... (예: 민준, 축하, 고마워)"
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] focus:bg-white transition-all text-slate-800 placeholder-slate-400 font-pretendard"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                      title="검색어 지우기"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Scope Pills and Sort Dropdown Menu */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end shrink-0">
                  {/* Filter Scope Pills */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSearchFilterType('all')}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                        searchFilterType === 'all'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      전체 검색
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchFilterType('author')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        searchFilterType === 'author'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>작성자</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchFilterType('content')}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                        searchFilterType === 'content'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <FileText className="w-3 h-3" />
                      <span>내용</span>
                    </button>
                  </div>

                  {/* Sort Dropdown Menu */}
                  <div className="relative flex items-center shrink-0">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 absolute left-3 pointer-events-none" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as MessageSortOption)}
                      aria-label="메시지 정렬 순서 선택"
                      className="appearance-none pl-8.5 pr-8 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 border border-slate-200/80 focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] focus:bg-white cursor-pointer transition-all shadow-2xs font-pretendard"
                    >
                      <option value="newest">최신순</option>
                      <option value="oldest">오래된순</option>
                      <option value="author">작성자 이름순</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  {/* Decorate Mode Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setIsDecoratingMode((prev) => !prev)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 ${
                      isDecoratingMode
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300 shadow-xs'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
                    }`}
                    title="스티커와 이모지로 롤링페이퍼 꾸미기"
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <span>{isDecoratingMode ? '꾸미기 닫기' : '스티커 꾸미기'}</span>
                    {placedStickers.length > 0 && !isDecoratingMode && (
                      <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {placedStickers.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Status and Quick Author Filter Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                {/* Result count, sort badge & reset */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500 font-medium font-pretendard">
                    {searchQuery.trim() ? (
                      <>
                        <span className="font-bold text-slate-800">'{searchQuery}'</span> 검색 결과:{' '}
                        <span className="font-bold text-[#DE7272]">{filteredMessages.length}</span>개
                        <span className="text-slate-400"> (전체 {messages.length}개 중)</span>
                      </>
                    ) : (
                      <>
                        총 <span className="font-bold text-slate-800">{messages.length}</span>개의 메시지가 있습니다
                      </>
                    )}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[11px] text-slate-600 font-semibold bg-slate-100/90 px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200/60">
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400" />
                    {sortBy === 'newest' && '최신순 정렬'}
                    {sortBy === 'oldest' && '오래된순 정렬'}
                    {sortBy === 'author' && '작성자 이름순 정렬'}
                  </span>
                  {searchQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchFilterType('all');
                      }}
                      className="text-[11px] text-[#DE7272] hover:text-[#c45353] font-bold flex items-center gap-1 underline cursor-pointer ml-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>전체 보기</span>
                    </button>
                  )}
                </div>

                {/* Quick author buttons */}
                {uniqueAuthors.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    <span className="text-slate-400 text-[11px] shrink-0 font-medium">작성자 바로찾기:</span>
                    {uniqueAuthors.map((author) => {
                      const isActive = searchQuery.trim() === author && searchFilterType === 'author';
                      return (
                        <button
                          key={author}
                          type="button"
                          onClick={() => {
                            if (isActive) {
                              setSearchQuery('');
                              setSearchFilterType('all');
                            } else {
                              setSearchQuery(author);
                              setSearchFilterType('author');
                            }
                          }}
                          className={`px-2.5 py-0.5 rounded-full text-[11px] transition-all cursor-pointer shrink-0 font-medium border ${
                            isActive
                              ? 'bg-slate-900 text-white font-bold border-slate-900 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {author}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Board Canvas Area with Messages & Decorative Stickers */}
        <div ref={canvasContainerRef} className="relative p-6 sm:p-10 min-h-[500px]">
          {/* Sticker Decorate Layer */}
          <StickerDecorateLayer
            isDecoratingMode={isDecoratingMode}
            stickers={placedStickers}
            themeStickers={currentTheme.stickers}
            onAddSticker={handleAddSticker}
            onUpdateSticker={handleUpdateSticker}
            onDeleteSticker={handleDeleteSticker}
            onClearAllStickers={handleClearAllStickers}
            onCloseDecoratingMode={() => setIsDecoratingMode(false)}
            containerRef={canvasContainerRef}
          />

          {messages.length === 0 ? (
            /* Total Empty state */
            <div className="py-20 text-center max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/80 shadow-md flex items-center justify-center text-4xl mb-4">
                💌
              </div>
              <h3 className="text-xl font-bold text-slate-800 font-jua mb-2">
                아직 작성된 메시지가 없어요!
              </h3>
              <p className="text-sm text-slate-600 mb-6 font-gowun">
                {studentName}에게 첫 번째 축하와 응원의 메시지를 남겨보세요.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={onOpenCompose}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <PenTool className="w-4 h-4" />
                  <span>첫 메시지 쓰러 가기</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsDecoratingMode(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>스티커로 꾸미기</span>
                </button>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            /* Search Empty state */
            <div className="py-16 text-center max-w-md mx-auto bg-white/80 backdrop-blur-xs rounded-3xl p-8 border border-slate-200/80 shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-800 font-jua mb-1">
                '{searchQuery}'에 대한 메시지를 찾지 못했어요
              </h4>
              <p className="text-xs text-slate-500 mb-5 font-pretendard">
                작성자 이름이나 메시지 안의 다른 키워드로 다시 검색해 보세요.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchFilterType('all');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>전체 메시지 ({messages.length}개) 다시 보기</span>
              </button>
            </div>
          ) : (
            /* Layout renderer with filteredMessages */
            <div>
              {/* Sticky Notes Layout */}
              {settings.layout === 'sticky' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                  {filteredMessages.map((msg, index) => {
                    const colorConf = NOTE_COLORS[msg.color] || NOTE_COLORS.yellow;
                    const fontCls =
                      FONT_OPTIONS.find((f) => f.id === msg.font)?.fontClass || 'font-himelody';
                    const rot = msg.rotation !== undefined ? msg.rotation : ((index % 5) - 2) * 1.5;

                    return (
                      <div
                        key={msg.id}
                        style={{ transform: `rotate(${rot}deg)` }}
                        className={`group relative p-5 rounded-2xl ${colorConf.bg} ${colorConf.border} border shadow-md hover:shadow-xl hover:scale-105 hover:z-20 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[180px]`}
                        onClick={() => setSelectedMessage(msg)}
                      >
                        {/* Scotch tape styling on top */}
                        <div className="tape-top" />

                        {/* Top sticker & zoom button */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl drop-shadow-xs">{msg.sticker}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700">
                            <Maximize2 className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* Note Content */}
                        <p
                          className={`text-base leading-relaxed ${colorConf.text} ${fontCls} my-2 line-clamp-6 whitespace-pre-wrap break-keep`}
                        >
                          {searchQuery.trim() ? highlightMatch(msg.content, searchQuery) : msg.content}
                        </p>

                        {/* Bottom Author Tag */}
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs mt-auto">
                          <span className="font-bold text-slate-800 font-jua">
                            From. {searchQuery.trim() ? highlightMatch(msg.author, searchQuery) : msg.author}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {msg.createdAt.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Grid Layout */}
              {settings.layout === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {filteredMessages.map((msg) => {
                    const fontCls =
                      FONT_OPTIONS.find((f) => f.id === msg.font)?.fontClass || 'font-himelody';

                    return (
                      <div
                        key={msg.id}
                        onClick={() => setSelectedMessage(msg)}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer hover:border-slate-300"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{msg.sticker}</span>
                            <span className="font-bold text-sm text-slate-800 font-jua">
                              {searchQuery.trim() ? highlightMatch(msg.author, searchQuery) : msg.author}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{msg.createdAt.split(' ')[0]}</span>
                        </div>
                        <p className={`text-base text-slate-700 leading-relaxed ${fontCls} my-2 whitespace-pre-wrap line-clamp-5 break-keep`}>
                          {searchQuery.trim() ? highlightMatch(msg.content, searchQuery) : msg.content}
                        </p>
                        <div className="pt-2 text-right">
                          <span className="text-xs text-rose-500 font-bold hover:underline">
                            자세히 보기 →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Polaroid Layout */}
              {settings.layout === 'polaroid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMessages.map((msg, index) => {
                    const colorConf = NOTE_COLORS[msg.color] || NOTE_COLORS.yellow;
                    const fontCls =
                      FONT_OPTIONS.find((f) => f.id === msg.font)?.fontClass || 'font-himelody';
                    const rot = ((index % 6) - 3) * 1.5;

                    return (
                      <div
                        key={msg.id}
                        style={{ transform: `rotate(${rot}deg)` }}
                        onClick={() => setSelectedMessage(msg)}
                        className="bg-white p-3 pb-5 rounded-lg shadow-md hover:shadow-xl hover:scale-105 hover:z-20 transition-all cursor-pointer border border-slate-200/80 flex flex-col"
                      >
                        {/* Polaroid inner frame */}
                        <div
                          className={`p-4 rounded-sm ${colorConf.bg} aspect-4/3 flex flex-col justify-between overflow-hidden relative border border-black/5`}
                        >
                          <div className="text-2xl absolute top-2 right-2">{msg.sticker}</div>
                          <p
                            className={`text-sm text-slate-800 ${fontCls} mt-4 line-clamp-4 leading-relaxed break-keep`}
                          >
                            {searchQuery.trim() ? highlightMatch(msg.content, searchQuery) : msg.content}
                          </p>
                        </div>
                        {/* Polaroid handwritten caption */}
                        <div className="mt-3 px-1 text-center font-poorstory font-bold text-base text-slate-700">
                          - {searchQuery.trim() ? highlightMatch(msg.author, searchQuery) : msg.author}의 마음 -
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Corkboard Layout */}
              {settings.layout === 'corkboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                  {filteredMessages.map((msg, index) => {
                    const colorConf = NOTE_COLORS[msg.color] || NOTE_COLORS.yellow;
                    const fontCls =
                      FONT_OPTIONS.find((f) => f.id === msg.font)?.fontClass || 'font-himelody';
                    const rot = ((index % 5) - 2) * 2;

                    return (
                      <div
                        key={msg.id}
                        style={{ transform: `rotate(${rot}deg)` }}
                        onClick={() => setSelectedMessage(msg)}
                        className={`group relative p-5 pt-6 rounded-xl ${colorConf.bg} ${colorConf.border} border-2 shadow-lg hover:shadow-2xl hover:scale-105 transition-all cursor-pointer flex flex-col justify-between min-h-[190px]`}
                      >
                        {/* Pushpin at top center */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-[#DE7272] shadow-md border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                          📌
                        </div>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl">{msg.sticker}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {msg.createdAt.split(' ')[0]}
                          </span>
                        </div>

                        <p className={`text-base leading-relaxed ${colorConf.text} ${fontCls} my-2 line-clamp-5 break-keep`}>
                          {searchQuery.trim() ? highlightMatch(msg.content, searchQuery) : msg.content}
                        </p>

                        <div className="pt-2 border-t border-black/10 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900 font-jua">
                            To. {studentName}
                          </span>
                          <span className="font-bold text-slate-700 font-jua">
                            From. {searchQuery.trim() ? highlightMatch(msg.author, searchQuery) : msg.author}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Board Footer / Stamp */}
        <div className="px-6 py-4 bg-black/5 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-1.5 font-gowun">
            <span>✨ {settings.schoolClass || '우리 반'} {studentName}의 롤링페이퍼</span>
            <span>·</span>
            <span>{currentDate} 기준</span>
          </div>
          <div className="text-[11px] text-slate-400">
            소중한 마음을 이미지로 저장해 평생 간직하세요
          </div>
        </div>
      </div>

      {/* Floating Action Bar (Write Message, Decorate Mode, Export Image) */}
      {!isDecoratingMode && (
        <div 
          data-html2canvas-ignore="true"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-3 bg-white/95 backdrop-blur-md px-3 sm:px-4 py-2.5 rounded-full shadow-2xl border border-[#FFCA88]/50"
        >
          <button
            type="button"
            onClick={onOpenCompose}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">{studentName}에게</span>
            <span>글 남기기</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDecoratingMode(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
            title="스티커와 이모지로 롤링페이퍼 꾸미기"
          >
            <Palette className="w-4 h-4 text-amber-600" />
            <span>스티커 꾸미기</span>
            {placedStickers.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {placedStickers.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onExportImage}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#FFF6A9]" />
            <span className="hidden sm:inline">고화질</span>
            <span>이미지 저장</span>
          </button>
        </div>
      )}
    </div>
  );
};
