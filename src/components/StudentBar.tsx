import React from 'react';
import { Plus, Users, ChevronRight, UserPlus } from 'lucide-react';
import { Student, RollingTheme } from '../types';

interface StudentBarProps {
  students: Student[];
  currentStudent: Student | null;
  onSelectStudent: (student: Student) => void;
  onOpenAddStudent: () => void;
  currentTheme?: RollingTheme;
}

export const StudentBar: React.FC<StudentBarProps> = ({
  students,
  currentStudent,
  onSelectStudent,
  onOpenAddStudent,
  currentTheme,
}) => {
  const activeColor = currentTheme?.primaryColor || '#DE7272';

  return (
    <div className="bg-white border-b border-slate-200/80 py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Label & Total count */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-[#FFF6A9] text-[#6d4411] flex items-center justify-center font-bold text-xs border border-[#FFCA88]">
            <Users className="w-4 h-4" />
          </div>
          <span className="text-xs text-slate-800 font-title font-semibold">
            우리 반 학생들 ({students.length}명)
          </span>
        </div>

        {/* Horizontal scrollable student pill list */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 max-w-3xl">
          {students.map((student) => {
            const isSelected = currentStudent?.id === student.id || currentStudent?.name === student.name;
            return (
              <button
                key={student.id || student.name}
                type="button"
                onClick={() => onSelectStudent(student)}
                style={isSelected ? { backgroundColor: activeColor } : undefined}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'text-white shadow-sm scale-105 ring-2 ring-[#FFCA88] ring-offset-1'
                    : 'bg-[#FFFDE8] hover:bg-[#FFF6A9] text-slate-700 border border-[#FFCA88]/50'
                }`}
              >
                <span>{student.name}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isSelected ? 'bg-white/30 text-white' : 'bg-[#FFCA88]/50 text-[#5a2e0a]'
                  }`}
                >
                  {student.messageCount || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Student Quick Button */}
        <button
          type="button"
          onClick={onOpenAddStudent}
          style={{ borderColor: activeColor, color: activeColor }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed hover:bg-slate-50 text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>학생 추가</span>
        </button>

      </div>
    </div>
  );
};
