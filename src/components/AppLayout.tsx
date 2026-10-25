import type { ReactNode } from 'react';
import TabBar from './TabBar';

/** 공통 앱 셸. showNav=false 이면 탭바를 숨깁니다(편집 화면 등). */
export default function AppLayout({ showNav = true, children }: { showNav?: boolean; children: ReactNode }) {
  return (
    <div className="app">
      <main className={showNav ? 'app__main' : 'app__main app__main--no-nav'}>{children}</main>
      {showNav && <TabBar />}
    </div>
  );
}
