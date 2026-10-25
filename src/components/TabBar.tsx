import { Link, usePathname } from '../lib/router';
import { IconArchive, IconHome, IconLight } from './Icons';

/**
 * 하단 플로팅 탭바 — Figma 'tab bar' (196×60, bottom 25)
 * TODO: 아이콘은 임시. Figma 아이콘 SVG(line/fill) 전달되면 교체.
 */
const TABS = [
  { to: '/archive/calendar', label: '아카이빙', Icon: IconArchive, match: ['/archive'] },
  { to: '/home', label: '홈', Icon: IconHome, match: ['/home', '/polaroids'] },
  { to: '/light-color', label: '전등 컬러', Icon: IconLight, match: ['/light-color'] },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar" aria-label="주요 메뉴">
      {TABS.map(({ to, label, Icon, match }) => {
        const active = match.some((m) => pathname.startsWith(m));
        return (
          <Link key={to} to={to} className="tabbar__tap" aria-label={label} aria-current={active ? 'page' : undefined}>
            <Icon size={28} />
          </Link>
        );
      })}
    </nav>
  );
}
