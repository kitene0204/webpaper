import React from 'react';
import { 
  Sparkles, 
  Palette, 
  Download, 
  Database, 
  PlusCircle, 
  Users, 
  PenTool, 
  Layout, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { Student, RollingTheme, RollingSettings } from '../types';

interface NavbarProps {
  currentStudent: Student | null;
  students: Student[];
  currentTheme: RollingTheme;
  settings: RollingSettings;
  isConnectedToGas: boolean;
  activeView: 'board' | 'compose';
  onSelectStudent: (student: Student) => void;
  onOpenThemeModal: () => void;
  onOpenStudentModal: () => void;
  onOpenGasModal: () => void;
  onOpenComposeModal: () => void;
  onExportImage: () => void;
  onToggleView: (view: 'board' | 'compose') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  students,
  currentTheme,
  settings,
  isConnectedToGas,
  activeView,
  onSelectStudent,
  onOpenThemeModal,
  onOpenStudentModal,
  onOpenGasModal,
  onOpenComposeModal,
  onExportImage,
  onToggleView,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#DE7272] via-[#FFCA88] to-[#FFF6A9] flex items-center justify-center text-xl shadow-xs border border-[#FFCA88]/50">
              {currentTheme.bannerIcon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg tracking-tight text-slate-800 font-title font-semibold">
                  우리반 롤링페이퍼
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[#FFF6A9] text-[#6d4411] border border-[#FFCA88]">
                  {settings.schoolClass || '우리 반'}
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                친구들의 마음을 모아 따뜻한 이미지로 간직해요
              </p>
            </div>
          </div>

          {/* Student Selector Dropdown in Navbar */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={onOpenStudentModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#FFCA88]/60 bg-[#FFFDE8] hover:bg-[#FFF6A9]/50 transition-all text-sm font-medium text-slate-700 shadow-xs cursor-pointer"
                title="학생 변경 및 관리"
              >
                <div className="w-6 h-6 rounded-full bg-[#FFCA88] text-[#5a2e0a] flex items-center justify-center text-xs font-bold font-title">
                  {currentStudent ? currentStudent.name.slice(0, 1) : '?'}
                </div>
                <span className="text-slate-900 font-title font-semibold">
                  {currentStudent ? currentStudent.name : '학생 선택'}
                </span>
                <span className="text-xs px-1.5 py-0.2 rounded-full bg-[#FFF6A9] text-[#784d14] font-bold">
                  {currentStudent?.messageCount ?? 0}통
                </span>
                <Users className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              </button>
            </div>

            {/* Quick write message CTA */}
            <button
              type="button"
              onClick={onOpenComposeModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#DE7272] to-[#FFCA88] hover:from-[#cc6363] hover:to-[#f0b771] text-white font-bold text-sm shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>메시지 남기기</span>
            </button>
          </div>

          {/* Action buttons (Settings, GAS, Export Image) */}
          <div className="flex items-center gap-2">
            {/* Design & Theme settings button */}
            <button
              type="button"
              onClick={onOpenThemeModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-[#FFCA88] hover:bg-[#FFFDE8] transition-colors text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer"
              title="롤링페이퍼 테마 및 레이아웃 설정"
            >
              <Palette className="w-4 h-4 text-[#DE7272]" />
              <span className="hidden md:inline">디자인 설정</span>
            </button>

            {/* Google Apps Script Integration button */}
            <button
              type="button"
              onClick={onOpenGasModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs sm:text-sm font-semibold cursor-pointer ${
                isConnectedToGas
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title="구글 스프레드시트 (Code.gs) 연동 설정"
            >
              <Database className={`w-4 h-4 ${isConnectedToGas ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">구글 시트 연동</span>
              {isConnectedToGas ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              ) : (
                <span className="hidden sm:inline text-xs text-[#DE7272] font-semibold">(로컬)</span>
              )}
            </button>

            {/* Image Export CTA button */}
            <button
              type="button"
              onClick={onExportImage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="롤링페이퍼를 고화질 이미지 파일로 다운로드"
            >
              <Download className="w-4 h-4 text-[#FFF6A9]" />
              <span>이미지 저장</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
