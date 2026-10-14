import React, { useState, useRef, useEffect } from 'react';
import { PlacedSticker, Sticker } from '../types';
import { 
  RotateCw, 
  Trash2, 
  Plus, 
  Minus, 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  Smile, 
  Tag, 
  Heart, 
  Palette,
  PartyPopper
} from 'lucide-react';

interface StickerDecorateLayerProps {
  isDecoratingMode: boolean;
  stickers: PlacedSticker[];
  themeStickers: Sticker[];
  onAddSticker: (sticker: Omit<PlacedSticker, 'id' | 'zIndex'>) => void;
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onDeleteSticker: (id: string) => void;
  onClearAllStickers: () => void;
  onCloseDecoratingMode: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

// Preset sticker categories
const CELEBRATION_STICKERS = [
  { emoji: '🎂', label: '케이크' },
  { emoji: '🎉', label: '폭죽' },
  { emoji: '🎊', label: '꽃가루' },
  { emoji: '🥳', label: '축하얼굴' },
  { emoji: '🎁', label: '선물' },
  { emoji: '🎈', label: '풍선' },
  { emoji: '🍰', label: '조각케이크' },
  { emoji: '🥂', label: '건배' },
  { emoji: '💐', label: '꽃다발' },
  { emoji: '🍭', label: '사탕' },
  { emoji: '🧁', label: '머핀' },
  { emoji: '🎇', label: '불꽃' },
];

const FRIENDSHIP_STICKERS = [
  { emoji: '💖', label: '반짝하트' },
  { emoji: '🍀', label: '네잎클로버' },
  { emoji: '⭐', label: '별' },
  { emoji: '🌟', label: '빛나는별' },
  { emoji: '✨', label: '반짝이' },
  { emoji: '💌', label: '편지' },
  { emoji: '🥰', label: '하트얼굴' },
  { emoji: '🤗', label: '포옹' },
  { emoji: '👍', label: '최고' },
  { emoji: '👏', label: '박수' },
  { emoji: '💯', label: '백점' },
  { emoji: '👑', label: '왕관' },
];

const SCHOOL_STICKERS = [
  { emoji: '📚', label: '책' },
  { emoji: '✏️', label: '연필' },
  { emoji: '🎨', label: '팔레트' },
  { emoji: '🎓', label: '학사모' },
  { emoji: '🎒', label: '책가방' },
  { emoji: '⚽', label: '축구공' },
  { emoji: '🏀', label: '농구공' },
  { emoji: '🚀', label: '로켓' },
  { emoji: '🌈', label: '무지개' },
  { emoji: '✈️', label: '비행기' },
  { emoji: '🔔', label: '종' },
  { emoji: '🏷️', label: '이름표' },
];

const CUTE_ANIMAL_STICKERS = [
  { emoji: '🐻', label: '곰돌이' },
  { emoji: '🐰', label: '토끼' },
  { emoji: '🐱', label: '고양이' },
  { emoji: '🐶', label: '강아지' },
  { emoji: '🐣', label: '병아리' },
  { emoji: '🐼', label: '판다' },
  { emoji: '🦊', label: '여우' },
  { emoji: '🐹', label: '햄스터' },
  { emoji: '🌻', label: '해바라기' },
  { emoji: '🌷', label: '튤립' },
  { emoji: '🌸', label: '벚꽃' },
  { emoji: '🍀', label: '클로버' },
];

const PRESET_BADGES = [
  { text: '💖 사랑해', bg: 'bg-rose-500', textCol: 'text-white' },
  { text: '👍 최고야!', bg: 'bg-amber-500', textCol: 'text-white' },
  { text: '🍀 항상 응원해', bg: 'bg-emerald-600', textCol: 'text-white' },
  { text: '🎉 축하해!', bg: 'bg-indigo-600', textCol: 'text-white' },
  { text: '✨ 넌 특별해', bg: 'bg-violet-600', textCol: 'text-white' },
  { text: '🌸 꽃길만 걷자', bg: 'bg-pink-500', textCol: 'text-white' },
  { text: '👑 우리반 자랑', bg: 'bg-amber-600', textCol: 'text-white' },
  { text: '💌 소중한 친구', bg: 'bg-sky-600', textCol: 'text-white' },
];

type CategoryId = 'theme' | 'celebrate' | 'friendship' | 'school' | 'animals' | 'badges';

export const StickerDecorateLayer: React.FC<StickerDecorateLayerProps> = ({
  isDecoratingMode,
  stickers,
  themeStickers,
  onAddSticker,
  onUpdateSticker,
  onDeleteSticker,
  onClearAllStickers,
  onCloseDecoratingMode,
  containerRef,
}) => {
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('theme');
  const [customInput, setCustomInput] = useState<string>('');
  const [draggedStickerId, setDraggedStickerId] = useState<string | null>(null);

  // Dragging state for canvas items
  const dragRef = useRef<{
    stickerId: string;
    startX: number;
    startY: number;
    initialStickerX: number;
    initialStickerY: number;
    containerWidth: number;
    containerHeight: number;
  } | null>(null);

  // Deselect sticker when clicking empty space
  const handleCanvasClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.sticker-item')) {
      return;
    }
    setSelectedStickerId(null);
  };

  // Start dragging a placed sticker on the canvas
  const handleStickerPointerDown = (
    e: React.MouseEvent | React.TouchEvent,
    sticker: PlacedSticker
  ) => {
    if (!isDecoratingMode) return;
    e.stopPropagation();

    setSelectedStickerId(sticker.id);

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    dragRef.current = {
      stickerId: sticker.id,
      startX: clientX,
      startY: clientY,
      initialStickerX: sticker.x,
      initialStickerY: sticker.y,
      containerWidth: rect.width,
      containerHeight: rect.height,
    };

    setDraggedStickerId(sticker.id);
  };

  // Global mousemove and mouseup listeners for smooth dragging
  useEffect(() => {
    if (!isDecoratingMode) return;

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      const deltaX = clientX - dragRef.current.startX;
      const deltaY = clientY - dragRef.current.startY;

      const deltaXPercent = (deltaX / dragRef.current.containerWidth) * 100;
      const deltaYPercent = (deltaY / dragRef.current.containerHeight) * 100;

      const newX = Math.max(3, Math.min(95, dragRef.current.initialStickerX + deltaXPercent));
      const newY = Math.max(3, Math.min(95, dragRef.current.initialStickerY + deltaYPercent));

      onUpdateSticker(dragRef.current.stickerId, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      });
    };

    const handlePointerUp = () => {
      dragRef.current = null;
      setDraggedStickerId(null);
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDecoratingMode, onUpdateSticker]);

  // Handle rotate
  const handleRotate = (id: string, currentRot: number) => {
    const nextRot = (currentRot + 15) % 360;
    onUpdateSticker(id, { rotation: nextRot > 180 ? nextRot - 360 : nextRot });
  };

  // Handle cycle size: sm -> md -> lg -> xl -> sm
  const handleCycleSize = (id: string, currentSize: 'sm' | 'md' | 'lg' | 'xl') => {
    const sizes: ('sm' | 'md' | 'lg' | 'xl')[] = ['sm', 'md', 'lg', 'xl'];
    const nextIndex = (sizes.indexOf(currentSize) + 1) % sizes.length;
    onUpdateSticker(id, { size: sizes[nextIndex] });
  };

  // Bring sticker to front
  const handleBringToFront = (id: string) => {
    const maxZ = stickers.reduce((max, s) => Math.max(max, s.zIndex || 1), 1);
    onUpdateSticker(id, { zIndex: maxZ + 1 });
  };

  // Quick add sticker near center with gentle random distribution
  const handleQuickAddSticker = (
    emoji: string,
    label?: string,
    isBadge = false,
    badgeBg?: string,
    badgeTextColor?: string
  ) => {
    const randomOffsetX = (Math.random() - 0.5) * 40; // -20% to +20%
    const randomOffsetY = (Math.random() - 0.5) * 40; // -20% to +20%
    const randomRot = Math.floor(Math.random() * 25) - 12; // -12 to +12 deg

    const newX = Math.max(8, Math.min(90, 50 + randomOffsetX));
    const newY = Math.max(8, Math.min(90, 45 + randomOffsetY));

    onAddSticker({
      emoji,
      label,
      x: Math.round(newX),
      y: Math.round(newY),
      size: isBadge ? 'md' : 'lg',
      rotation: randomRot,
      isBadge,
      badgeBg,
      badgeTextColor,
    });
  };

  // Add custom sticker
  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const val = customInput.trim();
    if (!val) return;

    // Check if it looks like a badge with text (> 2 chars or contains korean/alphanumeric)
    const isBadge = val.length > 2 || /[\w가-힣]/.test(val);
    handleQuickAddSticker(val, val, isBadge, isBadge ? 'bg-[#DE7272]' : undefined, 'text-white');
    setCustomInput('');
  };

  // HTML5 Drag and drop from tray to canvas
  const handleDragStartFromTray = (
    e: React.DragEvent,
    item: { emoji: string; label?: string; isBadge?: boolean; badgeBg?: string; badgeTextColor?: string }
  ) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(item));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    if (!isDecoratingMode) return;
    e.preventDefault();

    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;

    try {
      const item = JSON.parse(data);
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const dropXPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const dropYPercent = ((e.clientY - rect.top) / rect.height) * 100;

      onAddSticker({
        emoji: item.emoji,
        label: item.label,
        x: Math.max(4, Math.min(94, Math.round(dropXPercent))),
        y: Math.max(4, Math.min(94, Math.round(dropYPercent))),
        size: item.isBadge ? 'md' : 'lg',
        rotation: Math.floor(Math.random() * 20) - 10,
        isBadge: item.isBadge,
        badgeBg: item.badgeBg,
        badgeTextColor: item.badgeTextColor,
      });
    } catch {
      // Ignore invalid drag data
    }
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    if (!isDecoratingMode) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const getSizeClass = (size: 'sm' | 'md' | 'lg' | 'xl', isBadge?: boolean) => {
    if (isBadge) {
      switch (size) {
        case 'sm': return 'text-xs px-2.5 py-1';
        case 'md': return 'text-sm px-3.5 py-1.5';
        case 'lg': return 'text-base px-4 py-2 font-bold';
        case 'xl': return 'text-lg px-5 py-2.5 font-bold';
      }
    }
    switch (size) {
      case 'sm': return 'text-2xl sm:text-3xl';
      case 'md': return 'text-4xl sm:text-5xl';
      case 'lg': return 'text-5xl sm:text-6xl';
      case 'xl': return 'text-6xl sm:text-7xl';
    }
  };

  return (
    <>
      {/* Interactive Placed Stickers Layer on the Board Canvas */}
      <div
        onClick={handleCanvasClick}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        className={`absolute inset-0 z-20 pointer-events-none ${
          isDecoratingMode ? 'pointer-events-auto cursor-crosshair' : ''
        }`}
      >
        {stickers.map((sticker) => {
          const isSelected = selectedStickerId === sticker.id;
          const isBeingDragged = draggedStickerId === sticker.id;

          return (
            <div
              key={sticker.id}
              style={{
                left: `${sticker.x}%`,
                top: `${sticker.y}%`,
                zIndex: sticker.zIndex || (isSelected ? 50 : 25),
                transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
              }}
              onMouseDown={(e) => handleStickerPointerDown(e, sticker)}
              onTouchStart={(e) => handleStickerPointerDown(e, sticker)}
              className={`sticker-item absolute select-none transition-shadow ${
                isDecoratingMode
                  ? 'pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-105'
                  : 'pointer-events-auto cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-200'
              } ${isBeingDragged ? 'opacity-90 scale-105' : ''}`}
            >
              {/* Sticker Content (Badge or Emoji) */}
              <div
                className={`relative inline-flex items-center justify-center transition-all ${
                  sticker.isBadge
                    ? `${sticker.badgeBg || 'bg-[#DE7272]'} ${
                        sticker.badgeTextColor || 'text-white'
                      } rounded-full shadow-md font-jua border-2 border-white/80 whitespace-nowrap ${getSizeClass(
                        sticker.size,
                        true
                      )}`
                    : `drop-shadow-md ${getSizeClass(sticker.size, false)}`
                }`}
              >
                <span>{sticker.emoji}</span>

                {/* Edit Bounding Ring when in decorating mode */}
                {isDecoratingMode && (
                  <div
                    data-html2canvas-ignore="true"
                    className={`absolute -inset-2.5 rounded-2xl border-2 border-dashed transition-colors pointer-events-none ${
                      isSelected
                        ? 'border-[#DE7272] bg-[#DE7272]/10 ring-4 ring-[#DE7272]/20'
                        : 'border-slate-400/60 hover:border-slate-600'
                    }`}
                  />
                )}
              </div>

              {/* Floating Action Controls for Selected Sticker in Decorating Mode */}
              {isDecoratingMode && isSelected && (
                <div
                  data-html2canvas-ignore="true"
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/95 backdrop-blur-md px-2 py-1 rounded-full shadow-xl border border-white/20 text-white z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  {/* Rotate */}
                  <button
                    type="button"
                    onClick={() => handleRotate(sticker.id, sticker.rotation)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-slate-200 hover:text-white"
                    title="15도 회전"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Size Toggle */}
                  <button
                    type="button"
                    onClick={() => handleCycleSize(sticker.id, sticker.size)}
                    className="px-1.5 py-0.5 hover:bg-white/20 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer text-amber-300"
                    title="크기 변경 (소/중/대/특대)"
                  >
                    {sticker.size}
                  </button>

                  {/* Bring to Front */}
                  <button
                    type="button"
                    onClick={() => handleBringToFront(sticker.id)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer text-slate-200 hover:text-white"
                    title="맨 앞으로 가져오기"
                  >
                    <Layers className="w-3.5 h-3.5" />
                  </button>

                  <div className="w-px h-3.5 bg-white/20 mx-0.5" />

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => onDeleteSticker(sticker.id)}
                    className="p-1.5 hover:bg-rose-500 rounded-full transition-colors cursor-pointer text-rose-300 hover:text-white"
                    title="스티커 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decorating Mode Active Banner Notification on Top of Board */}
      {isDecoratingMode && (
        <div 
          data-html2canvas-ignore="true"
          className="mx-5 sm:mx-8 md:mx-10 mt-3 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/60 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-800 animate-in fade-in slide-in-from-top-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              🎨
            </span>
            <div className="font-pretendard">
              <strong className="text-slate-900 font-bold">스티커 꾸미기 모드 진행 중:</strong> 하단 스티커를 클릭하거나 원하는 위치로 드래그하여 배치하세요! (이동, 회전, 크기 조절 가능)
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {stickers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('이 롤링페이퍼에 배치된 모든 스티커를 삭제하시겠습니까?')) {
                    onClearAllStickers();
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-white/80 hover:bg-white text-rose-600 border border-rose-200 font-bold text-[11px] transition-all cursor-pointer shadow-2xs flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>모두 지우기</span>
              </button>
            )}

            <button
              type="button"
              onClick={onCloseDecoratingMode}
              className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>꾸미기 완료</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Bottom Sticker Drawer / Dock (Only visible in decorating mode) */}
      {isDecoratingMode && (
        <div
          data-html2canvas-ignore="true"
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-10px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-6 duration-200"
        >
          <div className="max-w-4xl mx-auto space-y-3">
            {/* Drawer Top Header: Categories & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              {/* Category Segmented Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveCategory('theme')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'theme'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>🎈</span>
                  <span>테마 스티커</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('celebrate')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'celebrate'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>🎉</span>
                  <span>축하 & 파티</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('friendship')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'friendship'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>💖</span>
                  <span>우정 & 칭찬</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('school')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'school'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>🏫</span>
                  <span>학교 & 청춘</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('animals')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'animals'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>🐾</span>
                  <span>동물 & 자연</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('badges')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    activeCategory === 'badges'
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>💬</span>
                  <span>칭찬 배지</span>
                </button>
              </div>

              {/* Status & Close button */}
              <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-pretendard">
                <span className="text-slate-500 font-medium">
                  현재 <strong className="text-[#DE7272]">{stickers.length}</strong>개 배치됨
                </span>

                <button
                  type="button"
                  onClick={onCloseDecoratingMode}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>꾸미기 완료</span>
                </button>
              </div>
            </div>

            {/* Sticker Tray Grid / List */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1">
              {/* Category 1: Theme Stickers */}
              {activeCategory === 'theme' && (
                <>
                  {themeStickers.map((stk) => (
                    <button
                      key={stk.id}
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStartFromTray(e, { emoji: stk.emoji, label: stk.label })}
                      onClick={() => handleQuickAddSticker(stk.emoji, stk.label)}
                      className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80 hover:border-amber-300 min-w-[58px] shrink-0"
                      title={`${stk.label} (클릭하거나 보드로 드래그)`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{stk.emoji}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-amber-800 font-medium mt-0.5 truncate max-w-[54px]">
                        {stk.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Category 2: Celebration */}
              {activeCategory === 'celebrate' && (
                <>
                  {CELEBRATION_STICKERS.map((stk, idx) => (
                    <button
                      key={idx}
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStartFromTray(e, { emoji: stk.emoji, label: stk.label })}
                      onClick={() => handleQuickAddSticker(stk.emoji, stk.label)}
                      className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-rose-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80 hover:border-rose-300 min-w-[58px] shrink-0"
                      title={`${stk.label} (클릭하거나 보드로 드래그)`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{stk.emoji}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-rose-800 font-medium mt-0.5 truncate max-w-[54px]">
                        {stk.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Category 3: Friendship */}
              {activeCategory === 'friendship' && (
                <>
                  {FRIENDSHIP_STICKERS.map((stk, idx) => (
                    <button
                      key={idx}
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStartFromTray(e, { emoji: stk.emoji, label: stk.label })}
                      onClick={() => handleQuickAddSticker(stk.emoji, stk.label)}
                      className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80 hover:border-emerald-300 min-w-[58px] shrink-0"
                      title={`${stk.label} (클릭하거나 보드로 드래그)`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{stk.emoji}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-emerald-800 font-medium mt-0.5 truncate max-w-[54px]">
                        {stk.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Category 4: School */}
              {activeCategory === 'school' && (
                <>
                  {SCHOOL_STICKERS.map((stk, idx) => (
                    <button
                      key={idx}
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStartFromTray(e, { emoji: stk.emoji, label: stk.label })}
                      onClick={() => handleQuickAddSticker(stk.emoji, stk.label)}
                      className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-indigo-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80 hover:border-indigo-300 min-w-[58px] shrink-0"
                      title={`${stk.label} (클릭하거나 보드로 드래그)`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{stk.emoji}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-indigo-800 font-medium mt-0.5 truncate max-w-[54px]">
                        {stk.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Category 5: Animals & Nature */}
              {activeCategory === 'animals' && (
                <>
                  {CUTE_ANIMAL_STICKERS.map((stk, idx) => (
                    <button
                      key={idx}
                      type="button"
                      draggable
                      onDragStart={(e) => handleDragStartFromTray(e, { emoji: stk.emoji, label: stk.label })}
                      onClick={() => handleQuickAddSticker(stk.emoji, stk.label)}
                      className="group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-amber-50 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-slate-200/80 hover:border-amber-300 min-w-[58px] shrink-0"
                      title={`${stk.label} (클릭하거나 보드로 드래그)`}
                    >
                      <span className="text-3xl filter drop-shadow-xs">{stk.emoji}</span>
                      <span className="text-[10px] text-slate-500 group-hover:text-amber-800 font-medium mt-0.5 truncate max-w-[54px]">
                        {stk.label}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Category 6: Badges */}
              {activeCategory === 'badges' && (
                <>
                  {PRESET_BADGES.map((badge, idx) => (
                    <button
                      key={idx}
                      type="button"
                      draggable
                      onDragStart={(e) =>
                        handleDragStartFromTray(e, {
                          emoji: badge.text,
                          label: badge.text,
                          isBadge: true,
                          badgeBg: badge.bg,
                          badgeTextColor: badge.textCol,
                        })
                      }
                      onClick={() =>
                        handleQuickAddSticker(
                          badge.text,
                          badge.text,
                          true,
                          badge.bg,
                          badge.textCol
                        )
                      }
                      className={`group px-3.5 py-2 rounded-full ${badge.bg} ${badge.textCol} hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-white/80 shadow-xs font-jua text-xs whitespace-nowrap shrink-0`}
                    >
                      {badge.text}
                    </button>
                  ))}
                </>
              )}

              {/* Custom Emoji / Text Input Form */}
              <form onSubmit={handleAddCustom} className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-slate-200">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="원하는 이모지나 문구 (예: 🌟, 최고)"
                  maxLength={12}
                  className="w-36 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] focus:bg-white transition-all font-pretendard"
                />
                <button
                  type="submit"
                  disabled={!customInput.trim()}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 disabled:bg-slate-200 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
