import { IconBack, IconSetting } from '../components/Icons';
import { isValidDate } from '../data/utils';
import { goBack } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import { MealDay } from './HomePage';
import NotFoundPage from './NotFoundPage';

/** 아카이빙 · 날짜별 폴라로이드 모음 — 홈과 동일한 폴라로이드 UI */
export default function ArchiveDayPage({ date }: { date: string }) {
  const { polaroids } = usePolaroids();
  if (!isValidDate(date)) return <NotFoundPage message="올바르지 않은 날짜예요." />;
  const items = polaroids.filter((p) => p.date === date);

  return (
    <MealDay
      items={items}
      header={
        <header className="home-header">
          <button type="button" className="home-header__slot icon-btn-28" aria-label="뒤로 가기" onClick={() => goBack('/archive/calendar')}>
            <IconBack size={28} />
          </button>
          <img className="home-header__logo" src="/assets/logo.svg" alt="mealo" width={118} height={36} />
          <button type="button" className="home-header__slot icon-btn-28" aria-label="설정">
            <IconSetting size={28} />
          </button>
        </header>
      }
    />
  );
}
