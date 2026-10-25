import type { ReactNode } from 'react';
import { goBack } from '../lib/router';
import { IconBack } from './Icons';

interface Props {
  title: string;
  /** 뒤로 가기 버튼 노출. 히스토리가 없으면(직접 URL 진입) fallback 경로로 이동 */
  back?: boolean;
  backFallback?: string;
  right?: ReactNode;
}

export default function TopBar({ title, back = false, backFallback = '/home', right }: Props) {
  return (
    <header className="top-bar">
      <div className="top-bar__slot">
        {back && (
          <button type="button" className="icon-btn" onClick={() => goBack(backFallback)} aria-label="뒤로 가기">
            <IconBack />
          </button>
        )}
      </div>
      <h1 className="top-bar__title">{title}</h1>
      <div className="top-bar__slot">{right}</div>
    </header>
  );
}
