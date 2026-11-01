import { useLayoutEffect, useRef, type CSSProperties } from 'react';

/**
 * 스티커 '착' 붙이기 모션 (레퍼런스 영상 기준)
 * 1) 스티커 뒷면(회색)이 오른쪽에서 살짝 미끄러져 들어오고
 * 2) 오른쪽 끝부터 왼쪽으로 접힌 선이 지나가며 앞면이 붙는다 — 아직 안 붙은 왼쪽은 뒷면, 접힌 선엔 말린 하이라이트·그림자.
 * 뒷면·하이라이트는 스티커 이미지 자체를 마스크로 써서 스티커 모양 그대로 보인다.
 */
const DURATION = 640; // ms (스티커 1장)
const SLIDE_END = 0.3; // 이 비율까지 뒷면이 미끄러져 들어옴, 이후 붙기
const SLIDE_FROM = 0.45; // 스티커 폭 대비 시작 위치

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
  const back = useRef<HTMLSpanElement>(null);
  const curl = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const w = wrap.current;
    const f = front.current;
    const b = back.current;
    const c = curl.current;
    if (!w || !f || !b || !c) return;

    const done = () => {
      w.style.transform = '';
      w.style.opacity = '';
      f.style.clipPath = '';
      f.style.webkitClipPath = '';
      b.style.display = 'none';
      c.style.display = 'none';
    };
    if (reduceMotion()) {
      done();
      return;
    }

    // fold: 접힌 선 위치(0 = 왼쪽 끝, 1 = 오른쪽 끝). 1 → 0으로 이동하며 앞면이 드러남
    const paint = (p: number) => {
      const slide = Math.min(p / SLIDE_END, 1);
      const peel = p <= SLIDE_END ? 0 : easeInOut((p - SLIDE_END) / (1 - SLIDE_END));
      const fold = 1 - peel;
      const width = w.offsetWidth || 1;
      const px = fold * width;

      w.style.opacity = String(Math.min(slide * 2.2, 1));
      w.style.transform = `translateX(${(1 - easeOut(slide)) * SLIDE_FROM * 100}%)`;

      const rightHidden = `${(1 - fold) * 100}%`;
      const leftHidden = `${fold * 100}%`;
      f.style.clipPath = f.style.webkitClipPath = `inset(-20% -20% -20% ${leftHidden})`;
      b.style.clipPath = b.style.webkitClipPath = `inset(-12% ${rightHidden} -12% -12%)`;
      // 접힌 선: 바로 왼쪽은 말려 올라간 밝은 면, 오른쪽엔 붙은 면 위로 얇은 그림자
      c.style.background = `linear-gradient(90deg,
        rgba(255,255,255,0) ${px - 14}px,
        rgba(255,255,255,0.95) ${px - 5}px,
        rgba(214,214,218,1) ${px - 1}px,
        rgba(0,0,0,0.16) ${px}px,
        rgba(0,0,0,0) ${px + 7}px)`;
      c.style.opacity = fold > 0.002 && fold < 0.998 ? '1' : '0';
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
      <span ref={back} className="psticker__backwrap" aria-hidden="true">
        <span className="psticker__back" style={mask} />
      </span>
      <span ref={curl} className="psticker__curl" style={mask} aria-hidden="true" />
    </span>
  );
}
