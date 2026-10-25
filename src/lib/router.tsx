/**
 * 가벼운 History API 라우터 (react-router 대체)
 * - navigate / Link / usePathname / matchPath / canGoBack
 */
import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from 'react';

type Listener = () => void;
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', emit);
  // 첫 진입 엔트리에 idx 기록
  if (!(window.history.state && typeof window.history.state.idx === 'number')) {
    window.history.replaceState({ idx: 0 }, '');
  }
}

function currentIdx(): number {
  const s = window.history.state as { idx?: number } | null;
  return typeof s?.idx === 'number' ? s.idx : 0;
}

export function navigate(to: string, opts: { replace?: boolean } = {}) {
  if (to === window.location.pathname + window.location.search) return;
  if (opts.replace) window.history.replaceState({ idx: currentIdx() }, '', to);
  else window.history.pushState({ idx: currentIdx() + 1 }, '', to);
  emit();
}

/** 앱 안에서 이동해 온 기록이 있는지 (직접 URL 진입이면 false) */
export function canGoBack() {
  return currentIdx() > 0;
}

export function goBack(fallback: string) {
  if (canGoBack()) window.history.back();
  else navigate(fallback, { replace: true });
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePathname() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '/',
  );
}

/** '/polaroids/:id' 형태 패턴 매칭. 일치하지 않으면 null */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { to: string; replace?: boolean };

export function Link({ to, replace, onClick, ...rest }: LinkProps) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(to, { replace });
  };
  return <a href={to} onClick={handle} {...rest} />;
}
