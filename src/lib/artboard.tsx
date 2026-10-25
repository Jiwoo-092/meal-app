import { createContext, useContext, useLayoutEffect, useState, type CSSProperties, type ReactNode } from 'react';

/**
 * Figma 375×812 프레임을 화면에 '비율 그대로' 맞춰 보여주는 아트보드.
 *
 * - 디자인 좌표(px)를 그대로 쓰고, 전체를 한 번에 확대/축소한다 → 어떤 폰에서도 PNG로 본 것과 같은 비율.
 * - 상단 44px은 Figma의 상태바 자리. 브라우저/OS 상태바가 콘텐츠 밖에 있으면(일반 Safari, 홈 화면 앱 기본)
 *   이 영역을 잘라내고, 상태바 밑까지 콘텐츠가 깔리는 경우(safe-area-inset-top > 0)에는 그대로 둔다.
 */
export const ART_W = 375;
export const ART_H = 812;
export const STATUS_H = 44;

interface Fit {
  scale: number;
  left: number;
  top: number;
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
  const vw = window.visualViewport?.width ?? window.innerWidth;
  const vh = window.visualViewport?.height ?? window.innerHeight;
  const cut = readSafeTop() > 0 ? 0 : STATUS_H;
  const h = ART_H - cut;
  const scale = Math.min(vw / ART_W, vh / h);
  return {
    scale,
    left: (vw - ART_W * scale) / 2,
    top: (vh - h * scale) / 2 - cut * scale,
  };
}

export function Artboard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [fit, setFit] = useState<Fit>({ scale: 1, left: 0, top: -STATUS_H });

  useLayoutEffect(() => {
    const update = () => setFit(computeFit());
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    window.visualViewport?.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      window.visualViewport?.removeEventListener('resize', update);
    };
  }, []);

  const style: CSSProperties = {
    transform: `translate(${fit.left}px, ${fit.top}px) scale(${fit.scale})`,
  };

  return (
    <div className="screen">
      <div className={`artboard ${className}`} style={style}>
        <Ctx.Provider value={fit.scale}>{children}</Ctx.Provider>
      </div>
    </div>
  );
}
