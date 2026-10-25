import { useMemo, useState, type ReactNode } from 'react';
import { IconSetting } from '../components/Icons';
import PolaroidStack from '../components/PolaroidStack';
import TabBar from '../components/TabBar';
import { formatStamp } from '../data/utils';
import { usePolaroids } from '../store/PolaroidStore';
import type { Polaroid } from '../data/mock';

/** 홈 · 폴라로이드 — Figma home / home-swipe 1~3 */
export default function HomePage() {
  const { polaroids } = usePolaroids();
  // 가장 최근 하루의 끼니들
  const today = useMemo(() => {
    const latest = polaroids[0]?.date;
    return polaroids.filter((p) => p.date === latest);
  }, [polaroids]);

  return <MealDay items={today} logo />;
}

/** 홈과 날짜별 모음이 함께 쓰는 하루 화면 */
export function MealDay({ items, logo = false, header }: { items: Polaroid[]; logo?: boolean; header?: ReactNode }) {
  const [index, setIndex] = useState(0);
  const current = items[index];

  return (
    <div className="home">
      <div className="home__glow" aria-hidden="true">
        <span />
      </div>

      {header ?? (
        <header className="home-header">
          <span className="home-header__slot" />
          {logo && <img className="home-header__logo" src="/assets/logo.svg" alt="mealo" width={118} height={36} />}
          <button type="button" className="home-header__slot icon-btn-28" aria-label="설정">
            <IconSetting size={28} />
          </button>
        </header>
      )}

      {current ? (
        <>
          <div className="home__title" key={current.id}>
            <p className="home__stamp">{formatStamp(current.date, current.time)}</p>
            <h1 className="home__name">{current.title}</h1>
          </div>

          <PolaroidStack items={items} onChange={setIndex} />

          {items.length > 1 && (
            <div className="home__indicator" role="tablist" aria-label={`${items.length}끼 중 ${index + 1}번째`}>
              {items.map((p, i) => (
                <span key={p.id} className={i === index ? 'is-active' : ''} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="home__empty">아직 기록된 식사가 없어요.</p>
      )}

      <TabBar />
    </div>
  );
}
