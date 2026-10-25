import Icon from '../components/Icon';
import { isValidDate } from '../data/utils';
import { goBack } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import { HomeHeader, MealDay } from './HomePage';
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
        <HomeHeader
          left={
            <button type="button" className="icon-btn-28" aria-label="뒤로 가기" onClick={() => goBack('/archive/calendar')}>
              <Icon name="arrow_left_light" size={28} />
            </button>
          }
        />
      }
    />
  );
}
