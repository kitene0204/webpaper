import React, { useState } from 'react';
import { 
  X, 
  Users, 
  Trash2, 
  Check, 
  Sparkles, 
  Search,
  CheckCircle2,
  Copy,
  Share2,
  AlertCircle
} from 'lucide-react';
import { Student, ThemeId } from '../types';
import { THEMES } from '../constants/themes';
import { GasService } from '../services/gasService';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onAddStudent: (name: string, gradeClass: string, theme?: ThemeId) => Promise<void>;
  onAddBulkStudents: (names: string[], gradeClass: string) => Promise<void>;
  onDeleteStudent?: (name: string) => Promise<void>;
  onClearSampleStudents?: () => Promise<void>;
  isConnectedToGas: boolean;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  students,
  currentStudent,
  onSelectStudent,
  onAddStudent,
  onAddBulkStudents,
  onDeleteStudent,
  onClearSampleStudents,
  isConnectedToGas,
}) => {
  const [tab, setTab] = useState<'list' | 'single' | 'bulk'>('list');
  const [search, setSearch] = useState('');
  const [copiedStudentName, setCopiedStudentName] = useState<string | null>(null);
  
  // Single add form
  const [newName, setNewName] = useState('');
  const [newGrade, setNewGrade] = useState('3학년 2반');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('birthday');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk add form
  const [bulkText, setBulkText] = useState('');
  const [bulkGrade, setBulkGrade] = useState('3학년 2반');

  if (!isOpen) return null;

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasSamples = GasService.hasSampleStudents();

  const handleCopyLink = async (e: React.MouseEvent, studentName: string) => {
    e.stopPropagation();
    const url = GasService.getShareUrl(studentName);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedStudentName(studentName);
      setTimeout(() => setCopiedStudentName(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDelete = async (e: React.MouseEvent, studentName: string) => {
    e.stopPropagation();
    if (confirm(`'${studentName}' 학생을 정말 삭제하시겠습니까?`)) {
      if (onDeleteStudent) {
        await onDeleteStudent(studentName);
      }
    }
  };

  const handleClearSamples = async () => {
    if (confirm('기본 예시 학생(김민준, 이서연 등 샘플 데이터)을 모두 지우시겠습니까?\n선생님이 직접 추가하신 학생은 유지됩니다.')) {
      if (onClearSampleStudents) {
        await onClearSampleStudents();
      }
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddStudent(newName.trim(), newGrade, selectedTheme);
      setNewName('');
      setTab('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = bulkText
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    
    if (names.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAddBulkStudents(names, bulkGrade);
      setBulkText('');
      setTab('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#DE7272]/15 via-[#FFCA88]/25 to-[#FFF6A9]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DE7272] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-title font-semibold">
                학생 관리 및 롤링페이퍼 선택
              </h2>
              <p className="text-xs text-slate-500">
                {isConnectedToGas 
                  ? '구글 스프레드시트의 탭(Sheet)과 실시간 연동됩니다.' 
                  : '학생별로 각각의 롤링페이퍼가 생성됩니다.'}
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('list')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            학생 목록 ({students.length}명)
          </button>
          <button
            type="button"
            onClick={() => setTab('single')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'single'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            + 학생 1명 추가
          </button>
          <button
            type="button"
            onClick={() => setTab('bulk')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              tab === 'bulk'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            명단 일괄 추가
          </button>
        </div>

        {/* Tab content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {tab === 'list' && (
            <div className="space-y-3">
              {/* Important Sharing Guide Callout */}
              <div className="p-3.5 bg-[#FFFDE8] rounded-2xl border border-[#FFCA88] text-xs text-[#6d4411] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#DE7272] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    💡 아이들에게 전달할 때: 기본 주소만 보내면 아이들 화면에는 샘플(김민준)이 뜹니다!
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    학생들에게 링크를 보낼 때는 각 학생 오른쪽의 <strong className="text-[#DE7272]">[🔗 링크 복사]</strong> 버튼을 눌러 복사된 전용 링크를 보내주셔야, 아이들이 접속했을 때 해당 학생의 롤링페이퍼로 바로 열립니다.
                  </p>
                </div>
              </div>

              {/* Action row (Search + Clear samples) */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="학생 이름으로 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] bg-slate-50/50"
                  />
                </div>
                {hasSamples && onClearSampleStudents && (
                  <button
                    type="button"
                    onClick={handleClearSamples}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                    title="김민준 등 기본 샘플 더미 데이터를 지웁니다"
                  >
                    더미(김민준 등) 삭제
                  </button>
                )}
              </div>

              {/* Student grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {filteredStudents.map((st) => {
                  const isSelected = currentStudent?.id === st.id || currentStudent?.name === st.name;
                  const isCopied = copiedStudentName === st.name;

                  return (
                    <div
                      key={st.id || st.name}
                      onClick={() => {
                        onSelectStudent(st);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'border-[#DE7272] bg-[#FFFDE8] shadow-xs ring-2 ring-[#FFCA88]'
                          : 'border-slate-200 hover:border-[#FFCA88] bg-white hover:bg-[#FFFDE8]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFCA88] to-[#FFF6A9] text-[#5a2e0a] flex items-center justify-center font-bold text-sm font-title border border-[#FFCA88]/50 shrink-0">
                          {st.name.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 font-title">
                              {st.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#DE7272] text-white font-bold">
                                선택됨
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {st.gradeClass || '우리 반'} · 메시지 {st.messageCount || 0}통
                          </p>
                        </div>
                      </div>
                      
                      {/* Actions: Copy share link & delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(e, st.name)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                            isCopied
                              ? 'bg-emerald-600 text-white'
                              : 'bg-[#FFF6A9] hover:bg-[#FFCA88] text-[#6d4411] border border-[#FFCA88]'
                          }`}
                          title={`${st.name} 전용 공유 링크 복사`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? '복사됨!' : '링크 복사'}</span>
                        </button>

                        {onDeleteStudent && (
                          <button
                            type="button"
                            onClick={(e) => handleDelete(e, st.name)}
                            className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                            title={`${st.name} 삭제`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">
                  검색된 학생이 없습니다.
                </div>
              )}
            </div>
          )}

          {tab === 'single' && (
            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학생 이름 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 이창민"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DE7272]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학급 / 그룹
                </label>
                <input
                  type="text"
                  placeholder="예: 3학년 2반"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DE7272]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  추천 테마 (롤링페이퍼 목적)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(THEMES).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedTheme(th.id as ThemeId)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        selectedTheme === th.id
                          ? 'border-[#DE7272] bg-[#FFFDE8] ring-2 ring-[#FFCA88]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-lg mb-1">{th.bannerIcon}</div>
                      <div className="font-bold text-slate-800">{th.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="w-full py-3 rounded-2xl bg-[#DE7272] hover:bg-[#c95d5d] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? '추가 중...' : `${newName || '학생'} 추가하고 바로 선택하기`}
                </button>
              </div>
            </form>
          )}

          {tab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="p-3 bg-[#FFFDE8] rounded-xl border border-[#FFCA88] text-xs text-[#6d4411] space-y-1">
                <p className="font-bold flex items-center gap-1 text-[#DE7272]">
                  <Sparkles className="w-3.5 h-3.5" />
                  우리 반 학생 명단을 한 번에 등록하세요
                </p>
                <p>
                  이름을 줄바꿈(Enter)이나 쉼표(,)로 구분해서 입력해주세요.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학급 명칭
                </label>
                <input
                  type="text"
                  placeholder="예: 3학년 2반"
                  value={bulkGrade}
                  onChange={(e) => setBulkGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DE7272]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학생 이름 목록 <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={6}
                  placeholder={`김민준\n이서연\n박도현\n최유진\n정하은\n이창민`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] font-mono leading-relaxed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !bulkText.trim()}
                  className="w-full py-3 rounded-2xl bg-[#DE7272] hover:bg-[#c95d5d] disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? '명단 등록 중...' : '명단 일괄 등록하기'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            총 {students.length}명의 학생 등록됨
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all cursor-pointer"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
