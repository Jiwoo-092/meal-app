import { createContext, useContext, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Figma 375×812 프레임을 화면에 '비율 그대로' 맞춰 보여주는 아트보드.
 *
 * - 디자인 좌표(px)를 그대로 쓰고, 전체를 한 번에 확대/축소한다 → 어떤 폰에서도 PNG로 본 것과 같은 비율.
 * - 상단 44px은 Figma의 상태바 자리. 브라우저/OS 상태바가 콘텐츠 밖에 있으면(일반 Safari, 홈 화면 앱 기본)
 *   이 영역을 잘라내고, 상태바 밑까지 콘텐츠가 깔리는 경우(safe-area-inset-top > 0)에는 그대로 둔다.
 * - 모든 화면이 같은 배율을 쓰므로 홈·상세 등에서 탭바·글자 크기가 동일하다.
 */
export const ART_W = 375;
export const ART_H = 812;
export const STATUS_H = 44;

interface Fit {
  scale: number;
  /** 배율을 정할 때 쓴 화면 높이 (스크롤 화면에서는 주소창이 줄어들어도 유지) */
  baseVh: number;
  /** 잘라낸 상단 높이 (디자인 px) */
  cut: number;
  vw: number;
  vh: number;
}

const Ctx = createContext<number>(1);
/** 현재 아트보드 배율 (포인터 이동량을 디자인 px로 환산할 때 사용) */
export const useArtboardScale = () => useContext(Ctx);

function readSafeTop(): number {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';
  document.body.appendChild(probe);
  const v = parseFloat(getComputedStyle(probe).paddingTop) || 0;
  probe.remove();
  return v;
}

function computeFit(): Fit {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cut = readSafeTop() > 0 ? 0 : STATUS_H;
  const scale = Math.min(vw / ART_W, vh / (ART_H - cut));
  return { scale, baseVh: vh, cut, vw, vh };
}

/**
 * stable: 폭이 그대로면 배율을 바꾸지 않는다 — 스크롤할 때 모바일 주소창이 접히며
 * 화면 높이가 바뀌어도 레이아웃이 출렁이지 않게.
 */
function useFit(stable = false): Fit {
  const [fit, setFit] = useState<Fit>(() =>
    typeof window === 'undefined' ? { scale: 1, baseVh: ART_H, cut: STATUS_H, vw: ART_W, vh: ART_H } : computeFit(),
  );
  useLayoutEffect(() => {
    const update = () =>
      setFit((prev) => {
        const next = computeFit();
        if (stable && Math.abs(next.vw - prev.vw) < 1) return { ...prev, vh: next.vh };
        return next;
      });
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return fit;
}

/** 기기 픽셀 단위로 반올림 — 반 픽셀 위치에 그려져 흐려지는 것 방지 */
function snap(v: number) {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(v * dpr) / dpr;
}

/**
 * 배율 적용 방식: transform: scale() 대신 CSS zoom.
 * scale()은 브라우저(특히 iOS Safari)가 원래 크기로 그린 그림을 늘려 붙여 글자·선이 흐려질 수 있지만,
 * zoom은 확대된 크기 그대로 다시 그려서 기기 해상도에 맞게 선명하다.
 */
function Board({
  x,
  y,
  scale,
  height,
  className,
  children,
}: {
  x: number;
  y: number;
  scale: number;
  height?: number;
  className: string;
  children: ReactNode;
}) {
  const place: CSSProperties = { transform: `translate(${snap(x)}px, ${snap(y)}px)` };
  const board: CSSProperties = { zoom: scale, ...(height ? { height } : null) };
  return (
    <div className="artboard-place" style={place}>
      <div className={`artboard ${className}`} style={board}>
        <Ctx.Provider value={scale}>{children}</Ctx.Provider>
      </div>
    </div>
  );
}

/** 한 화면(375×812)짜리 고정 아트보드 — 홈처럼 스크롤 없는 화면 */
export function Artboard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { scale, cut, vw, vh } = useFit();
  const h = ART_H - cut;
  return (
    <div className="screen">
      <Board x={(vw - ART_W * scale) / 2} y={(vh - h * scale) / 2 - cut * scale} scale={scale} className={className}>
        {children}
      </Board>
    </div>
  );
}

/**
 * 세로로 긴 프레임(예: 375×1111)을 같은 배율로 그리고 페이지 스크롤로 보는 아트보드.
 * overlay: 화면에 고정되는 요소(탭바 등) — 홈과 같은 위치·크기에 그려진다.
 */
export function ScrollArtboard({
  height,
  children,
  overlay,
  className = '',
}: {
  height: number;
  children: ReactNode;
  overlay?: ReactNode;
  className?: string;
}) {
  const { scale, baseVh, cut, vw, vh } = useFit(true);
  const h = height - cut;
  // 탭바 등 고정 요소: 홈과 같은 화면 아래 여백을 유지하며 화면 바닥 기준으로 배치
  const bottomGap = (baseVh - (ART_H - cut) * scale) / 2;
  const left = (vw - ART_W * scale) / 2;
  return (
    <div className="screen-scroll">
      <div className="screen-scroll__sizer" style={{ height: h * scale }}>
        <Board x={left} y={-cut * scale} scale={scale} height={height} className={`artboard--scroll ${className}`}>
          {children}
        </Board>
      </div>
      {overlay && (
        <div className="screen-overlay">
          <Board x={left} y={vh - bottomGap - ART_H * scale} scale={scale} className="artboard--overlay">
            {overlay}
          </Board>
        </div>
      )}
    </div>
  );
}
