import { Link, usePathname } from '../lib/router';
import { IconCalendar, IconFolder } from './Icons';

/** 아카이빙 상단 캘린더 / 폴더 보기 전환 버튼 */
export default function ArchiveTabs() {
  const pathname = usePathname();
  const isFolder = pathname.startsWith('/archive/folders');
  return (
    <nav className="segmented" aria-label="아카이빙 보기 전환">
      <Link to="/archive/calendar" className="segmented__item" aria-current={!isFolder ? 'page' : undefined}>
        <IconCalendar />&nbsp;캘린더
      </Link>
      <Link to="/archive/folders" className="segmented__item" aria-current={isFolder ? 'page' : undefined}>
        <IconFolder />&nbsp;폴더
      </Link>
    </nav>
  );
}
