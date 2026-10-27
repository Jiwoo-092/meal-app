import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { Polaroid as PolaroidData } from '../data/mock';
import { formatStamp } from '../data/utils';
import { useArtboardScale } from '../lib/artboard';
import { navigate } from '../lib/router';
import Polaroid, { type PolaroidTone } from './Polaroid';

/**
 * 홈 폴라로이드 스택 — Figma home / home-swipe 1~3
 *
 * - 왼쪽·오른쪽 어느 쪽으로 스와이프해도 앞 카드가 그 방향으로 호를 그리며 빠져나갔다가
 *   스택 맨 뒤로 들어가고, 뒤 카드가 똑바로 서며 앞으로 나온다. (무한 순환)
 * - 앞 카드를 탭하면 상세페이지로 이동.
 * - 전시용 안정성: 제스처는 카드가 아니라 스택 영역 전체에서 받는다(움직이는 카드에 손이 닿아도 동작).
 *   애니메이션 중에도 바로 다음 스와이프가 가능하고, 브라우저 제스처(스크롤·뒤로가기 등)가 끼어들지 않게 막는다.
 *
 * 좌표는 Figma 375×812 프레임에서 앞 카드(238×345) 중심 기준.
 */

type Pose = { x: number; y: number; r: number; s: number; tone: PolaroidTone; z: number };

const POSE = {
  front: { x: 0, y: 0, r: 0, s: 1, tone: 'front', z: 30 },
  back1: { x: 0, y: 11, r: -14, s: 1, tone: 'back', z: 20 },
  back2: { x: 0, y: 19, r: -27, s: 0.903, tone: 'far', z: 10 },
} satisfies Record<string, Pose>;

const SWIPE_DISTANCE = 50; // px(디자인 기준) 이상 밀면 넘김
const SWIPE_VELOCITY = 0.35; // px/ms 이상으로 튕기면 넘김
const TAP_SLOP = 8; // px 이하 움직임은 탭

/** 맨 뒤로 들어가는 모션 */
const TUCK_MS = 720;
const TUCK_SWING = 230; // 옆으로 빠지는 거리(px)
/** 처음엔 빠르게 빠지고 뒤로 들어가며 부드럽게 감속 (중간에 멈추는 구간 없음) */
const tuckEase = (t: number) => 1 - Math.pow(1 - t, 1.8);
/** 카드가 가장 바깥(뒤로 넘어가는 지점)에 도달하는 시간 비율 */
const TUCK_TURN = 1 - Math.pow(0.5, 1 / 1.8);

/**
 * 앞 카드 → 옆으로 크게 호를 그리며 → 스택 맨 뒤 자리. dir: -1 왼쪽, +1 오른쪽
 * 하나의 연속 곡선을 샘플링해 키프레임으로 만든다.
 */
function tuckKeyframes(fx: number, fr: number, to: Pose, dir: number): Keyframe[] {
  const N = 24;
  const frames: Keyframe[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const p = tuckEase(t);
    const arc = Math.sin(Math.PI * p);
    const x = fx + (to.x - fx) * p + dir * TUCK_SWING * arc;
    const y = to.y * p + 6 * arc;
    const r = fr + (to.r - fr) * p + dir * 4 * arc;
    const s = 1 + (to.s - 1) * p - 0.03 * arc;
    frames.push({
      offset: t,
      transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`,
      zIndex: p < 0.5 ? 40 : 1,
    });
  }
  return frames;
}

interface Props {
  items: PolaroidData[];
  /** 앞 카드가 바뀔 때 (제목·인디케이터 갱신용) */
  onChange?: (index: number) => void;
}

type Gesture = {
  id: number;
  x: number;
  y: number;
  lastX: number;
  lastT: number;
  vx: number;
  moved: boolean;
  axis: 'x' | 'y' | null;
  /** 누른 위치가 앞 카드 위였는지 (브라우저 hit-test 결과) */
  onCard: boolean;
};

export default function PolaroidStack({ items, onChange }: Props) {
  const ids = items.map((p) => p.id);
  const [order, setOrder] = useState<string[]>(ids);
  const [drag, setDrag] = useState<{ dx: number; active: boolean }>({ dx: 0, active: false });
  /** 맨 뒤로 들어가는 중인 카드들 (behind: 뒤로 넘어간 뒤 → 뒤 카드 톤) */
  const [tucks, setTucks] = useState<Record<string, { behind: boolean }>>({});
  const scale = useArtboardScale();
  const gesture = useRef<Gesture | null>(null);
  const cardEls = useRef(new Map<string, HTMLDivElement>());
  const timers = useRef(new Map<string, number[]>());
  const orderRef = useRef(order);
  orderRef.current = order;

  // 데이터가 바뀌면(다른 날짜 등) 스택 초기화
  const key = ids.join(',');
  useEffect(() => {
    setOrder(ids);
    setTucks({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const i = items.findIndex((p) => p.id === order[0]);
    onChange?.(Math.max(0, i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order[0]]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((list) => list.forEach((id) => window.clearTimeout(id)));
  }, []);

  const clearTimers = (id: string) => {
    timers.current.get(id)?.forEach((t) => window.clearTimeout(t));
    timers.current.delete(id);
  };

  const dropTuck = (id: string) =>
    setTucks((t) => {
      if (!(id in t)) return t;
      const n = { ...t };
      delete n[id];
      return n;
    });

  /** 앞 카드를 맨 뒤로. dir: -1 왼쪽, +1 오른쪽. 언제 호출해도(애니메이션 중이어도) 안전 */
  const advance = useCallback((dir: number, fromDx = 0) => {
    const cur = orderRef.current;
    if (cur.length < 2) return;
    const [first, ...rest] = cur;
    const next = [...rest, first];
    orderRef.current = next;
    setOrder(next);

    // 새로 앞에 오는 카드가 아직 뒤로 들어가는 중이었다면 그 모션은 끝내고 앞 자리로
    const newFront = next[0];
    if (newFront !== first) {
      cardEls.current.get(newFront)?.getAnimations().forEach((a) => a.cancel());
      clearTimers(newFront);
      dropTuck(newFront);
    }

    const el = cardEls.current.get(first);
    el?.getAnimations().forEach((a) => a.cancel());
    clearTimers(first);
    const to = next.length >= 3 ? POSE.back2 : POSE.back1;
    el?.animate(tuckKeyframes(fromDx, fromDx * 0.05, to, dir), { duration: TUCK_MS, easing: 'linear' });
    setTucks((t) => ({ ...t, [first]: { behind: false } }));
    timers.current.set(first, [
      // 뒤로 넘어가는 순간부터 뒤 카드 톤 → 착지 후 색이 다시 변하지 않게
      window.setTimeout(() => setTucks((t) => (t[first] ? { ...t, [first]: { behind: true } } : t)), TUCK_MS * TUCK_TURN),
      window.setTimeout(() => {
        dropTuck(first);
        timers.current.delete(first);
      }, TUCK_MS + 40),
    ]);
  }, []);

  const poseFor = (id: string): Pose & { hidden?: boolean } => {
    const k = order.indexOf(id);
    if (k === 0) return POSE.front;
    if (k === 1) return POSE.back1;
    if (k === 2) return POSE.back2;
    return { ...POSE.back2, z: 1, hidden: true };
  };

  /* ---------- gesture (스택 영역 전체) ---------- */
  const canSwipe = order.length > 1;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (gesture.current && gesture.current.id !== e.pointerId) return; // 두 번째 손가락 무시
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    const now = performance.now();
    // 앞 카드 위인지는 좌표 계산 대신 브라우저 hit-test(e.target)로 판단 — 화면 배율(zoom)과 무관하게 정확
    const onCard = (e.target as Element).classList?.contains('pstack__tapzone') ?? false;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, lastT: now, vx: 0, moved: false, axis: null, onCard };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = (e.clientX - g.x) / scale; // 화면 px → 디자인 px
    const dy = (e.clientY - g.y) / scale;
    const now = performance.now();
    const dt = Math.max(1, now - g.lastT);
    g.vx = g.vx * 0.6 + ((e.clientX - g.lastX) / scale / dt) * 0.4;
    g.lastX = e.clientX;
    g.lastT = now;
    if (!g.axis && Math.hypot(dx, dy) > TAP_SLOP) {
      // 대각선이어도 가로 성분이 있으면 스와이프로 본다
      g.axis = Math.abs(dx) >= Math.abs(dy) * 0.6 ? 'x' : 'y';
      g.moved = true;
    }
    if (g.axis === 'x' && canSwipe) setDrag({ dx, active: true });
  };

  const finish = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    const dx = (e.clientX - g.x) / scale;
    setDrag({ dx: 0, active: false });

    if (!cancelled && !g.moved) {
      // 탭: 앞 카드 위였을 때만 상세로
      if (g.onCard) navigate(`/polaroids/${orderRef.current[0]}`);
      return;
    }
    if (g.axis !== 'x' || !canSwipe) return;
    const flick = Math.abs(g.vx) > SWIPE_VELOCITY && Math.abs(dx) > 12 && Math.sign(g.vx) === Math.sign(dx);
    // 취소(pointercancel)여도 충분히 밀었으면 넘긴다
    if (Math.abs(dx) > SWIPE_DISTANCE || (!cancelled && flick)) advance(dx < 0 ? -1 : 1, dx);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/polaroids/${orderRef.current[0]}`);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      advance(-1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      advance(1);
    }
  };

  const front = items.find((p) => p.id === order[0]);

  return (
    <div className="pstack">
      {items.map((p) => {
        const pose = poseFor(p.id);
        const isFront = p.id === order[0];
        const tuck = tucks[p.id];
        const dragging = isFront && drag.active;
        const dx = isFront ? drag.dx : 0;
        const style = {
          '--x': `${pose.x + dx}px`,
          '--y': `${pose.y}px`,
          '--r': `${pose.r + dx * 0.05}deg`,
          '--s': pose.s,
          zIndex: pose.z,
          opacity: pose.hidden ? 0 : 1,
        } as CSSProperties;
        return (
          <div
            key={p.id}
            ref={(el) => {
              if (el) cardEls.current.set(p.id, el);
              else cardEls.current.delete(p.id);
            }}
            className={`pstack__card${dragging ? ' is-dragging' : ''}${tuck ? ' is-tucking' : ''}`}
            style={style}
            aria-hidden="true"
          >
            <Polaroid polaroid={p} tone={tuck && !tuck.behind ? 'front' : pose.tone} />
          </div>
        );
      })}

      {/* 제스처 영역: 카드 위아래 여백까지 넓게, 카드보다 위에 */}
      <div
        className="pstack__hit"
        role="button"
        tabIndex={0}
        aria-label={front ? `${formatStamp(front.date, front.time)} ${front.title}. 탭하면 상세 보기${canSwipe ? ', 좌우로 스와이프하면 다음 끼니' : ''}` : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(e) => finish(e, false)}
        onPointerCancel={(e) => finish(e, true)}
        onLostPointerCapture={(e) => finish(e, true)}
        onKeyDown={onKeyDown}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* 앞 카드 자리 — 탭 판정용 */}
        <div className="pstack__tapzone" aria-hidden="true" />
      </div>
      {front && <span className="sr-only" aria-live="polite">{`${formatStamp(front.date, front.time)} ${front.title}`}</span>}
    </div>
  );
}
