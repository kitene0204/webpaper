import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  Trash2, 
  Check, 
  Sparkles, 
  FileSpreadsheet, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { Student, ThemeId } from '../types';
import { THEMES } from '../constants/themes';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onAddStudent: (name: string, gradeClass: string, theme?: ThemeId) => Promise<void>;
  onAddBulkStudents: (names: string[], gradeClass: string) => Promise<void>;
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
  isConnectedToGas,
}) => {
  const [tab, setTab] = useState<'list' | 'single' | 'bulk'>('list');
  const [search, setSearch] = useState('');
  
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

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddStudent(newName.trim(), newGrade.trim(), selectedTheme);
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
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) return;
    setIsSubmitting(true);
    try {
      await onAddBulkStudents(names, bulkGrade.trim());
      setBulkText('');
      setTab('list');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#DE7272]/15 via-[#FFCA88]/25 to-[#FFF6A9]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#DE7272] text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-jua">
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
        <div className="p-5 overflow-y-auto flex-1">
          {tab === 'list' && (
            <div className="space-y-3">
              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="학생 이름으로 검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#DE7272] bg-slate-50/50"
                />
              </div>

              {/* Student grid list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {filteredStudents.map((st) => {
                  const isSelected = currentStudent?.id === st.id || currentStudent?.name === st.name;
                  return (
                    <div
                      key={st.id || st.name}
                      onClick={() => {
                        onSelectStudent(st);
                        onClose();
                      }}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#DE7272] bg-[#FFFDE8] shadow-xs ring-2 ring-[#FFCA88]'
                          : 'border-slate-200 hover:border-[#FFCA88] bg-white hover:bg-[#FFFDE8]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FFCA88] to-[#FFF6A9] text-[#5a2e0a] flex items-center justify-center font-bold text-sm font-jua border border-[#FFCA88]/50">
                          {st.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm text-slate-900 font-jua">
                              {st.name}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#DE7272] text-white font-bold">
                                현재 선택됨
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {st.gradeClass || '우리 반'} · 메시지 {st.messageCount || 0}통
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs font-bold text-[#DE7272]">
                        {isSelected ? <CheckCircle2 className="w-5 h-5 text-[#DE7272]" /> : '선택'}
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
                  placeholder="예: 홍길동"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학년 / 반
                </label>
                <input
                  type="text"
                  placeholder="예: 3학년 2반"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  롤링페이퍼 추천 테마
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(THEMES).map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setSelectedTheme(th.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                        selectedTheme === th.id
                          ? 'border-rose-500 bg-rose-50 font-bold text-rose-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{th.bannerIcon}</span>
                        <span>{th.badge}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !newName.trim()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#c95d5d] hover:to-[#f0b56e] disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>학생 추가하고 시트 생성하기</span>
                </button>
              </div>
            </form>
          )}

          {tab === 'bulk' && (
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학년 / 반
                </label>
                <input
                  type="text"
                  placeholder="예: 3학년 2반"
                  value={bulkGrade}
                  onChange={(e) => setBulkGrade(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  학생 명단 (줄바꿈 또는 쉼표로 구분) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="김민준&#10;이서연&#10;박도현&#10;최유진&#10;정하은"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  팁: 나이스(NEIS)나 엑셀 명단에서 학생 이름을 복사해서 그대로 붙여넣으세요.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !bulkText.trim()}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>학생 명단 일괄 등록</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>총 {students.length}명의 학생 롤링페이퍼 등록됨</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};
