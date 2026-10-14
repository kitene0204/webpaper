export type ThemeId = 'birthday' | 'farewell' | 'welcome' | 'graduation' | 'cheering';

export type LayoutId = 'sticky' | 'grid' | 'polaroid' | 'corkboard';

export type FontId = 'himelody' | 'gamja' | 'poorstory' | 'pretendard' | 'gaegu' | 'nanum' | 'jua' | 'gowun' | 'noto';

export interface Sticker {
  id: string;
  emoji: string;
  label: string;
}

export interface RollingTheme {
  id: ThemeId;
  name: string;
  badge: string;
  tagline: string;
  description: string;
  primaryColor: string;
  accentBg: string;
  bannerGradient: string;
  boardBg: string;
  boardPatternClass: string;
  defaultTitleTemplate: (studentName: string) => string;
  stickers: Sticker[];
  suggestedPrompts: string[];
  bannerIcon: string;
  titleTextColor?: string;
  badgeClass?: string;
  cardCounterClass?: string;
}

export interface Student {
  id: string;
  name: string;
  avatarSeed?: string;
  gradeClass?: string;
  messageCount: number;
  lastUpdated?: string;
  customTheme?: ThemeId;
}

export interface Message {
  id: string;
  studentName: string;
  author: string;
  content: string;
  sticker: string;
  color: string; // e.g. 'yellow' | 'pink' | 'mint' | 'blue' | 'purple' | 'orange' | 'white'
  font: FontId;
  rotation?: number; // for realistic sticky notes: -4 to 4 degrees
  createdAt: string;
  isSecret?: boolean;
}

export interface RollingSettings {
  theme: ThemeId;
  layout: LayoutId;
  font: FontId;
  schoolClass: string;
  boardTitle: string;
  showDate: boolean;
  showAuthorBadge: boolean;
  bgTexture: 'dots' | 'grid' | 'plain' | 'cork';
  customBannerMessage?: string;
  titleColor?: string; // Hex color for top title banner & theme sync
}
