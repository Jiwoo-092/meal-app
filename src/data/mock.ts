/**
 * 전시용 더미 데이터 (Figma 'gui 클로드가 구현할 페이지 인터렉션' 섹션 기준)
 * 실제 서비스 데이터가 아닙니다.
 */

export type KeywordId = 'relation' | 'taste' | 'health' | 'achievement' | 'discovery';

export interface Keyword {
  id: KeywordId;
  label: string; // 폴더명
  name: string; // 스티커 문구
  sticker: string; // 스티커 이미지
  /** 스티커 이미지 크기와 컴포넌트(98×110) 기준 오프셋 — Figma export 결과 기준 */
  art: { w: number; h: number; dx: number; dy: number };
}

export const KEYWORDS: Keyword[] = [
  { id: 'relation', label: '관계', name: 'Chatty Table', sticker: '/assets/sticker/relation.webp', art: { w: 98, h: 117, dx: 0, dy: -6 } },
  { id: 'taste', label: '맛', name: 'Yum!', sticker: '/assets/sticker/taste.webp', art: { w: 98, h: 110, dx: 0, dy: 0 } },
  { id: 'health', label: '건강', name: 'Feel Good Food', sticker: '/assets/sticker/health.webp', art: { w: 98, h: 111, dx: 0, dy: -4 } },
  { id: 'achievement', label: '성취감', name: 'Who Made This! (Me)', sticker: '/assets/sticker/achievement.webp', art: { w: 127, h: 133, dx: -10, dy: -11 } },
  { id: 'discovery', label: '발견', name: 'Hidden Gem', sticker: '/assets/sticker/discovery.webp', art: { w: 98, h: 110, dx: 0, dy: 0 } },
];

/** 폴라로이드 위 스티커 배치 — 238×345(M 카드) 좌표계 기준, 카드 크기에 비례해 스케일 */
export interface StickerPlacement {
  keyword: KeywordId;
  x: number;
  y: number;
  w: number; // 컴포넌트 폭 (기본 98)
}

export type MealDesignId = 'burger' | 'salmon' | 'pasta';

export interface MealDesign {
  photo: string;
  photoAlt: string;
  stickers: StickerPlacement[];
}

export const MEAL_DESIGNS: Record<MealDesignId, MealDesign> = {
  burger: {
    photo: '/assets/food/meal-1.webp',
    photoAlt: '수제버거와 사과, 롤케이크가 차려진 식탁',
    stickers: [
      { keyword: 'relation', x: 152, y: 95, w: 78 },
      { keyword: 'achievement', x: 11, y: 209, w: 98 },
    ],
  },
  salmon: {
    photo: '/assets/food/meal-2.webp',
    photoAlt: '연어 스테이크와 그린빈, 감자',
    stickers: [
      { keyword: 'achievement', x: 131, y: 24, w: 98 },
      { keyword: 'health', x: 9, y: 212, w: 98 },
    ],
  },
  pasta: {
    photo: '/assets/food/meal-3.webp',
    photoAlt: '고추장 파스타 한 그릇',
    stickers: [
      { keyword: 'taste', x: 132, y: 21, w: 98 },
      { keyword: 'discovery', x: 21, y: 209, w: 98 },
    ],
  },
};

export type Tempo = 'slow' | 'stable' | 'fast';
export const TEMPO_LABEL: Record<Tempo, string> = { slow: '느긋한', stable: '적당한', fast: '빠른' };

/** 밀로 한마디 — 줄 단위, 강조 구간은 { text, bg, color? } */
export type MessagePart = string | { text: string; bg: string; color?: string };

export interface Polaroid {
  id: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
  design: MealDesignId;
  keywords: KeywordId[];
  message: MessagePart[][];
  tempo: Tempo;
  minutes: number;
  memo: string;
}

const MESSAGES: Record<MealDesignId, MessagePart[][]> = {
  burger: [
    ['오늘은 ', { text: '이야기', bg: '#FD595A', color: '#FFFFFF' }, '가 끊이지 않았네요.'],
    ['게다가 ', { text: '직접 만든 요리', bg: '#FFE481' }, '라니,'],
    ['조금 자랑스러워해도 되겠어요.'],
  ],
  salmon: [
    ['오늘은 ', { text: '몸을 생각한 한 끼', bg: '#A8F1BF' }, '였네요.'],
    ['골고루 챙겨 먹은 자신을 조금'],
    [{ text: '더 칭찬해줘도', bg: '#FFE481' }, ' 좋겠어요.'],
  ],
  pasta: [
    ['오늘은 ', { text: '새로운 레시피를 발견', bg: '#B0C4FF' }, '했네요.'],
    ['익숙한 재료인데 색다르죠. '],
    [{ text: '이런 맛있는 식사는', bg: '#FF9B6D' }, ' 오래 기억해둬요.'],
  ],
};

/** 말풍선 안 텍스트 박스 위치 (222×81 말풍선 기준, Figma) */
export const MESSAGE_BOX: Record<MealDesignId, { left: number; top: number; width: number }> = {
  burger: { left: 37, top: 14, width: 159 },
  salmon: { left: 36.8, top: 13.8, width: 158 },
  pasta: { left: 31.8, top: 13.8, width: 177 },
};

/** 평균 식사 시간 (분) — time 게이지의 파란 '평균' 호 */
export const AVG_MINUTES = 31.5;

const BASE: Record<MealDesignId, Pick<Polaroid, 'title' | 'tempo' | 'minutes' | 'memo'>> = {
  burger: { title: '친구와 신나게 만든 수제버거', tempo: 'stable', minutes: 42, memo: '' },
  salmon: { title: '건강하고 맛있는 연어 스테이크', tempo: 'stable', minutes: 42, memo: '' },
  pasta: { title: '새로운 레시피 고추장 파스타', tempo: 'fast', minutes: 16, memo: '' },
};

function meal(id: string, design: MealDesignId, date: string, time: string): Polaroid {
  return {
    id,
    design,
    date,
    time,
    keywords: MEAL_DESIGNS[design].stickers.map((s) => s.keyword),
    message: MESSAGES[design],
    ...BASE[design],
  };
}

/** 홈에 보이는 하루(9/20)는 Figma 순서(첫 끼 → 셋째 끼) 그대로 */
export const POLAROIDS: Polaroid[] = [
  meal('p01', 'burger', '2026-09-20', '11:30'),
  meal('p02', 'salmon', '2026-09-20', '15:15'),
  meal('p03', 'pasta', '2026-09-20', '09:27'),
  meal('p04', 'salmon', '2026-09-18', '12:40'),
  meal('p05', 'pasta', '2026-09-18', '19:10'),
  meal('p06', 'burger', '2026-09-16', '13:05'),
  meal('p07', 'pasta', '2026-09-16', '20:12'),
  meal('p08', 'salmon', '2026-09-15', '08:30'),
  meal('p09', 'pasta', '2026-09-15', '18:45'),
  meal('p10', 'salmon', '2026-09-10', '12:20'),
  meal('p11', 'burger', '2026-09-04', '11:50'),
  meal('p12', 'salmon', '2026-09-04', '13:30'),
  meal('p13', 'pasta', '2026-09-04', '19:40'),
];

/* ---------- 아카이브 ---------- */

/** 키워드 폴더 색 — Figma 'archive folder' (뒤 종이 2장 + 폴라로이드) */
export const FOLDER_TONES: Record<KeywordId, { back: string; mid: string; card: string }> = {
  relation: { back: '#ead6d6', mid: '#f3dada', card: '#ffd6d6' },
  taste: { back: '#e8d0bf', mid: '#f1dacb', card: '#ffe6d5' },
  health: { back: '#e4ecc9', mid: '#ebf3ce', card: '#f5ffd1' },
  achievement: { back: '#e6e2bd', mid: '#f4f0c6', card: '#fffbca' },
  discovery: { back: '#d8cbe8', mid: '#e2d9ee', card: '#ead9ff' },
};

/** 키워드 폴더 안 썸네일 — 사진은 추후 교체 예정이라 일단 하나로 통일 */
export const ARCHIVE_THUMB = '/assets/food/meal-3.webp';

/** 키워드별로 상세에 쓸 식사 디자인 (해당 키워드 스티커가 붙은 식사) */
const KEYWORD_DESIGNS: Record<KeywordId, MealDesignId[]> = {
  relation: ['burger'],
  taste: ['pasta'],
  health: ['salmon'],
  achievement: ['burger', 'salmon'],
  discovery: ['pasta'],
};

/** 키워드 폴더 속 폴라로이드 (키워드당 6장, 날짜·시간 겹치지 않게) */
const ARCHIVE_SLOTS: Record<KeywordId, [string, string][]> = {
  relation: [['2026-11-13', '19:24'], ['2026-11-08', '12:40'], ['2026-11-02', '18:05'], ['2026-10-27', '13:15'], ['2026-10-19', '20:12'], ['2026-10-11', '11:48']],
  taste: [['2026-11-12', '12:30'], ['2026-11-06', '19:40'], ['2026-10-30', '08:55'], ['2026-10-24', '18:20'], ['2026-10-15', '13:05'], ['2026-10-07', '20:35']],
  health: [['2026-11-11', '08:10'], ['2026-11-07', '12:15'], ['2026-11-04', '18:45'], ['2026-10-28', '07:50'], ['2026-10-20', '12:25'], ['2026-10-09', '19:10']],
  achievement: [['2026-11-13', '13:00'], ['2026-11-09', '19:30'], ['2026-11-03', '11:20'], ['2026-10-25', '18:50'], ['2026-10-17', '12:05'], ['2026-10-05', '20:40']],
  discovery: [['2026-11-12', '20:10'], ['2026-11-05', '13:35'], ['2026-11-01', '09:25'], ['2026-10-22', '19:55'], ['2026-10-13', '12:50'], ['2026-10-03', '18:15']],
};

export const ARCHIVE_POLAROIDS: Polaroid[] = (Object.keys(ARCHIVE_SLOTS) as KeywordId[]).flatMap((k) =>
  ARCHIVE_SLOTS[k].map(([date, time], i) => {
    const designs = KEYWORD_DESIGNS[k];
    return meal(`a-${k}-${i + 1}`, designs[i % designs.length], date, time);
  }),
);

/** 폴더(키워드)별 폴라로이드 id 목록 */
export const ARCHIVE_BY_KEYWORD: Record<KeywordId, string[]> = Object.fromEntries(
  (Object.keys(ARCHIVE_SLOTS) as KeywordId[]).map((k) => [k, ARCHIVE_SLOTS[k].map((_, i) => `a-${k}-${i + 1}`)]),
) as Record<KeywordId, string[]>;

/**
 * 캘린더 — Figma 'archive: calendar' 그대로 (2026년 11월, 임의 설정한 기록 표시 유지)
 * 키워드 색: 관계 strawberry · 맛 coral · 성취감 lemon · 건강 mint · 발견 skyblue
 */
export const CALENDAR = { year: 2026, month: 11 };
export const CALENDAR_SELECTED_DAY = 14;
export const CALENDAR_DOTS: Record<number, string[]> = {
  1: ['#ff6364', '#a8f1bf', '#b0c4ff'],
  2: ['#ff9b6d', '#ff6364', '#b0c4ff'],
  3: ['#ff9b6d', '#fdff82'],
  4: ['#ff9b6d', '#a8f1bf', '#b0c4ff'],
  5: ['#a8f1bf', '#b0c4ff'],
  6: ['#ff9b6d', '#fdff82', '#b0c4ff'],
  7: ['#fdff82', '#a8f1bf', '#b0c4ff'],
  8: ['#ff6364', '#ff9b6d'],
  9: ['#ff9b6d', '#fdff82'],
  10: ['#ff9b6d', '#a8f1bf'],
  11: ['#ff6364', '#ff9b6d', '#a8f1bf'],
  12: ['#ff6364', '#b0c4ff'],
  13: ['#ff6364', '#ff9b6d', '#fdff82'],
};
/** 날짜별 모음에 보여줄 폴라로이드 — 사진·정보는 추후 교체, 일단 홈의 세 끼로 */
export const CALENDAR_DAY_ITEMS = ['p01', 'p02', 'p03'];

/** 전시 기준 '오늘' (캘린더 강조용) */
export const DEMO_TODAY = '2026-09-23';

/** 전등 컬러 프리셋 (더미) */
export const LIGHT_PRESETS = [
  { id: 'warm', label: '웜', color: '#ffb84d' },
  { id: 'peach', label: '피치', color: '#ff9a8a' },
  { id: 'mint', label: '민트', color: '#7fd8be' },
  { id: 'sky', label: '스카이', color: '#7fb8ff' },
  { id: 'lavender', label: '라벤더', color: '#b9a3ff' },
  { id: 'lemon', label: '레몬', color: '#ffe46b' },
  { id: 'rose', label: '로즈', color: '#ff7aa8' },
  { id: 'white', label: '화이트', color: '#fff8ea' },
] as const;
