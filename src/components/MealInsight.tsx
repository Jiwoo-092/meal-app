import { useEffect, useRef, useState } from 'react';
import { AVG_MINUTES, MESSAGE_BOX, TEMPO_LABEL, type Polaroid, type Tempo } from '../data/mock';

/**
 * 밀로 인사이트 — Figma 'mealo insight' (327×256)
 * 말풍선 + 식사 템포(tempo) + 식사 시간(time) 카드.
 * 화면에 보이면 게이지가 차오르고 숫자가 올라간다 (참고 영상 모션).
 * 게이지 모양은 Figma 컴포넌트(tempo slow/stable/fast, time)의 호 데이터를 그대로 옮김.
 */

/* ---------------- 공통: 화면에 보이면 0→1 진행 ---------------- */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

function useInViewProgress(duration: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState(0); // 경과 ms
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setStarted(true);
      setT(duration);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [duration]);

  useEffect(() => {
    if (!started || t >= duration) return;
    let raf = 0;
    const t0 = performance.now() - t;
    const tick = (now: number) => {
      const e = Math.min(duration, now - t0);
      setT(e);
      if (e < duration) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  return { ref, t, started };
}

/** delay(ms) 후 dur(ms) 동안 0→1 (easeOut) */
const phase = (t: number, delay: number, dur: number) => easeOut(clamp01((t - delay) / dur));

/* ---------------- SVG 도형 ---------------- */
const rad = (deg: number) => (deg * Math.PI) / 180;
const pt = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))] as const;

/** 중심선 호 (시계방향, 화면 좌표 각도) */
function arcPath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = pt(cx, cy, r, a0);
  const [x1, y1] = pt(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

/**
 * 모서리가 둥근 도넛 조각 (Figma 호 + corner radius).
 * cr만큼 안쪽으로 줄인 조각을 그린 뒤 2cr 두께 round-join 테두리로 감싸면 정확히 반경 cr의 모서리가 된다.
 */
function sectorPath(cx: number, cy: number, R: number, r: number, a0: number, a1: number, cr: number) {
  const Ro = R - cr;
  const Ri = r + cr;
  const dO = (cr / Ro) * (180 / Math.PI);
  const dI = (cr / Ri) * (180 / Math.PI);
  const [ox0, oy0] = pt(cx, cy, Ro, a0 + dO);
  const [ox1, oy1] = pt(cx, cy, Ro, a1 - dO);
  const [ix1, iy1] = pt(cx, cy, Ri, a1 - dI);
  const [ix0, iy0] = pt(cx, cy, Ri, a0 + dI);
  const large = a1 - a0 > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return `M${f(ox0)} ${f(oy0)}A${Ro} ${Ro} 0 ${large} 1 ${f(ox1)} ${f(oy1)}L${f(ix1)} ${f(iy1)}A${Ri} ${Ri} 0 ${large} 0 ${f(ix0)} ${f(iy0)}Z`;
}

/* ---------------- 식사 템포 ---------------- */
// Figma tempo: 중심 (77.5, 86.5), 바깥 반지름 61.22, 안쪽 48.23, 세 조각 각 81°, 모서리 4
const T = { cx: 77.5, cy: 86.5, R: 61.22, r: 48.23, mid: 54.72, cr: 4 };
const SEG = {
  left: [142.81, 223.83],
  top: [228.78, 309.81],
  right: [316.17, 397.19],
} as const;
const LEVEL_END: Record<Tempo, number> = { slow: SEG.left[1], stable: SEG.top[1], fast: SEG.right[1] };

function gradientLine(a0: number, a1: number) {
  const [x1, y1] = pt(T.cx, T.cy, T.mid, a0);
  const [x2, y2] = pt(T.cx, T.cy, T.mid, a1);
  return { x1, y1, x2, y2 };
}

function TempoCard({ tempo, t, uid }: { tempo: Tempo; t: number; uid: string }) {
  const fill = phase(t, 150, 1500);
  const sweepEnd = SEG.left[0] + (LEVEL_END[tempo] - SEG.left[0]) * fill;
  const label = TEMPO_LABEL[tempo];
  const shown = Math.round(label.length * phase(t, 700, 600));
  const sector = (a: readonly [number, number]) => sectorPath(T.cx, T.cy, T.R, T.r, a[0], a[1], T.cr);
  const id = (n: string) => `${uid}-${n}`;

  return (
    <div className="insight-card">
      <svg className="insight-card__gauge" width="155" height="147" viewBox="0 0 155 147" aria-hidden="true">
        <defs>
          <linearGradient id={id('l')} gradientUnits="userSpaceOnUse" {...gradientLine(SEG.left[0], SEG.left[1])}>
            <stop offset="0" stopColor="#FFD9A7" />
            <stop offset="1" stopColor="#FFCC33" />
          </linearGradient>
          <linearGradient id={id('t')} gradientUnits="userSpaceOnUse" {...gradientLine(SEG.top[0], SEG.top[1])}>
            <stop offset="0" stopColor="#FFD557" />
            <stop offset="0.66" stopColor="#FF852E" />
          </linearGradient>
          <linearGradient id={id('tg')} gradientUnits="userSpaceOnUse" {...gradientLine(SEG.top[0], SEG.top[1])}>
            <stop offset="0" stopColor="#E8E8E8" />
            <stop offset="0.66" stopColor="#EBEBEB" />
          </linearGradient>
          <linearGradient id={id('r')} gradientUnits="userSpaceOnUse" {...gradientLine(SEG.right[0], SEG.right[1])}>
            <stop offset="0" stopColor="#FF852E" />
            <stop offset="1" stopColor="#FF5931" />
          </linearGradient>
          <linearGradient id={id('rg')} gradientUnits="userSpaceOnUse" {...gradientLine(SEG.right[0], SEG.right[1])}>
            <stop offset="0" stopColor="#EEEDED" />
            <stop offset="1" stopColor="#D4D4D4" />
          </linearGradient>
          <mask id={id('m')} maskUnits="userSpaceOnUse" x="0" y="0" width="155" height="147">
            {fill > 0 && (
              <path d={arcPath(T.cx, T.cy, T.mid, SEG.left[0] - 2, sweepEnd)} stroke="#fff" strokeWidth="20" fill="none" />
            )}
          </mask>
        </defs>

        {/* 트랙 (회색) */}
        <g opacity="0.8" strokeLinejoin="round" strokeWidth={T.cr * 2}>
          <path d={sector(SEG.top)} fill={`url(#${id('tg')})`} stroke={`url(#${id('tg')})`} />
          <path d={sector(SEG.right)} fill={`url(#${id('rg')})`} stroke={`url(#${id('rg')})`} />
        </g>
        {/* 채워지는 값 */}
        <g opacity="0.8" strokeLinejoin="round" strokeWidth={T.cr * 2} mask={`url(#${id('m')})`}>
          <path d={sector(SEG.left)} fill={`url(#${id('l')})`} stroke={`url(#${id('l')})`} />
          {tempo !== 'slow' && <path d={sector(SEG.top)} fill={`url(#${id('t')})`} stroke={`url(#${id('t')})`} />}
          {tempo === 'fast' && <path d={sector(SEG.right)} fill={`url(#${id('r')})`} stroke={`url(#${id('r')})`} />}
        </g>
      </svg>
      <p className="insight-card__caption insight-card__caption--tempo">식사 템포</p>
      <p className="insight-card__value insight-card__value--tempo" aria-label={label}>
        <span aria-hidden="true">{label.slice(0, shown)}</span>
        <span className="insight-card__ghost" aria-hidden="true">{label.slice(shown)}</span>
      </p>
    </div>
  );
}

/* ---------------- 식사 시간 ---------------- */
// Figma time: 중심 (77.45, 74.5). 주황 호 반지름 54.72·두께 13, 파란 평균 호 반지름 43.36·두께 10.3, 끝이 둥근 호
const C = { cx: 77.45, cy: 74.5, rO: 54.72, wO: 12.99, rB: 43.36, wB: 10.28 };
const MIN_PER_TURN = 63; // 42분 = 240° (Figma)
const START = 268.6; // 12시 방향에서 시작해 시계방향

function roundArc(r: number, w: number, sweep: number) {
  // 둥근 끝이 호 안쪽에 들어오도록 양 끝을 반 두께만큼 줄임 (Figma corner radius 방식)
  const inset = (w / 2 / r) * (180 / Math.PI);
  const a0 = START + inset;
  const a1 = START + Math.max(sweep - inset, inset + 0.01);
  return arcPath(C.cx, C.cy, r, a0, a1);
}

function TimeCard({ minutes, t, uid }: { minutes: number; t: number; uid: string }) {
  const avgSweep = Math.min(359, (AVG_MINUTES / MIN_PER_TURN) * 360);
  const sweep = Math.min(359, (minutes / MIN_PER_TURN) * 360);
  const pAvg = phase(t, 0, 900);
  const p = phase(t, 250, 1600);
  const n = Math.round(minutes * p);
  const id = (k: string) => `${uid}-${k}`;
  const orange = roundArc(C.rO, C.wO, sweep);
  const blue = roundArc(C.rB, C.wB, avgSweep);
  const [gx1, gy1] = pt(C.cx, C.cy, C.rO, START + 20);
  const [gx2, gy2] = pt(C.cx, C.cy, C.rO, START + Math.max(sweep - 20, 60));

  return (
    <div className="insight-card">
      <svg className="insight-card__gauge" width="155" height="147" viewBox="0 0 155 147" aria-hidden="true">
        <defs>
          <linearGradient id={id('o')} gradientUnits="userSpaceOnUse" x1={gx1} y1={gy1} x2={gx2} y2={gy2}>
            <stop offset="0" stopColor="#FFD557" />
            <stop offset="1" stopColor="#FF852E" />
          </linearGradient>
          <linearGradient id={id('b')} gradientUnits="userSpaceOnUse" x1={C.cx} y1={C.cy - C.rB} x2={C.cx} y2={C.cy + C.rB}>
            <stop offset="0" stopColor="#D6E0FF" />
            <stop offset="1" stopColor="#B0C4FF" />
          </linearGradient>
        </defs>
        {t > 0 && (
          <>
            <path
              d={blue}
              pathLength={1}
              stroke={`url(#${id('b')})`}
              strokeWidth={C.wB}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${pAvg} 2`}
            />
            {t > 250 && (
              <path
                d={orange}
                pathLength={1}
                stroke={`url(#${id('o')})`}
                strokeWidth={C.wO}
                strokeLinecap="round"
                fill="none"
                opacity="0.8"
                strokeDasharray={`${p} 2`}
              />
            )}
          </>
        )}
      </svg>
      <span className="insight-card__legend-dot" aria-hidden="true" />
      <p className="insight-card__legend">평균</p>
      <div className="insight-card__center">
        <p className="insight-card__caption">식사 시간</p>
        <p className="insight-card__value" aria-label={`${minutes}분`}>
          <span aria-hidden="true">{n}분</span>
        </p>
      </div>
    </div>
  );
}

/* ---------------- 말풍선 ---------------- */
function Message({ polaroid, t }: { polaroid: Polaroid; t: number }) {
  const box = MESSAGE_BOX[polaroid.design];
  const o = phase(t, 0, 500);
  return (
    <div className="insight-msg" style={{ opacity: o, transform: `translateY(${(1 - o) * 8}px)` }}>
      <img className="insight-msg__character" src="/assets/mealo-character.svg" alt="밀로" width={90} height={90} />
      <div className="insight-msg__bubble">
        <p className="insight-msg__text" style={{ left: box.left, top: box.top, width: box.width }}>
          {polaroid.message.map((line, i) => (
            <span key={i} className="insight-msg__line">
              {line.map((part, j) =>
                typeof part === 'string' ? (
                  <span key={j}>{part}</span>
                ) : (
                  <mark key={j} style={{ background: part.bg, color: part.color ?? 'inherit' }}>
                    {part.text}
                  </mark>
                ),
              )}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function MealInsight({ polaroid }: { polaroid: Polaroid }) {
  const msg = useInViewProgress(500);
  const cards = useInViewProgress(1900);
  const uid = `g-${polaroid.id}`;
  return (
    <section className="insight" aria-label="밀로 인사이트">
      <div ref={msg.ref}>
        <Message polaroid={polaroid} t={msg.t} />
      </div>
      <div className="insight__cards" ref={cards.ref}>
        <TempoCard tempo={polaroid.tempo} t={cards.t} uid={`${uid}-tempo`} />
        <TimeCard minutes={polaroid.minutes} t={cards.t} uid={`${uid}-time`} />
      </div>
    </section>
  );
}
