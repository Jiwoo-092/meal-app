import { Link } from '../lib/router';
import Icon from './Icon';

/** 아카이브 상단 탭 — Figma 'tab' (60×48 두 개, 간격 12): 왼쪽 키워드 폴더 · 오른쪽 캘린더 */
export default function ArchiveTabs({ active }: { active: 'keyword' | 'calendar' }) {
  const tabs = [
    { id: 'keyword', to: '/archive/folders', label: '키워드 아카이브', icon: 'card', on: 'card' },
    { id: 'calendar', to: '/archive/calendar', label: '캘린더', icon: 'calendar', on: 'calendar_fill' },
  ] as const;
  return (
    <nav className="archive-tabs" aria-label="아카이브 보기 전환">
      {tabs.map((t) => {
        const on = t.id === active;
        return (
          <Link
            key={t.id}
            to={t.to}
            replace
            className={`archive-tabs__tap${on ? ' is-active' : ''}`}
            aria-label={t.label}
            aria-current={on ? 'page' : undefined}
          >
            <Icon name={on ? t.on : t.icon} size={32} />
          </Link>
        );
      })}
    </nav>
  );
}
