import { useEffect, type ReactNode } from 'react';
import AppLayout from './components/AppLayout';
import { matchPath, navigate, usePathname } from './lib/router';
import ArchiveCalendarPage from './pages/ArchiveCalendarPage';
import ArchiveDayPage from './pages/ArchiveDayPage';
import ArchiveFolderPage from './pages/ArchiveFolderPage';
import ArchiveFoldersPage from './pages/ArchiveFoldersPage';
import HomePage from './pages/HomePage';
import LightColorPage from './pages/LightColorPage';
import NotFoundPage from './pages/NotFoundPage';
import PolaroidDetailPage from './pages/PolaroidDetailPage';
import PolaroidEditPage from './pages/PolaroidEditPage';
import TitleEditPage from './pages/TitleEditPage';
import { LightProvider } from './store/LightStore';
import { PolaroidProvider } from './store/PolaroidStore';

type P = Record<string, string>;

/**
 * 라우팅 — MEALO_PROTOTYPE_SPEC.md §5 경로
 * layout: 'full' = 화면이 자체 레이아웃(홈 등), 'nav' = 공통 셸 + 탭바, 'plain' = 탭바 없음(편집)
 */
const ROUTES: { path: string; layout: 'full' | 'nav' | 'plain'; render: (p: P) => ReactNode }[] = [
  { path: '/home', layout: 'full', render: () => <HomePage /> },
  { path: '/polaroids/:id', layout: 'nav', render: (p) => <PolaroidDetailPage id={p.id} /> },
  { path: '/polaroids/:id/title', layout: 'plain', render: (p) => <TitleEditPage id={p.id} /> },
  { path: '/polaroids/:id/edit', layout: 'plain', render: (p) => <PolaroidEditPage id={p.id} /> },
  { path: '/archive/calendar', layout: 'nav', render: () => <ArchiveCalendarPage /> },
  { path: '/archive/days/:date', layout: 'full', render: (p) => <ArchiveDayPage date={p.date} /> },
  { path: '/archive/folders', layout: 'nav', render: () => <ArchiveFoldersPage /> },
  { path: '/archive/folders/:keyword', layout: 'nav', render: (p) => <ArchiveFolderPage keyword={p.keyword} /> },
  { path: '/light-color', layout: 'nav', render: () => <LightColorPage /> },
];

const REDIRECTS: Record<string, string> = { '/': '/home', '/archive': '/archive/calendar' };

function Router() {
  const pathname = usePathname().replace(/\/+$/, '') || '/';

  useEffect(() => {
    if (REDIRECTS[pathname]) navigate(REDIRECTS[pathname], { replace: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  if (REDIRECTS[pathname]) return null;

  for (const r of ROUTES) {
    const params = matchPath(r.path, pathname);
    if (!params) continue;
    const page = r.render(params);
    if (r.layout === 'full') return <>{page}</>;
    return <AppLayout showNav={r.layout === 'nav'}>{page}</AppLayout>;
  }
  return (
    <AppLayout>
      <NotFoundPage />
    </AppLayout>
  );
}

export default function App() {
  return (
    <PolaroidProvider>
      <LightProvider>
        <Router />
      </LightProvider>
    </PolaroidProvider>
  );
}
