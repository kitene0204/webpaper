import React, { useState } from 'react';
import { 
  Student, 
  Message, 
  RollingTheme, 
  RollingSettings 
} from '../types';
import { NOTE_COLORS, FONT_OPTIONS } from '../constants/themes';
import { 
  Sparkles, 
  Calendar, 
  Trash2, 
  Maximize2, 
  X, 
  PenTool, 
  Heart,
  Share2,
  Camera
} from 'lucide-react';

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

  const studentName = currentStudent?.name || '우리 친구';
  const boardTitle = settings.boardTitle || currentTheme.defaultTitleTemplate(studentName);
  const currentDate = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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
        {/* Top Celebration Header Banner - Solid #DE7272 (No gradient as requested) */}
        <div
          className="relative px-6 py-8 sm:px-10 sm:py-9 bg-[#DE7272] text-white shadow-md overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2.5 flex-1 min-w-0 pr-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-[#FFF6A9] text-[#6d4411] border border-[#FFCA88] text-xs font-bold tracking-wide uppercase shadow-xs">
                  {settings.schoolClass || '우리 반'}
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
                  {currentTheme.badge}
                </span>
                {settings.showDate && (
                  <span className="flex items-center gap-1 text-xs text-white/90 ml-1 font-pretendard">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{currentDate}</span>
                  </span>
                )}
              </div>

              {/* Title with Pretendard 600 & Natural Korean Word-Break (break-keep) */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-title font-semibold tracking-tight text-white drop-shadow-xs leading-snug break-keep">
                {boardTitle}
              </h1>

              <p className="text-sm sm:text-base text-white/95 font-pretendard break-keep">
                {currentTheme.tagline}
              </p>
            </div>

            {/* Student Profile Card & Counter on Banner */}
            <div className="flex items-center gap-4 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 self-start md:self-auto shrink-0 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-white text-slate-800 flex items-center justify-center text-3xl shadow-sm">
                {currentTheme.bannerIcon}
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-white/80 font-bold">
                  주인공
                </div>
                <div className="text-xl font-title font-semibold text-white">{studentName}</div>
                <div className="text-xs text-[#FFF6A9] font-bold mt-0.5">
                  총 {messages.length}개의 따뜻한 메시지
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Board Canvas Area with Messages */}
        <div className="p-6 sm:p-10 min-h-[500px]">
          {messages.length === 0 ? (
            /* Empty state */
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
              <button
                type="button"
                onClick={onOpenCompose}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <PenTool className="w-4 h-4" />
                <span>첫 메시지 쓰러 가기</span>
              </button>
            </div>
          ) : (
            /* Layout renderer */
            <div>
              {/* Sticky Notes Layout */}
              {settings.layout === 'sticky' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-start">
                  {messages.map((msg, index) => {
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
                          {msg.content}
                        </p>

                        {/* Bottom Author Tag */}
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs mt-auto">
                          <span className="font-bold text-slate-800 font-jua">
                            From. {msg.author}
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
                  {messages.map((msg) => {
                    const colorConf = NOTE_COLORS[msg.color] || NOTE_COLORS.white;
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
                              {msg.author}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{msg.createdAt.split(' ')[0]}</span>
                        </div>
                        <p className={`text-base text-slate-700 leading-relaxed ${fontCls} my-2 whitespace-pre-wrap line-clamp-5 break-keep`}>
                          {msg.content}
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
                  {messages.map((msg, index) => {
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
                            {msg.content}
                          </p>
                        </div>
                        {/* Polaroid handwritten caption */}
                        <div className="mt-3 px-1 text-center font-poorstory font-bold text-base text-slate-700">
                          - {msg.author}의 마음 -
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Corkboard Layout */}
              {settings.layout === 'corkboard' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
                  {messages.map((msg, index) => {
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
                          {msg.content}
                        </p>

                        <div className="pt-2 border-t border-black/10 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-900 font-jua">
                            To. {studentName}
                          </span>
                          <span className="font-bold text-slate-700 font-jua">
                            From. {msg.author}
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

      {/* Floating Action Bar (Write Message & Export Image) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl border border-[#FFCA88]/50">
        <button
          type="button"
          onClick={onOpenCompose}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <PenTool className="w-4 h-4" />
          <span>{studentName}에게 글 남기기</span>
        </button>

        <button
          type="button"
          onClick={onExportImage}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#FFF6A9]" />
          <span>고화질 이미지 저장</span>
        </button>
      </div>
    </div>
  );
};
