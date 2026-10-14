import { Student, Message } from '../types';

const STORAGE_KEY_GAS_URL = 'rolling_gas_app_url';
const STORAGE_KEY_STUDENTS = 'rolling_local_students_v2';
const STORAGE_KEY_MESSAGES = 'rolling_local_messages_v2';

// Initial sample data for instant exploration
const INITIAL_STUDENTS: Student[] = [
  { id: 'student_1', name: '김민준', gradeClass: '3학년 2반', messageCount: 6, customTheme: 'birthday' },
  { id: 'student_2', name: '이서연', gradeClass: '3학년 2반', messageCount: 5, customTheme: 'farewell' },
  { id: 'student_3', name: '박도현', gradeClass: '3학년 2반', messageCount: 4, customTheme: 'welcome' },
  { id: 'student_4', name: '최유진', gradeClass: '3학년 2반', messageCount: 7, customTheme: 'graduation' },
  { id: 'student_5', name: '정하은', gradeClass: '3학년 2반', messageCount: 3, customTheme: 'cheering' },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  '김민준': [
    {
      id: 'm1',
      studentName: '김민준',
      author: '짝꿍 도현이',
      content: '민준아! 생일 진심으로 축하해 🎂 오늘 수업 끝나고 떡볶이 먹으러 가자 내가 쏠게!!',
      sticker: '🎂',
      color: 'butter',
      font: 'himelody',
      rotation: -2,
      createdAt: '2026-10-13 14:20:00'
    },
    {
      id: 'm2',
      studentName: '김민준',
      author: '서연이가',
      content: '민준아 생일 축하해! 항상 수학 문제 모르는 거 물어보면 친절하게 알려줘서 고마워 🎉',
      sticker: '🎉',
      color: 'peach',
      font: 'gamja',
      rotation: 3,
      createdAt: '2026-10-13 14:35:00'
    },
    {
      id: 'm3',
      studentName: '김민준',
      author: '축구부 일동',
      content: '체육 시간 최고의 공격수 민준이 생일 ㅊㅋㅊㅋ! 다음 경기 때도 골 많이 넣어줘 ⚽🔥',
      sticker: '🎁',
      color: 'coral',
      font: 'poorstory',
      rotation: -1,
      createdAt: '2026-10-13 15:10:00'
    },
    {
      id: 'm4',
      studentName: '김민준',
      author: '담임선생님 💛',
      content: '민준이의 10번째 생일을 진심으로 축하한다. 늘 밝은 웃음으로 우리 반을 환하게 해주는 멋진 민준이가 자랑스럽단다!',
      sticker: '🎈',
      color: 'butter',
      font: 'himelody',
      rotation: 1,
      createdAt: '2026-10-13 15:30:00'
    },
    {
      id: 'm5',
      studentName: '김민준',
      author: '유진',
      content: '맛있는 생일 케이크 많이 먹고 가족들이랑 행복한 시간 보내길 바라! 해피 버스데이~ 🧁',
      sticker: '🧁',
      color: 'peach',
      font: 'gamja',
      rotation: -3,
      createdAt: '2026-10-13 16:00:00'
    },
    {
      id: 'm6',
      studentName: '김민준',
      author: '익명의 펭귄',
      content: '민준아 태어나줘서 고마워! 언제나 네 편이야 💖',
      sticker: '💖',
      color: 'cream',
      font: 'poorstory',
      rotation: 2,
      createdAt: '2026-10-13 16:15:00'
    }
  ],
  '이서연': [
    {
      id: 'sy1',
      studentName: '이서연',
      author: '하은이',
      content: '서연아 전학 간다니 너무 아쉽고 눈물 나 🥹 새 학교 가서도 꼭 매일 톡하고 방학 때 만나자!',
      sticker: '🥹',
      color: 'pink',
      font: 'gaegu',
      rotation: -2,
      createdAt: '2026-10-13 11:00:00'
    },
    {
      id: 'sy2',
      studentName: '이서연',
      author: '민준',
      content: '서연아 넌 성격도 좋고 친절해서 새 학교에서도 분명 인기 짱일 거야! 응원할게 비행기 타고 날아가도 기억해 ✈️',
      sticker: '✈️',
      color: 'blue',
      font: 'jua',
      rotation: 2,
      createdAt: '2026-10-13 11:20:00'
    },
    {
      id: 'sy3',
      studentName: '이서연',
      author: '도현',
      content: '소중했던 추억 절대 안 잊을게! 전화번호 바꾸면 바로 알려줘 💌',
      sticker: '💌',
      color: 'yellow',
      font: 'nanum',
      rotation: -1,
      createdAt: '2026-10-13 11:45:00'
    },
    {
      id: 'sy4',
      studentName: '이서연',
      author: '선생님',
      content: '서연이의 따뜻한 배려와 미소는 우리 반 친구들 모두에게 큰 선물이었단다. 어디서든 서연이의 꿈을 응원할게 🍀',
      sticker: '🍀',
      color: 'mint',
      font: 'gowun',
      rotation: 1,
      createdAt: '2026-10-13 12:10:00'
    },
    {
      id: 'sy5',
      studentName: '이서연',
      author: '3-2 친구들',
      content: '우린 영원히 하나야! 서연아 사랑해 잘 가~ 🤍',
      sticker: '🤍',
      color: 'purple',
      font: 'jua',
      rotation: -2,
      createdAt: '2026-10-13 12:30:00'
    }
  ],
  '박도현': [
    {
      id: 'dh1',
      studentName: '박도현',
      author: '민준이',
      content: '도현아 우리 반에 전학 온 걸 두 손 들어 환영해! 🌈 점심시간에 나랑 보드게임 하자!',
      sticker: '🌈',
      color: 'mint',
      font: 'jua',
      rotation: -1,
      createdAt: '2026-10-13 09:00:00'
    },
    {
      id: 'dh2',
      studentName: '박도현',
      author: '반장 서연',
      content: '도현아 학교 구조 헷갈리거나 필요한 거 있으면 언제든 편하게 물어봐줘 👋',
      sticker: '👋',
      color: 'yellow',
      font: 'gowun',
      rotation: 2,
      createdAt: '2026-10-13 09:30:00'
    },
    {
      id: 'dh3',
      studentName: '박도현',
      author: '유진',
      content: '우리 반 진짜 재밌어! 금방 적응할 수 있을 거야 파이팅 😊',
      sticker: '😊',
      color: 'pink',
      font: 'gaegu',
      rotation: -2,
      createdAt: '2026-10-13 10:00:00'
    },
    {
      id: 'dh4',
      studentName: '박도현',
      author: '선생님',
      content: '도현이가 우리 반의 새로운 가족이 되어 무척 기쁘구나. 즐겁고 행복한 추억 많이 쌓자꾸나!',
      sticker: '🌸',
      color: 'peach',
      font: 'nanum',
      rotation: 1,
      createdAt: '2026-10-13 10:15:00'
    }
  ],
  '최유진': [
    {
      id: 'yj1',
      studentName: '최유진',
      author: '민준',
      content: '벌써 졸업이라니 믿기지가 않는다 🎓 1년 동안 같이 공부하고 놀아서 너무 행복했어!',
      sticker: '🎓',
      color: 'yellow',
      font: 'gaegu',
      rotation: -2,
      createdAt: '2026-10-13 13:00:00'
    },
    {
      id: 'yj2',
      studentName: '최유진',
      author: '서연',
      content: '유진아 중학교 가서도 멋진 꿈 꼭 이루고 반짝반짝 빛나길 응원해 💐',
      sticker: '💐',
      color: 'pink',
      font: 'jua',
      rotation: 1,
      createdAt: '2026-10-13 13:20:00'
    },
    {
      id: 'yj3',
      studentName: '최유진',
      author: '도현',
      content: '함께했던 체육대회, 축제 모두 평생 못 잊을 거야 🏅 넌 최고야!',
      sticker: '🏅',
      color: 'blue',
      font: 'nanum',
      rotation: -1,
      createdAt: '2026-10-13 13:40:00'
    },
    {
      id: 'yj4',
      studentName: '최유진',
      author: '선생님',
      content: '한 해 동안 반장으로서 궂은 일 도맡아 해준 유진이의 책임감에 늘 감사했단다. 더 넓은 세상으로 날아올라라!',
      sticker: '🚀',
      color: 'mint',
      font: 'gowun',
      rotation: 2,
      createdAt: '2026-10-13 14:00:00'
    }
  ],
  '정하은': [
    {
      id: 'he1',
      studentName: '정하은',
      author: '서연',
      content: '하은아 항상 조용히 배려해주고 힘이 되어줘서 고마워 🍀 넌 정말 따뜻한 친구야!',
      sticker: '🍀',
      color: 'yellow',
      font: 'gaegu',
      rotation: 1,
      createdAt: '2026-10-13 15:00:00'
    },
    {
      id: 'he2',
      studentName: '정하은',
      author: '유진',
      content: '하은이의 그림 실력은 진짜 최고야 🎨 언제나 응원할게!',
      sticker: '⭐',
      color: 'purple',
      font: 'jua',
      rotation: -2,
      createdAt: '2026-10-13 15:20:00'
    },
    {
      id: 'he3',
      studentName: '정하은',
      author: '민준',
      content: '청소 시간마다 솔선수범하는 하은이 짱 멋져 👍 늘 고마워!',
      sticker: '👍',
      color: 'mint',
      font: 'nanum',
      rotation: 2,
      createdAt: '2026-10-13 15:40:00'
    }
  ]
};

export const DEFAULT_GAS_URL = 'https://script.google.com/macros/s/AKfycbwQHvgwDg4D-o5c0n3n-Pyx4pW7ZpNLRIJlpjGUY0yZ2FQimYIw71m9Wx9bhhiMDEnk/exec';

export class GasService {
  private static gasUrl: string = (() => {
    if (typeof window === 'undefined') return DEFAULT_GAS_URL;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_GAS_URL);
      if (stored !== null) {
        return (stored === 'none' || stored === 'disabled') ? '' : stored;
      }
      const envUrl = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GAS_URL);
      if (envUrl) {
        localStorage.setItem(STORAGE_KEY_GAS_URL, envUrl);
        return envUrl;
      }
      // Auto-persist default GAS URL so it remains connected across sessions
      localStorage.setItem(STORAGE_KEY_GAS_URL, DEFAULT_GAS_URL);
      return DEFAULT_GAS_URL;
    } catch {
      return DEFAULT_GAS_URL;
    }
  })();

  public static getGasUrl(): string {
    return this.gasUrl;
  }

  public static setGasUrl(url: string) {
    const trimmed = (url || '').trim();
    this.gasUrl = trimmed;
    if (typeof window !== 'undefined') {
      try {
        if (trimmed) {
          localStorage.setItem(STORAGE_KEY_GAS_URL, trimmed);
        } else {
          // Explicitly disabled by user in settings
          localStorage.setItem(STORAGE_KEY_GAS_URL, 'none');
        }
      } catch (err) {
        console.warn('localStorage error', err);
      }
    }
  }

  public static resetToDefaultGasUrl() {
    this.setGasUrl(DEFAULT_GAS_URL);
  }

  public static isDefaultGasUrl(): boolean {
    return this.gasUrl === DEFAULT_GAS_URL;
  }

  public static isConnected(): boolean {
    return Boolean(this.gasUrl && this.gasUrl.startsWith('http'));
  }

  /**
   * Test connection to Google Apps Script Web App
   */
  public static async testConnection(url?: string): Promise<{ success: boolean; message: string; sheetName?: string }> {
    const targetUrl = (url || this.gasUrl).trim();
    if (!targetUrl) {
      return { success: false, message: 'Google Apps Script URL을 입력해주세요.' };
    }

    // Try GET first (Google Apps Script handles GET redirects cleanest across all browsers)
    try {
      const getUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=getStudents&t=${Date.now()}`;
      const response = await fetch(getUrl);
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          return {
            success: true,
            message: '구글 스프레드시트와 성공적으로 연결되었습니다!',
            sheetName: '우리반 롤링페이퍼',
          };
        }
      }
    } catch {
      // Fall through to POST
    }

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'ping' }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          return {
            success: true,
            message: data.message || '연결 성공!',
            sheetName: data.spreadsheetName || '구글 스프레드시트',
          };
        }
      }
    } catch (err: any) {
      // 
    }

    return {
      success: false,
      message: '연결 실패: 네트워크 오류 또는 웹 앱 배포 권한([모든 사용자])을 확인해주세요.',
    };
  }

  /**
   * Parse URL parameters on initial load (?to=이창민&gas=...)
   */
  public static initFromUrl(): { targetStudent?: string; isNewGasConnected?: boolean } {
    if (typeof window === 'undefined') return {};
    try {
      const params = new URLSearchParams(window.location.search);
      const gasParam = params.get('gas');
      let isNewGasConnected = false;

      if (gasParam && gasParam.startsWith('http')) {
        this.setGasUrl(gasParam);
        isNewGasConnected = true;
      }

      const toParam = params.get('to') || params.get('student');
      return {
        targetStudent: toParam ? toParam.trim() : undefined,
        isNewGasConnected,
      };
    } catch {
      return {};
    }
  }

  /**
   * Generate student share link for students and teachers
   */
  public static getShareUrl(studentName?: string): string {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    if (studentName) {
      params.set('to', studentName);
    }
    if (this.gasUrl) {
      params.set('gas', this.gasUrl);
    }

    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  /**
   * Get students list (either from GAS or localStorage)
   */
  public static async getStudents(): Promise<Student[]> {
    if (this.isConnected()) {
      try {
        let data: any = null;

        // 1. Try GET first (Google Apps Script handles GET redirects cleanest across all browsers)
        try {
          const getUrl = `${this.gasUrl}${this.gasUrl.includes('?') ? '&' : '?'}action=getStudents&t=${Date.now()}`;
          const getRes = await fetch(getUrl);
          if (getRes.ok) {
            data = await getRes.json();
          }
        } catch {
          // If GET fails, try POST
          try {
            const response = await fetch(this.gasUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: 'getStudents' }),
            });
            if (response.ok) {
              data = await response.json();
            }
          } catch (postErr) {
            console.warn('GAS fetch failed', postErr);
          }
        }

        if (data && data.success && Array.isArray(data.students)) {
          // Filter out default empty sheets (Sheet1, 시트1, _ROLLING_CONFIG_) if there are student sheets
          const validRemote = data.students.filter((remote: any) => {
            const name = (remote.name || '').trim();
            if ((name === 'Sheet1' || name === '시트1' || name === '_ROLLING_CONFIG_') && data.students.length > 1) {
              return false;
            }
            if (name === '_ROLLING_CONFIG_') return false;
            return true;
          });

          if (validRemote.length > 0) {
            // Merge with local metadata if exists
            const localStudents = this.getLocalStudents();
            const localMap = new Map(localStudents.map(s => [s.name, s]));
            
            const merged: Student[] = validRemote.map((remote: any) => {
              const local = localMap.get(remote.name);
              return {
                id: remote.id || `student_${remote.name}`,
                name: remote.name,
                messageCount: remote.messageCount || 0,
                gradeClass: local?.gradeClass || '우리 반',
                customTheme: local?.customTheme || 'birthday',
                lastUpdated: remote.lastUpdated || new Date().toISOString(),
              };
            });

            // Save snapshot locally (this cleans dummy sample data)
            this.saveLocalStudents(merged);
            return merged;
          }
        }
      } catch (err) {
        console.warn('GAS fetch failed, falling back to local storage', err);
      }
    }

    return this.getLocalStudents();
  }

  /**
   * Add student (creates sheet in Google Sheets or updates local storage)
   */
  public static async addStudent(name: string, gradeClass: string = '우리 반', theme?: any): Promise<{ success: boolean; student: Student }> {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('학생 이름을 입력해주세요.');

    if (this.isConnected()) {
      try {
        const response = await fetch(this.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'addStudent', studentName: trimmed }),
        });
        if (response.ok) {
          const data = await response.json();
          if (!data.success) {
            throw new Error(data.error || '학생 추가 실패');
          }
        }
      } catch (err) {
        console.warn('GAS addStudent error:', err);
      }
    }

    // Always update local cache
    const students = this.getLocalStudents();
    const existingIndex = students.findIndex(s => s.name === trimmed);
    const newStudent: Student = {
      id: `student_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      gradeClass: gradeClass,
      messageCount: existingIndex >= 0 ? students[existingIndex].messageCount : 0,
      customTheme: theme || 'birthday',
      lastUpdated: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      students[existingIndex] = { ...students[existingIndex], ...newStudent };
    } else {
      students.push(newStudent);
    }
    this.saveLocalStudents(students);

    return { success: true, student: newStudent };
  }

  /**
   * Delete student from local storage
   */
  public static async deleteStudent(studentName: string): Promise<boolean> {
    const students = this.getLocalStudents();
    const filtered = students.filter(s => s.name !== studentName);
    this.saveLocalStudents(filtered);

    // Also remove local messages
    const all = this.getAllLocalMessages();
    delete all[studentName];
    this.saveAllLocalMessages(all);
    return true;
  }

  /**
   * Clear all initial dummy sample students (김민준, 이서연, 박도현, 최유진, 정하은)
   */
  public static clearSampleStudents(): Student[] {
    const dummyNames = new Set(INITIAL_STUDENTS.map(s => s.name));
    const students = this.getLocalStudents().filter(s => !dummyNames.has(s.name));
    this.saveLocalStudents(students);
    return students;
  }

  /**
   * Check if any dummy sample students are present
   */
  public static hasSampleStudents(): boolean {
    const dummyNames = new Set(INITIAL_STUDENTS.map(s => s.name));
    return this.getLocalStudents().some(s => dummyNames.has(s.name));
  }

  /**
   * Get messages for a specific student
   */
  public static async getMessages(studentName: string): Promise<Message[]> {
    if (this.isConnected()) {
      try {
        let data: any = null;

        // 1. Try GET first (Google Apps Script handles GET cleanly without CORS issues)
        try {
          const getUrl = `${this.gasUrl}${this.gasUrl.includes('?') ? '&' : '?'}action=getMessages&student=${encodeURIComponent(studentName)}&t=${Date.now()}`;
          const getRes = await fetch(getUrl);
          if (getRes.ok) {
            data = await getRes.json();
          }
        } catch {
          // Fallback to POST
          try {
            const response = await fetch(this.gasUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({ action: 'getMessages', studentName }),
            });
            if (response.ok) {
              data = await response.json();
            }
          } catch (postErr) {
            console.warn('GAS POST getMessages failed', postErr);
          }
        }

        if (data && data.success && Array.isArray(data.messages)) {
          // Add slight random rotation for notes if not provided
          const formatted = data.messages.map((m: any, idx: number) => ({
            ...m,
            rotation: ((idx % 5) - 2) * 1.5,
          }));
          this.saveLocalMessagesForStudent(studentName, formatted);
          return formatted;
        }
      } catch (err) {
        console.warn('GAS getMessages error, falling back to local', err);
      }
    }

    return this.getLocalMessagesForStudent(studentName);
  }

  /**
   * Add a message for a student
   */
  public static async addMessage(messageData: Omit<Message, 'id' | 'createdAt'>): Promise<{ success: boolean; message: Message }> {
    const id = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const fullMessage: Message = {
      ...messageData,
      id,
      createdAt: formattedDate,
      rotation: Math.floor(Math.random() * 7) - 3,
    };

    if (this.isConnected()) {
      try {
        const response = await fetch(this.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'addMessage',
            studentName: messageData.studentName,
            id,
            author: messageData.author,
            content: messageData.content,
            sticker: messageData.sticker,
            color: messageData.color,
            font: messageData.font,
            isSecret: messageData.isSecret || false,
            createdAt: formattedDate,
          }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            // Success in Google Sheets!
          }
        }
      } catch (err) {
        console.warn('GAS addMessage network error, saved to local cache', err);
      }
    }

    // Save locally
    const current = this.getLocalMessagesForStudent(messageData.studentName);
    const updated = [fullMessage, ...current];
    this.saveLocalMessagesForStudent(messageData.studentName, updated);

    // Update student count
    const students = this.getLocalStudents();
    const stIndex = students.findIndex(s => s.name === messageData.studentName);
    if (stIndex >= 0) {
      students[stIndex].messageCount = updated.length;
      students[stIndex].lastUpdated = formattedDate;
      this.saveLocalStudents(students);
    }

    return { success: true, message: fullMessage };
  }

  /**
   * Delete a message
   */
  public static async deleteMessage(studentName: string, messageId: string): Promise<boolean> {
    if (this.isConnected()) {
      try {
        await fetch(this.gasUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'deleteMessage',
            studentName,
            messageId,
          }),
        });
      } catch (err) {
        console.warn('GAS deleteMessage error:', err);
      }
    }

    const current = this.getLocalMessagesForStudent(studentName);
    const filtered = current.filter(m => m.id !== messageId);
    this.saveLocalMessagesForStudent(studentName, filtered);

    const students = this.getLocalStudents();
    const stIndex = students.findIndex(s => s.name === studentName);
    if (stIndex >= 0) {
      students[stIndex].messageCount = filtered.length;
      this.saveLocalStudents(students);
    }

    return true;
  }

  // --- Local storage helpers ---

  private static getLocalStudents(): Student[] {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      this.saveLocalStudents(INITIAL_STUDENTS);
      return INITIAL_STUDENTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  private static saveLocalStudents(students: Student[]) {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  }

  private static getLocalMessagesForStudent(studentName: string): Message[] {
    const all = this.getAllLocalMessages();
    if (!all[studentName]) {
      if (INITIAL_MESSAGES[studentName]) {
        all[studentName] = INITIAL_MESSAGES[studentName];
        this.saveAllLocalMessages(all);
        return INITIAL_MESSAGES[studentName];
      }
      return [];
    }
    return all[studentName];
  }

  private static saveLocalMessagesForStudent(studentName: string, messages: Message[]) {
    const all = this.getAllLocalMessages();
    all[studentName] = messages;
    this.saveAllLocalMessages(all);
  }

  private static getAllLocalMessages(): Record<string, Message[]> {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    if (!raw) {
      this.saveAllLocalMessages(INITIAL_MESSAGES);
      return INITIAL_MESSAGES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_MESSAGES;
    }
  }

  private static saveAllLocalMessages(data: Record<string, Message[]>) {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(data));
  }
}
