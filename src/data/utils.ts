import { KEYWORDS, type KeywordId, type Polaroid } from './mock';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** 날짜 최신순. 같은 날짜는 데이터 순서(Figma 끼니 순서) 유지 */
export function sortPolaroids(list: Polaroid[]): Polaroid[] {
  return [...list].sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
}

export function getKeyword(id: string) {
  return KEYWORDS.find((k) => k.id === id);
}

export function isKeywordId(id: string): id is KeywordId {
  return KEYWORDS.some((k) => k.id === id);
}

export function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

/** 2026.09.20 (일) */
export function formatDate(value: string): string {
  const d = new Date(`${value}T00:00:00`);
  const week = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${week})`;
}

/** 11:30am · 15:15pm — Figma 폴라로이드 위 시간 표기 (24시간 + am/pm) */
export function formatTime(time: string): string {
  const h = Number(time.slice(0, 2));
  return `${time}${h < 12 ? 'am' : 'pm'}`;
}

/** Sep 20 11:30am — Figma 폴라로이드 상단 표기 */
export function formatStamp(date: string, time: string): string {
  const d = new Date(`${date}T00:00:00`);
  return `${MONTHS[d.getMonth()]} ${d.getDate()} ${formatTime(time)}`;
}

/** 08:12 pm — 키워드 폴더 썸네일 아래 시간 (12시간) */
export function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
}

/** 26.09.20 — 키워드 폴더 썸네일 아래 날짜 */
export function formatShortDate(date: string): string {
  return `${date.slice(2, 4)}.${date.slice(5, 7)}.${date.slice(8, 10)}`;
}

export function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
