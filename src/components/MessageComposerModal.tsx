import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Dices, 
  Sparkles, 
  Smile, 
  Type, 
  Palette, 
  Heart, 
  HelpCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Student, RollingTheme, Message, FontId } from '../types';
import { NOTE_COLORS, FONT_OPTIONS } from '../constants/themes';

interface MessageComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudent: Student | null;
  currentTheme: RollingTheme;
  onSubmitMessage: (msg: Omit<Message, 'id' | 'createdAt'>) => Promise<void>;
}

const NICKNAME_ADJECTIVES = [
  '친절한', '용감한', '달콤한', '행복한', '귀여운', 
  '따뜻한', '반짝이는', '든든한', '장난꾸러기', '빛나는', '사랑스런'
];
const NICKNAME_NOUNS = [
  '짝꿍', '친구', '쿼카', '판다', '고양이', 
  '토끼', '펭귄', '다람쥐', '돌고래', '햄스터', '딸기', '푸딩'
];

export const MessageComposerModal: React.FC<MessageComposerModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudent,
  currentTheme,
  onSubmitMessage,
}) => {
  const [recipient, setRecipient] = useState<string>(currentStudent?.name || '');
  const [author, setAuthor] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [color, setColor] = useState<string>('butter');
  const [font, setFont] = useState<FontId>('himelody');
  const [selectedSticker, setSelectedSticker] = useState<string>(
    currentTheme.stickers[0]?.emoji || '💌'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);

  useEffect(() => {
    if (currentStudent) {
      setRecipient(currentStudent.name);
    }
  }, [currentStudent]);

  useEffect(() => {
    if (currentTheme.stickers.length > 0) {
      setSelectedSticker(currentTheme.stickers[0].emoji);
    }
  }, [currentTheme]);

  if (!isOpen) return null;

  const handleRandomNickname = () => {
    const adj = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)];
    const noun = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)];
    setAuthor(`${adj} ${noun}`);
  };

  const handleApplyPrompt = (promptText: string) => {
    if (!content.trim()) {
      setContent(promptText);
    } else {
      setContent(prev => `${prev}\n${promptText}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !recipient.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitMessage({
        studentName: recipient,
        author: author.trim() || '익명의 친구',
        content: content.trim(),
        sticker: selectedSticker,
        color,
        font,
      });

      // Confetti celebratory burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setContent('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorConfig = NOTE_COLORS[color] || NOTE_COLORS.yellow;
  const fontClass = FONT_OPTIONS.find(f => f.id === font)?.fontClass || 'font-himelody';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#DE7272]/15 via-[#FFCA88]/25 to-[#FFF6A9]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DE7272] text-white flex items-center justify-center text-xl shadow-xs">
              ✏️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-jua">
                롤링페이퍼 메시지 남기기
              </h2>
              <p className="text-xs text-slate-500">
                친구에게 따뜻한 마음과 추억의 한마디를 적어보세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* Row 1: Recipient & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                받는 친구 <span className="text-[#DE7272]">*</span>
              </label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#DE7272]"
              >
                {students.map((st) => (
                  <option key={st.id || st.name} value={st.name}>
                    {st.name} ({st.gradeClass || '우리 반'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  보내는 사람 (이름 또는 별명)
                </label>
                <button
                  type="button"
                  onClick={handleRandomNickname}
                  className="text-[11px] text-[#DE7272] hover:text-[#c45353] flex items-center gap-1 font-bold cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>귀여운 별명 뽑기</span>
                </button>
              </div>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="예: 짝꿍 민준이, 친절한 토끼 (비워두면 익명)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DE7272]"
              />
            </div>
          </div>

          {/* Row 2: Message Content & Prompt helpers */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                메시지 내용 <span className="text-[#DE7272]">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPrompts(!showPrompts)}
                className="text-[11px] text-[#6d4411] bg-[#FFF6A9] hover:bg-[#ffefa0] border border-[#FFCA88] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-[#DE7272]" />
                <span>{showPrompts ? '추천 문구 닫기' : '무슨 말을 쓸지 고민될 때?'}</span>
              </button>
            </div>

            {/* Prompt Helper pills */}
            {showPrompts && (
              <div className="mb-2 p-3 bg-[#FFFDE8] rounded-2xl border border-[#FFCA88] space-y-1.5">
                <p className="text-xs font-bold text-[#6d4411]">
                  💡 클릭하면 메시지 입력창에 바로 들어갑니다:
                </p>
                <div className="flex flex-col gap-1.5">
                  {currentTheme.suggestedPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPrompt(p)}
                      className="text-left text-xs bg-white hover:bg-[#FFF6A9]/60 p-2 rounded-xl text-slate-700 border border-[#FFCA88]/50 transition-colors cursor-pointer"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`${recipient ? `${recipient}에게` : '친구에게'} 전하고 싶은 따뜻한 축하와 응원의 메시지를 적어보세요...`}
              className={`w-full p-3.5 rounded-2xl border border-slate-200 text-base focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] ${fontClass}`}
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>{content.length}자 작성 중</span>
              <span>구글 시트의 {recipient} 탭에 자동 기록됩니다</span>
            </div>
          </div>

          {/* Row 3: Note color & font */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Color picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-[#DE7272]" />
                <span>메모지 색상</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {(['butter', 'peach', 'coral', 'cream', 'mint', 'sky', 'white'] as const).map((key) => {
                  const col = NOTE_COLORS[key];
                  if (!col) return null;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColor(key)}
                      className={`w-8 h-8 rounded-xl ${col.bg} border-2 transition-all flex items-center justify-center cursor-pointer ${
                        color === key
                          ? 'border-slate-800 scale-110 shadow-xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                      title={col.name}
                    >
                      {color === key && <span className="text-xs font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Font picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-indigo-500" />
                <span>글씨체 선택</span>
              </label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value as FontId)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Sticker / Emoji selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
              <Smile className="w-3.5 h-3.5 text-amber-500" />
              <span>스티커 붙이기 ({currentTheme.name})</span>
            </label>
            <div className="flex items-center gap-2 overflow-x-auto p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              {currentTheme.stickers.map((stk) => (
                <button
                  key={stk.id}
                  type="button"
                  onClick={() => setSelectedSticker(stk.emoji)}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all shrink-0 ${
                    selectedSticker === stk.emoji
                      ? 'bg-white shadow-sm ring-2 ring-rose-400 scale-110'
                      : 'hover:bg-slate-200/60'
                  }`}
                  title={stk.label}
                >
                  {stk.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Realtime Note Preview */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              붙여질 포스트잇 미리보기
            </label>
            <div
              className={`p-4 rounded-2xl ${colorConfig.bg} ${colorConfig.border} border shadow-xs relative transition-all`}
            >
              <div className="absolute top-2 right-3 text-2xl">{selectedSticker}</div>
              <p className={`text-base ${colorConfig.text} ${fontClass} min-h-12 whitespace-pre-wrap`}>
                {content.trim() || '친구에게 전할 예쁜 메시지가 여기에 표시됩니다.'}
              </p>
              <div className="mt-2 pt-2 border-t border-black/5 flex justify-between items-center text-xs opacity-75">
                <span className="font-bold font-jua">
                  From. {author.trim() || '익명의 친구'}
                </span>
                <span className="text-[11px]">To. {recipient}</span>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || !recipient.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] disabled:opacity-50 text-white font-bold text-base shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>롤링페이퍼에 부착하기!</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
