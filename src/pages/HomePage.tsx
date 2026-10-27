import { useMemo, useState, type ReactNode } from 'react';
import Icon from '../components/Icon';
import PolaroidStack from '../components/PolaroidStack';
import TabBar from '../components/TabBar';
import type { Polaroid } from '../data/mock';
import { formatStamp } from '../data/utils';
import { Artboard } from '../lib/artboard';
import { usePolaroids } from '../store/PolaroidStore';

/** 홈 · 폴라로이드 — Figma home / home-swipe 1~3 */
export default function HomePage() {
  const { polaroids } = usePolaroids();
  // 가장 최근 하루의 끼니들
  const today = useMemo(() => {
    const latest = polaroids[0]?.date;
    return polaroids.filter((p) => p.date === latest);
  }, [polaroids]);

  return <MealDay items={today} />;
}

const ORDINALS = ['first', 'second', 'third'];
/** 하루 중 몇 번째 끼니인지 — Figma 'first / second / third' 칩 */
const ordinal = (i: number) => ORDINALS[i] ?? `${i + 1}th`;

/** 홈 헤더 — 좌측 슬롯(뒤로가기 등) · 로고 · 설정 */
export function HomeHeader({ left }: { left?: ReactNode }) {
  return (
    <header className="home-header">
      <span className="home-header__slot">{left}</span>
      <img className="home-header__logo" src="/assets/logo.svg" alt="mealo" width={118} height={36} />
      <button type="button" className="home-header__slot icon-btn-28" aria-label="설정">
        <Icon name="setting_line_light" size={28} />
      </button>
    </header>
  );
}

/** 홈과 날짜별 모음이 함께 쓰는 하루 화면 (375×812 아트보드) */
export function MealDay({
  items,
  header,
  stamp = (p) => formatStamp(p.date, p.time),
  detailPath,
}: {
  items: Polaroid[];
  header?: ReactNode;
  /** 제목 위 날짜·시간 표기 (캘린더 날짜별 화면은 시간만) */
  stamp?: (p: Polaroid) => string;
  detailPath?: (id: string) => string;
}) {
  const [index, setIndex] = useState(0);
  const current = items[index] ?? items[0];

  return (
    <Artboard className="home">
      <div className="home__glow" aria-hidden="true">
        <span />
      </div>

      {header ?? <HomeHeader />}

      {current ? (
        <>
          <div className="home__title" key={current.id}>
            <span className="home__order">{ordinal(index)}</span>
            <p className="home__stamp">{stamp(current)}</p>
            <h1 className="home__name">{current.title}</h1>
          </div>

          <PolaroidStack items={items} onChange={setIndex} detailPath={detailPath} />

          {items.length > 1 && (
            <div className="home__indicator" aria-hidden="true">
              {items.map((p, i) => (
                <span key={p.id} className={i === index ? 'is-active' : ''} />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="home__empty">아직 기록된 식사가 없어요.</p>
      )}

      <TabBar inArtboard />
    </Artboard>
  );
}
