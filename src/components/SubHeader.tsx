import type { ReactNode } from 'react';
import Icon from './Icon';

/**
 * 서브 화면 헤더 — Figma 'header' (375×56, top 42): 뒤로가기 · 가운데 타이틀 · 설정
 * 가운데 BC Alphapipe 타이틀은 폰트 대신 디자이너가 준 SVG(public/assets/type)로 그린다.
 */
const WORDS = {
  archive: { w: 104, h: 38 },
  keyword: { w: 116, h: 38 },
  'title-edit': { w: 115, h: 38 },
} as const;
export type HeaderWord = keyof typeof WORDS;

const WORD_LABEL: Record<HeaderWord, string> = { archive: 'archive', keyword: 'keyword', 'title-edit': 'title edit' };

export default function SubHeader({
  word,
  title,
  onBack,
  right = 'settings',
}: {
  /** SVG 타이틀 */
  word?: HeaderWord;
  /** 일반 텍스트 타이틀 (예: 날짜 11.25) */
  title?: ReactNode;
  onBack: () => void;
  right?: 'settings' | 'none';
}) {
  return (
    <header className="sub-header">
      <button type="button" className="sub-header__btn" aria-label="뒤로 가기" onClick={onBack}>
        <Icon name="arrow_left_light" size={28} />
      </button>
      {word ? (
        <h1 className="sub-header__word">
          <img src={`/assets/type/${word}.svg`} alt={WORD_LABEL[word]} width={WORDS[word].w} height={WORDS[word].h} />
        </h1>
      ) : (
        <h1 className="sub-header__title">{title}</h1>
      )}
      {right === 'settings' ? (
        <button type="button" className="sub-header__btn" aria-label="설정">
          <Icon name="setting_line_light" size={28} />
        </button>
      ) : (
        <span className="sub-header__btn" aria-hidden="true" />
      )}
    </header>
  );
}
