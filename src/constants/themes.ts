import { RollingTheme, LayoutId, FontId } from '../types';

export const PALETTE = {
  coral: '#DE7272',
  peach: '#FFCA88',
  butter: '#FFF6A9',
  butterLight: '#FFFDE8',
};

export const THEMES: Record<string, RollingTheme> = {
  birthday: {
    id: 'birthday',
    name: '생일 축하해요 🎂',
    badge: '생일 파티',
    tagline: '세상에서 가장 특별한 너의 생일을 진심으로 축하해!',
    description: '알록달록 풍선과 케이크, 따뜻한 축하 메시지로 가득 채우는 생일 롤링페이퍼',
    primaryColor: '#DE7272', // 따뜻하고 화사한 코랄 핑크
    accentBg: '#FFF6A9',
    bannerGradient: 'bg-[#DE7272]',
    boardBg: 'bg-[#FFFDE8]',
    boardPatternClass: 'bg-dot-pastel',
    bannerIcon: '🎂',
    titleTextColor: 'text-white',
    badgeClass: 'bg-[#FFF6A9] text-[#6d4411] border-[#FFCA88]',
    cardCounterClass: 'text-[#FFF6A9]',
    defaultTitleTemplate: (name) => `🎂 ${name}의 특별한 생일을 축하해! 🎉`,
    stickers: [
      { id: 'b1', emoji: '🎂', label: '케이크' },
      { id: 'b2', emoji: '🎉', label: '폭죽' },
      { id: 'b3', emoji: '🎁', label: '선물상자' },
      { id: 'b4', emoji: '🎈', label: '풍선' },
      { id: 'b5', emoji: '🥳', label: '파티얼굴' },
      { id: 'b6', emoji: '✨', label: '반짝이' },
      { id: 'b7', emoji: '💖', label: '하트' },
      { id: 'b8', emoji: '🧁', label: '머핀' },
    ],
    suggestedPrompts: [
      '생일 너무 축하해! 오늘 하루 세상에서 제일 행복하길 바라 🍰',
      '항상 우리 반에서 밝게 웃어줘서 고마워, 맛있는 거 많이 먹어!',
      '태어나줘서 고마워! 언제나 든든한 너를 항상 응원해 ✨',
      '생일 선물은 바로 나! 농담이고 오늘 최고로 신나는 날 보내자 🎁',
    ],
  },

  farewell: {
    id: 'farewell',
    name: '전학 갈 때 / 석별의 정 👋',
    badge: '추억과 응원',
    tagline: '함께했던 소중한 시간 잊지 않을게, 새로운 곳에서도 반짝이길!',
    description: '다른 곳으로 떠나는 친구에게 고마움과 영원한 우정의 마음을 전해요',
    primaryColor: '#3E72A8', // 아련하고 포근한 하늘빛 인디고 블루
    accentBg: '#E0F2FE',
    bannerGradient: 'bg-[#3E72A8]',
    boardBg: 'bg-[#F0F6FA]',
    boardPatternClass: 'bg-dot-pastel',
    bannerIcon: '✈️',
    titleTextColor: 'text-white',
    badgeClass: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
    cardCounterClass: 'text-[#BAE6FD]',
    defaultTitleTemplate: (name) => `👋 ${name}야, 새로운 시작을 늘 응원할게! ✈️`,
    stickers: [
      { id: 'f1', emoji: '✈️', label: '비행기' },
      { id: 'f2', emoji: '💌', label: '편지' },
      { id: 'f3', emoji: '🥹', label: '감동눈물' },
      { id: 'f4', emoji: '🌟', label: '별' },
      { id: 'f5', emoji: '🤝', label: '악수' },
      { id: 'f6', emoji: '🍀', label: '네잎클로버' },
      { id: 'f7', emoji: '🫂', label: '포옹' },
      { id: 'f8', emoji: '🤍', label: '하얀하트' },
    ],
    suggestedPrompts: [
      '새 학교에 가서도 금방 멋진 친구들 많이 사귈 거야! 연락 꼭 하자 📱',
      '너와 함께 웃고 떠들었던 소중한 추억들 평생 잊지 않을게.',
      '어디에 있든 우리는 여전히 너의 든든한 친구야! 파이팅!',
      '보고 싶을 거야! 방학 때 꼭 다시 만나서 맛있는 거 먹자 약속!',
    ],
  },

  welcome: {
    id: 'welcome',
    name: '전학 올 때 / 환영해요 🌸',
    badge: '두근두근 환영',
    tagline: '우리 반에 온 걸 두 팔 벌려 환영해! 함께 즐거운 추억 만들자!',
    description: '새로 전학 온 친구가 어색하지 않도록 따뜻한 환영의 인사를 남겨요',
    primaryColor: '#E05D84', // 화사하고 설레는 벚꽃 로즈 핑크
    accentBg: '#FCE7F3',
    bannerGradient: 'bg-[#E05D84]',
    boardBg: 'bg-[#FFF5F7]',
    boardPatternClass: 'bg-dot-pastel',
    bannerIcon: '🌈',
    titleTextColor: 'text-white',
    badgeClass: 'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]',
    cardCounterClass: 'text-[#FBCFE8]',
    defaultTitleTemplate: (name) => `🌸 우리 반에 온 ${name}을(를) 환영해! 🌈`,
    stickers: [
      { id: 'w1', emoji: '🌸', label: '벚꽃' },
      { id: 'w2', emoji: '🌈', label: '무지개' },
      { id: 'w3', emoji: '👋', label: '손인사' },
      { id: 'w4', emoji: '😊', label: '미소' },
      { id: 'w5', emoji: '🤝', label: '짝꿍' },
      { id: 'w6', emoji: '🍭', label: '사탕' },
      { id: 'w7', emoji: '🎈', label: '풍선' },
      { id: 'w8', emoji: '✨', label: '반짝' },
    ],
    suggestedPrompts: [
      '우리 반에 와줘서 정말 반가워! 궁금한 거 있으면 언제든 물어봐 😊',
      '학교 생활 적응하기 힘들면 내가 언제든 도와줄게! 친하게 지내자!',
      '오늘부터 우리 베프 1일차! 급식 같이 맛있게 먹으러 가자 🍱',
      '우리 반 분위기 정말 좋으니까 걱정 마! 환영해!',
    ],
  },

  graduation: {
    id: 'graduation',
    name: '졸업 & 종업을 앞두고 🎓',
    badge: '새로운 시작',
    tagline: '한 해 동안 함께 울고 웃었던 우리, 더 넓은 세상을 향해 날아오르자!',
    description: '초·중·고 졸업식 및 종업식에서 1년 동안의 추억을 나누는 롤링페이퍼',
    primaryColor: '#1A4231', // 칠판 & 학사모에 어울리는 클래식 딥 포레스트 그린
    accentBg: '#FEF3C7',
    bannerGradient: 'bg-[#1A4231]',
    boardBg: '#1e3a2b',
    boardPatternClass: 'bg-grid-chalkboard',
    bannerIcon: '🎓',
    titleTextColor: 'text-[#FFF6A9]', // 황금빛 샴페인 텍스트로 칠판 그린과 완벽한 조화
    badgeClass: 'bg-[#FFF6A9] text-[#543d0b] border-[#FFCA88]',
    cardCounterClass: 'text-[#FFF6A9]',
    defaultTitleTemplate: (name) => `🎓 ${name}의 빛나는 졸업을 축하해! 🌟`,
    stickers: [
      { id: 'g1', emoji: '🎓', label: '학사모' },
      { id: 'g2', emoji: '💐', label: '꽃다발' },
      { id: 'g3', emoji: '🏅', label: '메달' },
      { id: 'g4', emoji: '🚀', label: '로켓' },
      { id: 'g5', emoji: '🏆', label: '트로피' },
      { id: 'g6', emoji: '📖', label: '책' },
      { id: 'g7', emoji: '✨', label: '빛' },
      { id: 'g8', emoji: '🤍', label: '하트' },
    ],
    suggestedPrompts: [
      '1년 동안 같은 반 친구로 지낼 수 있어서 정말 큰 행운이었어 💐',
      '너의 멋진 꿈이 꼭 이루어지길 항상 뒤에서 응원할게! 졸업 축하해!',
      '선생님 말씀도 열심히 듣고 매일 즐거웠던 추억 잊지 말자.',
      '새 학년, 새 학교에서도 넌 무조건 최고일 거야! 자랑스러운 친구야!',
    ],
  },

  cheering: {
    id: 'cheering',
    name: '칭찬 릴레이 & 우정 롤링 🍀',
    badge: '따뜻한 마음',
    tagline: '평소에 전하지 못했던 칭찬과 고마운 마음을 아낌없이 보내요!',
    description: '시험 응원, 스승의 날, 친구 사랑 주간 등 자유로운 주제로 활용해요',
    primaryColor: '#268050', // 싱그럽고 따뜻한 클로버 에메랄드 그린
    accentBg: '#D1FAE5',
    bannerGradient: 'bg-[#268050]',
    boardBg: 'bg-[#F2FAF5]',
    boardPatternClass: 'bg-dot-pastel',
    bannerIcon: '🍀',
    titleTextColor: 'text-white',
    badgeClass: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]',
    cardCounterClass: 'text-[#A7F3D0]',
    defaultTitleTemplate: (name) => `🍀 ${name}에게 전하는 따뜻한 응원 한마디! ✨`,
    stickers: [
      { id: 'c1', emoji: '🍀', label: '클로버' },
      { id: 'c2', emoji: '💛', label: '노란하트' },
      { id: 'c3', emoji: '👍', label: '최고' },
      { id: 'c4', emoji: '⭐', label: '별' },
      { id: 'c5', emoji: '🎯', label: '과녁' },
      { id: 'c6', emoji: '💌', label: '러브레터' },
      { id: 'c7', emoji: '🌼', label: '데이지' },
      { id: 'c8', emoji: '🔥', label: '열정' },
    ],
    suggestedPrompts: [
      '너의 배려심 넘치는 모습 덕분에 우리 반이 늘 따뜻해 고마워 🍀',
      '항상 묵묵히 청소도 돕고 친구들 챙겨줘서 진짜 멋있다고 생각했어!',
      '힘든 일 있을 때 언제든 털어놔! 넌 언제나 소중한 사람이야.',
      '오늘 하루도 파이팅! 넌 할 수 있어!',
    ],
  },
};

export const PRESET_TITLE_COLORS = [
  { name: '생일 코랄', hex: '#DE7272', themeId: 'birthday' },
  { name: '석별 인디고', hex: '#3E72A8', themeId: 'farewell' },
  { name: '환영 벚꽃로즈', hex: '#E05D84', themeId: 'welcome' },
  { name: '졸업 포레스트', hex: '#1A4231', themeId: 'graduation' },
  { name: '응원 클로버', hex: '#268050', themeId: 'cheering' },
  { name: '따스한 살구피치', hex: '#E27D60' },
  { name: '은은한 라벤더', hex: '#7E639E' },
  { name: '심플 슬레이트', hex: '#334155' },
];

export const LAYOUT_OPTIONS: { id: LayoutId; name: string; desc: string; icon: string }[] = [
  {
    id: 'sticky',
    name: '자유 포스트잇 보드',
    desc: '살짝 기울어진 손글씨 메모지가 자유롭게 붙어있는 자연스러운 보드',
    icon: '📌',
  },
  {
    id: 'grid',
    name: '단정한 카드 그리드',
    desc: '반듯하고 깔끔하게 정돈되어 한눈에 메시지가 들어오는 레이아웃',
    icon: '🧱',
  },
  {
    id: 'polaroid',
    name: '폴라로이드 사진첩',
    desc: '사진 액자처럼 흰색 테두리와 마스킹 테이프로 꾸민 감성 레이아웃',
    icon: '📸',
  },
  {
    id: 'corkboard',
    name: '코르크 메모판',
    desc: '나무 핀과 마스킹 테이프로 압정 꽂힌 교실 게시판 느낌',
    icon: '🪵',
  },
];

// Kids' writing fonts (Choose among Hi Melody, Gamja Flower, Poor Story)
export const FONT_OPTIONS: { id: FontId; name: string; fontClass: string; preview: string }[] = [
  { 
    id: 'himelody', 
    name: '하이멜로디 (Hi Melody)', 
    fontClass: 'font-himelody', 
    preview: '안녕! 생일 축하해 친구야~ 언제나 행복하자!' 
  },
  { 
    id: 'gamja', 
    name: '감자꽃 (Gamja Flower)', 
    fontClass: 'font-gamja', 
    preview: '소중한 너에게 전하는 따뜻한 마음과 응원이야!' 
  },
  { 
    id: 'poorstory', 
    name: '푸어스토리 (Poor Story)', 
    fontClass: 'font-poorstory', 
    preview: '우리 반에 온 걸 환영해! 매일매일 친하게 지내자' 
  },
];

export const NOTE_COLORS: Record<string, { bg: string; border: string; text: string; pinBg: string; name: string; hex: string }> = {
  butter: {
    bg: 'bg-[#FFF6A9]',
    border: 'border-[#f5ea8e]',
    text: 'text-[#5c4a16]',
    pinBg: 'bg-[#FFCA88]',
    name: '버터 옐로우 (#FFF6A9)',
    hex: '#FFF6A9',
  },
  peach: {
    bg: 'bg-[#FFCA88]',
    border: 'border-[#f0b56e]',
    text: 'text-[#5a3407]',
    pinBg: 'bg-[#DE7272]',
    name: '살구 피치 (#FFCA88)',
    hex: '#FFCA88',
  },
  coral: {
    bg: 'bg-[#DE7272]',
    border: 'border-[#c95d5d]',
    text: 'text-white',
    pinBg: 'bg-[#FFF6A9]',
    name: '따스한 코랄 (#DE7272)',
    hex: '#DE7272',
  },
  cream: {
    bg: 'bg-[#FFFDE8]',
    border: 'border-[#FFF6A9]',
    text: 'text-[#443818]',
    pinBg: 'bg-[#DE7272]',
    name: '밀크 크림 (#FFFDE8)',
    hex: '#FFFDE8',
  },
  mint: {
    bg: 'bg-[#D1FAE5]',
    border: 'border-[#A7F3D0]',
    text: 'text-[#064E3B]',
    pinBg: 'bg-[#FFCA88]',
    name: '민트 파스텔',
    hex: '#D1FAE5',
  },
  sky: {
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#BAE6FD]',
    text: 'text-[#075985]',
    pinBg: 'bg-[#DE7272]',
    name: '스카이 블루',
    hex: '#E0F2FE',
  },
  white: {
    bg: 'bg-white',
    border: 'border-[#FFF6A9]',
    text: 'text-slate-900',
    pinBg: 'bg-[#FFCA88]',
    name: '클린 화이트',
    hex: '#FFFFFF',
  },
  // Backward-compatible color aliases
  yellow: {
    bg: 'bg-[#FFF6A9]',
    border: 'border-[#f5ea8e]',
    text: 'text-[#5c4a16]',
    pinBg: 'bg-[#FFCA88]',
    name: '버터 옐로우 (#FFF6A9)',
    hex: '#FFF6A9',
  },
  pink: {
    bg: 'bg-[#DE7272]',
    border: 'border-[#c95d5d]',
    text: 'text-white',
    pinBg: 'bg-[#FFF6A9]',
    name: '따스한 코랄 (#DE7272)',
    hex: '#DE7272',
  },
  purple: {
    bg: 'bg-[#FFCA88]',
    border: 'border-[#f0b56e]',
    text: 'text-[#5a3407]',
    pinBg: 'bg-[#DE7272]',
    name: '살구 피치 (#FFCA88)',
    hex: '#FFCA88',
  },
  blue: {
    bg: 'bg-[#E0F2FE]',
    border: 'border-[#BAE6FD]',
    text: 'text-[#075985]',
    pinBg: 'bg-[#DE7272]',
    name: '스카이 블루',
    hex: '#E0F2FE',
  },
  orange: {
    bg: 'bg-[#FFCA88]',
    border: 'border-[#f0b56e]',
    text: 'text-[#5a3407]',
    pinBg: 'bg-[#DE7272]',
    name: '살구 피치 (#FFCA88)',
    hex: '#FFCA88',
  },
};
