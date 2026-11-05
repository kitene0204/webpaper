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
  User,
  GraduationCap
} from 'lucide-react';
import { RollingSettings, ThemeId, LayoutId, FontId, Student } from '../types';
import { 
  THEMES, 
  LAYOUT_OPTIONS, 
  FONT_OPTIONS, 
  PRESET_TITLE_COLORS,
  isHonorificTarget,
  getRecommendedTitles,
  getKoreanVocative,
  getDefaultSubtitle,
  getRecommendedSubtitles
} from '../constants/themes';

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
  const [isHonorific, setIsHonorific] = useState<boolean>(() => {
    if (typeof settings.honorificMode === 'boolean') return settings.honorificMode;
    const initialName = settings.targetStudentName || currentStudent?.name || '';
    return isHonorificTarget(initialName);
  });

  // Sync form state when modal opens or settings change
  useEffect(() => {
    if (isOpen) {
      const activeName = settings.targetStudentName || currentStudent?.name || '';
      const activeClass = settings.schoolClass || currentStudent?.gradeClass || '우리 반';
      const hon = typeof settings.honorificMode === 'boolean' 
        ? settings.honorificMode 
        : isHonorificTarget(activeName);
      
      const activeSubtitle = settings.boardSubtitle || getDefaultSubtitle(settings.theme, hon);

      setRecipientName(activeName);
      setIsHonorific(hon);
      setFormSettings({
        ...settings,
        schoolClass: activeClass,
        honorificMode: hon,
        targetStudentName: activeName,
        boardSubtitle: activeSubtitle,
        titleColor: settings.titleColor || THEMES[settings.theme]?.primaryColor || '#DE7272',
      });
    }
  }, [isOpen, settings, currentStudent]);

  if (!isOpen) return null;

  const currentThemeObj = THEMES[formSettings.theme] || THEMES.birthday;
  const activeTitleColor = formSettings.titleColor || currentThemeObj.primaryColor;

  const handleRecipientNameChange = (newName: string) => {
    setRecipientName(newName);
    
    // Auto-detect honorific mode if name ends with '선생님' or '님'
    let currentHon = isHonorific;
    if (isHonorificTarget(newName) && !isHonorific) {
      currentHon = true;
      setIsHonorific(true);
    }

    setFormSettings(prev => ({
      ...prev,
      honorificMode: currentHon,
      targetStudentName: newName,
    }));
  };

  const handleHonorificChange = (newHon: boolean) => {
    setIsHonorific(newHon);
    setFormSettings(prev => {
      const prevDefaultSubtitle = getDefaultSubtitle(prev.theme, isHonorific);
      const isCustomizedSubtitle = prev.boardSubtitle && prev.boardSubtitle !== prevDefaultSubtitle;
      return {
        ...prev,
        honorificMode: newHon,
        boardSubtitle: isCustomizedSubtitle ? prev.boardSubtitle : getDefaultSubtitle(prev.theme, newHon),
      };
    });
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    const themeColor = THEMES[newTheme]?.primaryColor || '#DE7272';
    // Match the theme color to the new theme while keeping user's custom title/subtitle intact
    setFormSettings(prev => {
      const prevDefaultSubtitle = getDefaultSubtitle(prev.theme, isHonorific);
      const isCustomizedSubtitle = prev.boardSubtitle && prev.boardSubtitle !== prevDefaultSubtitle;
      return {
        ...prev,
        theme: newTheme,
        titleColor: themeColor,
        boardTitle: prev.boardTitle || THEMES[newTheme]?.defaultTitleTemplate(recipientName || currentStudent?.name || (isHonorific ? '선생님' : '친구'), isHonorific),
        boardSubtitle: isCustomizedSubtitle ? prev.boardSubtitle : getDefaultSubtitle(newTheme, isHonorific),
      };
    });
  };

  const handleResetTitle = () => {
    const studentName = recipientName.trim() || currentStudent?.name || (isHonorific ? '선생님' : '친구');
    const autoTitle = currentThemeObj.defaultTitleTemplate(studentName, isHonorific);
    setFormSettings(prev => ({ ...prev, boardTitle: autoTitle }));
  };

  const handleApplyTitle = (selectedTitle: string) => {
    setFormSettings(prev => ({ ...prev, boardTitle: selectedTitle }));
  };

  const handleTitleChange = (newTitle: string) => {
    setFormSettings(prev => ({ ...prev, boardTitle: newTitle }));
  };

  const handleSubtitleChange = (newSub: string) => {
    setFormSettings(prev => ({ ...prev, boardSubtitle: newSub }));
  };

  const handleResetSubtitle = () => {
    const autoSub = getDefaultSubtitle(formSettings.theme, isHonorific);
    setFormSettings(prev => ({ ...prev, boardSubtitle: autoSub }));
  };

  const handleApplySubtitle = (selectedSub: string) => {
    setFormSettings(prev => ({ ...prev, boardSubtitle: selectedSub }));
  };

  const handleResetThemeColor = () => {
    setFormSettings(prev => ({ ...prev, titleColor: currentThemeObj.primaryColor }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalRecipient = recipientName.trim() || currentStudent?.name || (isHonorific ? '선생님' : '우리 친구');
    const finalSettings: RollingSettings = {
      ...formSettings,
      schoolClass: formSettings.schoolClass.trim() || '우리 반',
      honorificMode: isHonorific,
      targetStudentName: finalRecipient,
      boardTitle: formSettings.boardTitle || currentThemeObj.defaultTitleTemplate(finalRecipient, isHonorific),
      boardSubtitle: formSettings.boardSubtitle?.trim() || getDefaultSubtitle(formSettings.theme, isHonorific),
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
                    {isHonorific ? '선생님/주인공' : '주인공'}: {recipientName || (isHonorific ? '선생님' : '친구')}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                    isHonorific ? 'bg-indigo-900/60 text-indigo-100 border border-indigo-300/40' : 'bg-emerald-900/40 text-emerald-100'
                  }`}>
                    {isHonorific ? '🎓 존댓말(경어체)' : '🎒 친구(반말)'}
                  </span>
                </div>
                <div className={`font-title font-semibold text-sm truncate ${currentThemeObj.titleTextColor || 'text-white'}`}>
                  {formSettings.boardTitle || currentThemeObj.defaultTitleTemplate(recipientName || currentStudent?.name || (isHonorific ? '선생님' : '친구'), isHonorific)}
                </div>
                <div className="text-[11px] text-white/90 truncate mt-0.5 font-pretendard">
                  {formSettings.boardSubtitle || getDefaultSubtitle(formSettings.theme, isHonorific)}
                </div>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/25 flex items-center justify-center text-lg shrink-0">
                {currentThemeObj.bannerIcon}
              </div>
            </div>

            {/* Speech Tone Selector: 친구(반말) vs 선생님/어른(존댓말·경어체) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>말투 / 어조 선택 (반말 vs 존댓말)</span>
                </label>
                <span className="text-[11px] text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                  {isHonorific ? '선생님·부모님께 어울리는 존댓말 선택됨' : '친구·동급생에게 어울리는 친근한 어조 선택됨'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleHonorificChange(false)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    !isHonorific
                      ? 'border-amber-400 bg-amber-50/70 text-amber-950 font-bold ring-2 ring-amber-300 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                    🎒
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>친구에게 (친근한 반말)</span>
                      {!isHonorific && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      "민준아 생일 축하해!", "새로운 시작을 늘 응원할게!"
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleHonorificChange(true)}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isHonorific
                      ? 'border-indigo-500 bg-indigo-50/80 text-indigo-950 font-bold ring-2 ring-indigo-300 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg shrink-0">
                    🎓
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>선생님 / 어른께 (존댓말·경어체)</span>
                      {isHonorific && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      "{recipientName ? `${recipientName}께` : '선생님께'}, 새로운 시작을 온 마음으로 응원합니다!"
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Inputs: Recipient, Class Name, & Recommended Title Button */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Recipient Target Input (주인공) */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    <span>주인공 (받는 대상)</span>
                    <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-1.5 py-0.2 rounded-md">
                    직접 입력
                  </span>
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => handleRecipientNameChange(e.target.value)}
                  placeholder="예: 함수현 선생님, 김민준"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/40 text-sm font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all shadow-xs"
                />
                <span className="text-[10px] text-amber-700/80 mt-1 block font-medium">
                  우측 '주인공' 카드와 전용 링크에 즉시 반영됩니다
                </span>
              </div>

              {/* Class Name */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>학급 / 단체명</span>
                  <span className="text-[10px] text-slate-400">직접 입력</span>
                </label>
                <input
                  type="text"
                  value={formSettings.schoolClass}
                  onChange={(e) => setFormSettings(prev => ({ ...prev, schoolClass: e.target.value }))}
                  placeholder="예: 6학년 1반"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  상단 배지에 표시됩니다
                </span>
              </div>

              {/* Optional Recommendation Title Generator Button */}
              <div className="sm:col-span-1 flex flex-col justify-end">
                <button
                  type="button"
                  onClick={handleResetTitle}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="현재 입력한 주인공 이름을 바탕으로 추천 문구를 생성하여 입력창에 채웁니다"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>추천 문구 자동 채우기</span>
                </button>
                <span className="text-[10px] text-slate-400 mt-1 text-center block">
                  직접 쓰시거나 필요 시 추천으로 채우기
                </span>
              </div>

              {/* Board Title Input (Direct typing) */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>롤링페이퍼 상단 타이틀 문구 (직접 작성)</span>
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100/70 px-1.5 py-0.2 rounded-md">
                    원하는 문구로 자유롭게 직접 입력
                  </span>
                </label>
                <input
                  type="text"
                  value={formSettings.boardTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="예: 👋 함수현 선생님, 그동안 감사했습니다!! ✈️"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-400 focus:border-rose-400 font-title shadow-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  원하는 축하·응원·감사 문구를 직접 자유롭게 작성하시면 상단 메인 배너에 그대로 반영됩니다.
                </span>
              </div>

              {/* Clickable Quick Recommended Titles (Optional quick selection) */}
              <div className="sm:col-span-3 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-600">
                    💡 빠른 추천 타이틀 (원클릭 시 위 타이틀 입력창에 적용):
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {isHonorific ? '존댓말 예시' : '친구 예시'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getRecommendedTitles(formSettings.theme, recipientName || (isHonorific ? '선생님' : '친구'), isHonorific).map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTitle(t)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                        formSettings.boardTitle === t
                          ? 'border-rose-400 bg-rose-50 text-rose-800 font-bold ring-2 ring-rose-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Board Subtitle / Tagline Input (Direct typing & freely editable) */}
              <div className="sm:col-span-3 pt-2 border-t border-slate-200/70">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>롤링페이퍼 하단 부제목/안내 문구 (직접 작성)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-1.5 py-0.2 rounded-md">
                      자유롭게 수정 가능
                    </span>
                    <button
                      type="button"
                      onClick={handleResetSubtitle}
                      className="text-[10px] text-indigo-700 hover:text-indigo-900 flex items-center gap-1 font-semibold underline cursor-pointer"
                      title="테마 및 어조(존댓말)에 어울리는 기본 추천 문구로 되돌립니다"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>기본 문구로 채우기</span>
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formSettings.boardSubtitle ?? ''}
                  onChange={(e) => handleSubtitleChange(e.target.value)}
                  placeholder="예: 함께했던 소중한 시간 잊지 않을게, 새로운 곳에서도 반짝이길!"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-sm font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 shadow-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  메인 타이틀 바로 아래에 표시되는 설명 문구입니다. 원하는 문구로 자유롭게 직접 수정하실 수 있습니다.
                </span>

                {/* Quick Subtitle Recommendations */}
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    💡 빠른 추천 부제목 (원클릭 시 위 부제목 입력창에 적용):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {getRecommendedSubtitles(formSettings.theme, isHonorific).map((st, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplySubtitle(st)}
                        className={`text-xs px-2.5 py-1.5 rounded-xl border transition-all text-left cursor-pointer ${
                          formSettings.boardSubtitle === st
                            ? 'border-indigo-400 bg-indigo-50 text-indigo-900 font-bold ring-2 ring-indigo-200'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
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
