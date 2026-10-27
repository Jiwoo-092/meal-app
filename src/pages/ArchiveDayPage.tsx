import SubHeader from '../components/SubHeader';
import { CALENDAR_DAY_ITEMS } from '../data/mock';
import { formatTime, isValidDate } from '../data/utils';
import { goBack } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import { MealDay } from './HomePage';
import NotFoundPage from './NotFoundPage';

/**
 * 아카이브 · 날짜별 모음 — Figma 'archive: calendar2'
 * 홈과 같은 폴라로이드 화면, 헤더 가운데는 선택한 날짜(11.25), 제목 위에는 시간만.
 */
export default function ArchiveDayPage({ date }: { date: string }) {
  const { getById } = usePolaroids();
  if (!isValidDate(date)) return <NotFoundPage message="올바르지 않은 날짜예요." />;
  const items = CALENDAR_DAY_ITEMS.map(getById).filter((p) => p !== undefined);
  const title = `${date.slice(5, 7)}.${date.slice(8, 10)}`;

  return (
    <MealDay
      key={date}
      items={items}
      header={<SubHeader title={title} onBack={() => goBack('/archive/calendar')} />}
      stamp={(p) => formatTime(p.time)}
      detailPath={(id) => `/archive/polaroids/${id}`}
    />
  );
}
