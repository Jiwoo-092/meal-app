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

/** Sep 20 11:30 — Figma 폴라로이드 상단 표기 */
export function formatStamp(date: string, time: string): string {
  const d = new Date(`${date}T00:00:00`);
  return `${MONTHS[d.getMonth()]} ${d.getDate()} ${time}`;
}

export function toDateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
