import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StudentBar } from './components/StudentBar';
import { RollingBoard } from './components/RollingBoard';
import { StudentModal } from './components/StudentModal';
import { ThemeSettingsModal } from './components/ThemeSettingsModal';
import { MessageComposerModal } from './components/MessageComposerModal';
import { GoogleAppsScriptModal } from './components/GoogleAppsScriptModal';
import { ImageExportModal } from './components/ImageExportModal';
import { ShareLinkModal } from './components/ShareLinkModal';

import { Student, Message, RollingSettings, ThemeId } from './types';
import { THEMES } from './constants/themes';
import { GasService } from './services/gasService';
import { Sparkles, Database, Plus, RefreshCw, PenTool } from 'lucide-react';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnectedToGas, setIsConnectedToGas] = useState<boolean>(GasService.isConnected());

  // Board display settings
  const [settings, setSettings] = useState<RollingSettings>({
    theme: 'birthday',
    layout: 'sticky',
    font: 'himelody',
    schoolClass: '3학년 2반',
    boardTitle: '🎂 김민준의 특별한 생일을 축하해! 🎉',
    showDate: true,
    showAuthorBadge: true,
    bgTexture: 'dots',
    titleColor: THEMES.birthday.primaryColor,
  });

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [isImageExportOpen, setIsImageExportOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Active theme object
  const currentTheme = THEMES[settings.theme] || THEMES.birthday;

  // Load students initially
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { targetStudent, isNewGasConnected } = GasService.initFromUrl();
      if (isNewGasConnected) {
        setIsConnectedToGas(true);
      }

      let studentList = await GasService.getStudents();

      // If a specific student was requested in URL (?to=이창민)
      if (targetStudent) {
        let found = studentList.find((s) => s.name === targetStudent);
        if (!found) {
          const res = await GasService.addStudent(targetStudent, '우리 반', 'birthday');
          found = res.student;
          studentList = await GasService.getStudents();
        }
        setStudents(studentList);
        setCurrentStudent(found);
        const themeId = found.customTheme || 'birthday';
        setSettings((s) => ({
          ...s,
          theme: themeId,
          boardTitle: THEMES[themeId].defaultTitleTemplate(found!.name),
          titleColor: THEMES[themeId].primaryColor,
        }));
        return;
      }

      setStudents(studentList);
      if (studentList.length > 0) {
        // If currentStudent doesn't exist or isn't in list, select first
        setCurrentStudent((prev) => {
          if (prev && studentList.some((s) => s.name === prev.name)) {
            return prev;
          }
          const initial = studentList[0];
          // update title based on initial student
          const themeId = initial.customTheme || 'birthday';
          setSettings((s) => ({
            ...s,
            theme: themeId,
            boardTitle: THEMES[themeId].defaultTitleTemplate(initial.name),
            titleColor: THEMES[themeId].primaryColor,
          }));
          return initial;
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for current student
  const loadMessages = useCallback(async (student: Student) => {
    try {
      const msgs = await GasService.getMessages(student.name);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (currentStudent) {
      loadMessages(currentStudent);
    }
  }, [currentStudent, loadMessages]);

  // Handle student selection
  const handleSelectStudent = (student: Student) => {
    setCurrentStudent(student);
    const themeToApply = student.customTheme || settings.theme;
    setSettings((prev) => ({
      ...prev,
      theme: themeToApply,
      boardTitle: THEMES[themeToApply].defaultTitleTemplate(student.name),
      titleColor: THEMES[themeToApply].primaryColor,
    }));
  };

  // Add single student
  const handleAddStudent = async (name: string, gradeClass: string, theme?: ThemeId) => {
    const res = await GasService.addStudent(name, gradeClass, theme);
    if (res.success) {
      await loadStudents();
      setCurrentStudent(res.student);
      const appliedTheme = theme || 'birthday';
      setSettings((prev) => ({
        ...prev,
        theme: appliedTheme,
        schoolClass: gradeClass,
        boardTitle: THEMES[appliedTheme].defaultTitleTemplate(res.student.name),
        titleColor: THEMES[appliedTheme].primaryColor,
      }));
    }
  };

  // Bulk add students
  const handleAddBulkStudents = async (names: string[], gradeClass: string) => {
    for (const name of names) {
      await GasService.addStudent(name, gradeClass);
    }
    await loadStudents();
  };

  // Delete student
  const handleDeleteStudent = async (name: string) => {
    await GasService.deleteStudent(name);
    const updated = await GasService.getStudents();
    setStudents(updated);
    if (currentStudent?.name === name) {
      if (updated.length > 0) {
        handleSelectStudent(updated[0]);
      } else {
        setCurrentStudent(null);
        setMessages([]);
      }
    }
  };

  // Clear sample dummy students
  const handleClearSampleStudents = async () => {
    const updated = GasService.clearSampleStudents();
    setStudents(updated);
    if (updated.length > 0) {
      handleSelectStudent(updated[0]);
    } else {
      setCurrentStudent(null);
      setMessages([]);
    }
  };

  // Add message
  const handleAddMessage = async (msgData: Omit<Message, 'id' | 'createdAt'>) => {
    const res = await GasService.addMessage(msgData);
    if (res.success) {
      // Reload messages for target student
      if (currentStudent && currentStudent.name === msgData.studentName) {
        setMessages((prev) => [res.message, ...prev]);
        setStudents((prev) =>
          prev.map((s) =>
            s.name === currentStudent.name ? { ...s, messageCount: s.messageCount + 1 } : s
          )
        );
      } else {
        // Find recipient and switch
        const target = students.find((s) => s.name === msgData.studentName);
        if (target) {
          setCurrentStudent(target);
          loadMessages(target);
        }
      }
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId: string) => {
    if (!currentStudent) return;
    await GasService.deleteMessage(currentStudent.name, msgId);
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    setStudents((prev) =>
      prev.map((s) =>
        s.name === currentStudent.name
          ? { ...s, messageCount: Math.max(0, s.messageCount - 1) }
          : s
      )
    );
  };

  // Connection updated handler
  const handleConnectionUpdated = () => {
    setIsConnectedToGas(GasService.isConnected());
    loadStudents();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-noto">
      {/* Top Navbar */}
      <Navbar
        currentStudent={currentStudent}
        students={students}
        currentTheme={currentTheme}
        settings={settings}
        isConnectedToGas={isConnectedToGas}
        activeView="board"
        onSelectStudent={handleSelectStudent}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenStudentModal={() => setIsStudentModalOpen(true)}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onOpenComposeModal={() => setIsComposeModalOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onExportImage={() => setIsImageExportOpen(true)}
        onToggleView={() => {}}
      />

      {/* Horizontal Student Quick Bar */}
      <StudentBar
        students={students}
        currentStudent={currentStudent}
        currentTheme={currentTheme}
        onSelectStudent={handleSelectStudent}
        onOpenAddStudent={() => setIsStudentModalOpen(true)}
      />

      {/* Notice Banner if running in Local/Preview mode */}
      {!isConnectedToGas && (
        <div className="bg-gradient-to-r from-[#FFFDE8] to-[#FFF6A9]/50 border-b border-[#FFCA88]/70 px-4 py-2 text-xs text-[#6d4411] flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#DE7272] animate-pulse" />
              <span>
                현재 <strong>로컬 브라우저 모드</strong>로 작동 중입니다. 구글 스프레드시트와 학생별 탭을 실시간 연동하려면
              </span>
              <button
                type="button"
                onClick={() => setIsGasModalOpen(true)}
                className="underline font-bold text-[#DE7272] hover:text-[#c45353] ml-1 cursor-pointer"
              >
                [Code.gs 연동 가이드]
              </button>
              <span>를 확인하세요.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsGasModalOpen(true)}
              className="px-3 py-1 rounded-lg bg-[#FFCA88] hover:bg-[#f5bb73] text-[#5a2e0a] font-bold text-[11px] transition-colors cursor-pointer border border-[#FFCA88]"
            >
              구글 시트 연동하기
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700 font-jua">
              롤링페이퍼 데이터를 불러오는 중입니다...
            </p>
          </div>
        ) : (
          <RollingBoard
            currentStudent={currentStudent}
            messages={messages}
            currentTheme={currentTheme}
            settings={settings}
            onOpenCompose={() => setIsComposeModalOpen(true)}
            onDeleteMessage={handleDeleteMessage}
            onExportImage={() => setIsImageExportOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        students={students}
        currentStudent={currentStudent}
        onSelectStudent={handleSelectStudent}
        onAddStudent={handleAddStudent}
        onAddBulkStudents={handleAddBulkStudents}
        onDeleteStudent={handleDeleteStudent}
        onClearSampleStudents={handleClearSampleStudents}
        isConnectedToGas={isConnectedToGas}
      />

      <ThemeSettingsModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={settings}
        currentStudent={currentStudent}
        onSaveSettings={(newSettings) => setSettings(newSettings)}
      />

      <MessageComposerModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
        students={students}
        currentStudent={currentStudent}
        currentTheme={currentTheme}
        onSubmitMessage={handleAddMessage}
      />

      <GoogleAppsScriptModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
        onConnectionUpdated={handleConnectionUpdated}
      />

      <ImageExportModal
        isOpen={isImageExportOpen}
        onClose={() => setIsImageExportOpen(false)}
        currentStudent={currentStudent}
        currentTheme={currentTheme}
        settings={settings}
      />
    </div>
  );
}
