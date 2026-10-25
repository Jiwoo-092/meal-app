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
    ['골고루 챙겨 먹은 자신을조금'],
    [{ text: '더 뿌듯해해도', bg: '#FFE481' }, ' 좋겠어요.'],
  ],
  pasta: [
    ['오늘은 ', { text: '새로운 레시피를 발견', bg: '#B0C4FF' }, '했네요.'],
    ['익숙한 재료인데 색다르죠. '],
    [{ text: '이런 맛있는 식사는', bg: '#FF9B6D' }, ' 오래 기억해둬요.'],
  ],
};

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
