import type { Polaroid } from '../data/mock';
import PolaroidCard from './PolaroidCard';

/** 홈 / 날짜별 모음 / 키워드 폴더 모음이 공유하는 폴라로이드 목록 UI */
export default function PolaroidList({ items, emptyText = '아직 기록된 폴라로이드가 없어요.' }: { items: Polaroid[]; emptyText?: string }) {
  if (items.length === 0) return <p className="empty">{emptyText}</p>;
  return (
    <ul className="polaroid-list">
      {items.map((p) => (
        <li key={p.id}>
          <PolaroidCard polaroid={p} />
        </li>
      ))}
    </ul>
  );
}
