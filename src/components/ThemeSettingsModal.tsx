import React, { useState, useEffect } from 'react';
import { 
  X, 
  Palette, 
  Layout, 
  Type, 
  Sparkles, 
  Check, 
  RefreshCw, 
  SlidersHorizontal,
  Paintbrush,
  User
} from 'lucide-react';
import { RollingSettings, ThemeId, LayoutId, FontId, Student } from '../types';
import { THEMES, LAYOUT_OPTIONS, FONT_OPTIONS, PRESET_TITLE_COLORS } from '../constants/themes';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: RollingSettings;
  currentStudent: Student | null;
  onSaveSettings: (newSettings: RollingSettings, newRecipientName?: string) => void;
}

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  currentStudent,
  onSaveSettings,
}) => {
  const [formSettings, setFormSettings] = useState<RollingSettings>(settings);
  const [recipientName, setRecipientName] = useState<string>(
    settings.targetStudentName || currentStudent?.name || ''
  );

  // Sync form state when modal opens or settings change
  useEffect(() => {
    if (isOpen) {
      const activeName = settings.targetStudentName || currentStudent?.name || '';
      setRecipientName(activeName);
      setFormSettings({
        ...settings,
        targetStudentName: activeName,
        titleColor: settings.titleColor || THEMES[settings.theme]?.primaryColor || '#DE7272',
      });
    }
  }, [isOpen, settings, currentStudent]);

  if (!isOpen) return null;

  const currentThemeObj = THEMES[formSettings.theme] || THEMES.birthday;
  const activeTitleColor = formSettings.titleColor || currentThemeObj.primaryColor;

  const handleRecipientNameChange = (newName: string) => {
    const oldName = recipientName;
    setRecipientName(newName);
    setFormSettings(prev => {
      let updatedTitle = prev.boardTitle;
      // If previous name was in the title, replace it with the new name
      if (oldName && updatedTitle.includes(oldName)) {
        updatedTitle = updatedTitle.split(oldName).join(newName || '친구');
      } else if (!updatedTitle || updatedTitle === currentThemeObj.defaultTitleTemplate(oldName || '친구')) {
        updatedTitle = currentThemeObj.defaultTitleTemplate(newName || '친구');
      }
      return {
        ...prev,
        targetStudentName: newName,
        boardTitle: updatedTitle,
      };
    });
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    const studentName = recipientName.trim() || currentStudent?.name || '친구';
    const autoTitle = THEMES[newTheme]?.defaultTitleTemplate(studentName) || '';
    const themeColor = THEMES[newTheme]?.primaryColor || '#DE7272';
    // Automatically match the title color to the new theme!
    setFormSettings(prev => ({
      ...prev,
      theme: newTheme,
      boardTitle: autoTitle,
      titleColor: themeColor,
    }));
  };

  const handleResetTitle = () => {
    const studentName = recipientName.trim() || currentStudent?.name || '친구';
    const autoTitle = currentThemeObj.defaultTitleTemplate(studentName);
    setFormSettings(prev => ({ ...prev, boardTitle: autoTitle }));
  };

  const handleTitleChange = (newTitle: string) => {
    setFormSettings(prev => ({ ...prev, boardTitle: newTitle }));
    // If the user modified the title directly and replaced the student name, e.g. "000의 특별한 생일"
    const match = newTitle.match(/(?:🎂|💌|🌈|🎓|🔥|\s|^)([\w가-힣0-9]{2,12})(?:의\s*(?:특별한|빛나는|소중한|생일|졸업|전학)|(?:아|야)[,!~.\s]|에게)/);
    if (match && match[1]) {
      const extracted = match[1].trim();
      if (extracted && extracted !== recipientName) {
        setRecipientName(extracted);
        setFormSettings(prev => ({ ...prev, targetStudentName: extracted }));
      }
    }
  };

  const handleResetThemeColor = () => {
    setFormSettings(prev => ({ ...prev, titleColor: currentThemeObj.primaryColor }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRecipient = recipientName.trim() || currentStudent?.name || '우리 친구';
    const finalSettings: RollingSettings = {
      ...formSettings,
      targetStudentName: finalRecipient,
      boardTitle: formSettings.boardTitle || currentThemeObj.defaultTitleTemplate(finalRecipient),
    };
    onSaveSettings(finalSettings, finalRecipient);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header with dynamic theme accent */}
        <div 
          style={{ backgroundColor: `${activeTitleColor}18` }}
          className="p-5 border-b border-slate-100 flex items-center justify-between transition-colors duration-300"
        >
          <div className="flex items-center gap-2.5">
            <div 
              style={{ backgroundColor: activeTitleColor }}
              className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs transition-colors duration-300"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-jua">
                롤링페이퍼 디자인 & 테마 설정
              </h2>
              <p className="text-xs text-slate-500">
                주제(생일, 전학, 졸업 등)를 바꾸면 상단 타이틀 색상과 문구가 알맞게 자동 변경됩니다
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
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-6">
          
          {/* 1. Theme Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Palette className="w-4 h-4" style={{ color: activeTitleColor }} />
                <span>1. 행사 및 상황별 주제 테마</span>
              </label>
              <span className="text-xs text-emerald-600 font-medium">선택 시 타이틀 색상과 추천 문구가 함께 바뀝니다</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(THEMES).map((th) => {
                const isSelected = formSettings.theme === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => handleThemeChange(th.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'border-slate-800/20 shadow-md ring-2 ring-offset-1'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: `${th.primaryColor}10`,
                            outlineColor: th.primaryColor,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-2xl">{th.bannerIcon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sm text-slate-800 font-jua flex items-center gap-1.5">
                            {th.name}
                            {/* Color chip indicator */}
                            <span 
                              className="w-3 h-3 rounded-full inline-block border border-white shadow-xs shrink-0"
                              style={{ backgroundColor: th.primaryColor }}
                              title={`타이틀 배너 테마 색상: ${th.primaryColor}`}
                            />
                          </span>
                          {isSelected && (
                            <span 
                              style={{ backgroundColor: th.primaryColor }}
                              className="w-5 h-5 rounded-full text-white flex items-center justify-center text-xs shrink-0"
                            >
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {th.tagline}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Layout Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Layout className="w-4 h-4 text-emerald-500" />
                <span>2. 롤링페이퍼 배치 레이아웃</span>
              </label>
              <span className="text-xs text-slate-400">이미지 저장 시 반영됩니다</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LAYOUT_OPTIONS.map((lo) => {
                const isSelected = formSettings.layout === lo.id;
                return (
                  <button
                    key={lo.id}
                    type="button"
                    onClick={() => setFormSettings(prev => ({ ...prev, layout: lo.id }))}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-2xl mb-1">{lo.icon}</div>
                    <div className="font-bold text-xs">{lo.name}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">
                      {lo.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Recipient, Title & Banner Color Customizer with Live Preview */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
                <Paintbrush className="w-4 h-4 text-rose-500" />
                <span>3. 행사 주인공(받는 사람), 타이틀 문구 및 배너 색상</span>
              </label>
              <button
                type="button"
                onClick={handleResetThemeColor}
                className="text-[11px] text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold underline cursor-pointer"
                title="선택한 테마의 권장 기본 색상으로 되돌립니다"
              >
                <RefreshCw className="w-3 h-3" />
                <span>테마 기본 색상으로 맞추기</span>
              </button>
            </div>

            {/* Live Mini Preview Banner */}
            <div
              style={{ backgroundColor: activeTitleColor }}
              className="p-3.5 rounded-xl text-white shadow-xs transition-colors duration-300 flex items-center justify-between gap-3 overflow-hidden"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                    {formSettings.schoolClass || '우리 반'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">
                    {currentThemeObj.badge}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFF6A9] text-[#6d4411] text-[10px] font-bold shadow-xs">
                    주인공: {recipientName || '친구'}
                  </span>
                </div>
                <div className={`font-title font-semibold text-sm truncate ${currentThemeObj.titleTextColor || 'text-white'}`}>
                  {formSettings.boardTitle || currentThemeObj.defaultTitleTemplate(recipientName || currentStudent?.name || '친구')}
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-lg shrink-0">
                {currentThemeObj.bannerIcon}
              </div>
            </div>

            {/* Inputs: Recipient, Class Name, & Recommended Title Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Recipient Target Input (주인공) */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-amber-500" />
                  <span>주인공 (받는 대상)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => handleRecipientNameChange(e.target.value)}
                  placeholder="예: 000, 이창민"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/40 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-xs"
                />
                <span className="text-[10px] text-amber-700/80 mt-1 block font-medium">
                  우측 '주인공' 카드와 링크에 즉시 반영됩니다
                </span>
              </div>

              {/* Class Name */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학급 / 단체명
                </label>
                <input
                  type="text"
                  value={formSettings.schoolClass}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, schoolClass: e.target.value }))}
                  placeholder="예: 3학년 2반"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  상단 배지에 표시됩니다
                </span>
              </div>

              {/* Recommendation Title Generator */}
              <div className="sm:col-span-1 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleResetTitle}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="현재 입력한 주인공 이름을 바탕으로 추천 문구를 생성합니다"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>'{recipientName || '주인공'}' 추천 문구 자동 완성</span>
                </button>
                <span className="text-[10px] text-rose-600/80 mt-1 text-center block">
                  테마별 추천 제목으로 채우기
                </span>
              </div>

              {/* Board Title Input */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  롤링페이퍼 상단 타이틀 문구
                </label>
                <input
                  type="text"
                  value={formSettings.boardTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="롤링페이퍼 상단에 크게 들어갈 제목 문구"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400 font-title"
                />
              </div>
            </div>

            {/* Title Banner Color Swatches */}
            <div>
              <div className="text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between">
                <span>타이틀 배너 색상 선택:</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  현재 색상: {activeTitleColor.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_TITLE_COLORS.map((pc) => {
                  const isColorActive = activeTitleColor.toLowerCase() === pc.hex.toLowerCase();
                  const isThemeDefault = currentThemeObj.primaryColor.toLowerCase() === pc.hex.toLowerCase();
                  return (
                    <button
                      key={pc.hex}
                      type="button"
                      onClick={() => setFormSettings(prev => ({ ...prev, titleColor: pc.hex }))}
                      style={{ backgroundColor: pc.hex }}
                      className={`relative px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-transform active:scale-95 flex items-center gap-1 cursor-pointer border ${
                        isColorActive
                          ? 'ring-2 ring-slate-800 ring-offset-1 scale-105 border-white'
                          : 'border-black/10 hover:opacity-90'
                      }`}
                    >
                      <span>{pc.name}</span>
                      {isThemeDefault && (
                        <span className="px-1 py-0.2 rounded-full bg-white/30 text-[9px]">추천</span>
                      )}
                      {isColorActive && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}

                {/* Direct Color Picker */}
                <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 cursor-pointer shadow-xs">
                  <input
                    type="color"
                    value={activeTitleColor}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, titleColor: e.target.value }))}
                    className="w-4 h-4 rounded-md cursor-pointer border-0 p-0"
                  />
                  <span>직접 선택</span>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Font Option */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Type className="w-4 h-4 text-amber-500" />
              <span>4. 기본 글꼴 스타일</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONT_OPTIONS.map((f) => {
                const isSelected = formSettings.font === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormSettings(prev => ({ ...prev, font: f.id }))}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/80 font-bold text-amber-900 ring-2 ring-amber-300'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800">{f.name}</div>
                    <div className={`text-sm text-slate-600 mt-1 ${f.fontClass}`}>
                      {f.preview}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Additional Display options */}
          <div className="p-3.5 bg-slate-50 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formSettings.showDate}
                onChange={(e) => setFormSettings(prev => ({ ...prev, showDate: e.target.checked }))}
                className="w-4 h-4 rounded-md text-slate-600 focus:ring-slate-500 border-slate-300"
              />
              <span>상단에 오늘 날짜 표시</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={formSettings.showAuthorBadge}
                onChange={(e) => setFormSettings(prev => ({ ...prev, showAuthorBadge: e.target.checked }))}
                className="w-4 h-4 rounded-md text-slate-600 focus:ring-slate-500 border-slate-300"
              />
              <span>메모지에 작성자 이름 배지 강조</span>
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              style={{ backgroundColor: activeTitleColor }}
              className="w-full py-3.5 rounded-2xl text-white font-bold text-sm shadow-md hover:brightness-95 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FFF6A9]" />
              <span>디자인 및 테마 적용하기</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
