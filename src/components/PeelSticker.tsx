import { useLayoutEffect, useRef, type CSSProperties } from 'react';

/**
 * 스티커 '착' 붙이기 모션 (레퍼런스 영상 기준)
 * 스티커 한 장이 반쯤 접힌 채(뒷면이 위) 놓였다가, 접힌 선이 왼쪽 끝으로 이동하며 펼쳐져 붙는다.
 * - 이미 붙은 부분: 앞면
 * - 아직 안 붙은 부분: 접힌 선을 기준으로 뒤집혀(좌우 반전) 붙은 면 위에 얹힌 '뒷면' — 같은 스티커의 뒤쪽이라 모양도 반전
 * 그래서 회색은 따로 먼저 붙은 게 아니라, 붙고 있는 스티커 자체의 뒷면으로 보인다.
 */
const DURATION = 620; // ms (스티커 1장)
const APPEAR_END = 0.16; // 접힌 스티커가 나타나는 구간
const SLIDE_FROM = 0.1; // 스티커 폭 대비 시작 위치(오른쪽)
const FOLD_FROM = 0.6; // 처음 접힌 선 위치(스티커 폭 대비) — 반쯤 접힌 채 놓여서 화면 밖으로 나가지 않게

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function PeelSticker({
  src,
  alt,
  style,
  delay = 0,
}: {
  src: string;
  alt: string;
  style: CSSProperties;
  /** 시작 지연(ms) — 스티커 2장을 차례로 */
  delay?: number;
}) {
  const wrap = useRef<HTMLSpanElement>(null);
  const front = useRef<HTMLImageElement>(null);
  const flapWrap = useRef<HTMLSpanElement>(null);
  const flap = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const w = wrap.current;
    const f = front.current;
    const fw = flapWrap.current;
    const fl = flap.current;
    if (!w || !f || !fw || !fl) return;

    const done = () => {
      w.style.transform = '';
      w.style.opacity = '';
      f.style.clipPath = '';
      f.style.webkitClipPath = '';
      fw.style.display = 'none';
    };
    if (reduceMotion()) {
      done();
      return;
    }

    const paint = (p: number) => {
      const W = w.offsetWidth || 1;
      const appear = Math.min(p / APPEAR_END, 1);
      const unfold = p <= APPEAR_END ? 0 : easeInOut((p - APPEAR_END) / (1 - APPEAR_END));
      // 접힌 선 위치(px, 스티커 왼쪽 기준): W → 0
      const fold = W * FOLD_FROM * (1 - unfold);

      w.style.opacity = String(Math.min(appear * 1.6, 1));
      w.style.transform = `translateX(${(1 - easeOut(appear)) * SLIDE_FROM * 100}%)`;

      // 붙은 앞면: 접힌 선 오른쪽
      f.style.clipPath = f.style.webkitClipPath = `inset(-20% -20% -20% ${fold}px)`;

      // 안 붙은 부분 [0, fold]를 접힌 선 기준으로 좌우 반전 → [fold, 2·fold]에 뒷면으로 얹힘
      fl.style.clipPath = fl.style.webkitClipPath = `inset(0 ${W - fold}px 0 0)`;
      fl.style.transformOrigin = `${fold}px 50%`;
      // 뒷면 음영: 접힌 선(말린 곳)은 밝게, 끝으로 갈수록 살짝 어둡게
      fl.style.background = `linear-gradient(90deg,
        #d3d4d8 0px,
        #e2e3e6 ${fold * 0.55}px,
        #f1f1f3 ${Math.max(fold - 9, 0)}px,
        #ffffff ${Math.max(fold - 3, 0)}px,
        #dcdde1 ${fold}px)`;
      fw.style.opacity = fold > 0.5 ? '1' : '0';
    };

    paint(0);
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start - delay) / DURATION, 1);
      if (p >= 0) paint(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else done();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [delay, src]);

  const mask: CSSProperties = {
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
  };

  return (
    <span ref={wrap} className="psticker" style={{ ...style, opacity: 0 }}>
      <img ref={front} className="psticker__front" src={src} alt={alt} draggable={false} />
      <span ref={flapWrap} className="psticker__flapwrap" aria-hidden="true">
        <span ref={flap} className="psticker__flap" style={mask} />
      </span>
    </span>
  );
}
