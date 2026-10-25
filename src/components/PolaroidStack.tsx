import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import type { Polaroid as PolaroidData } from '../data/mock';
import { formatStamp } from '../data/utils';
import { useArtboardScale } from '../lib/artboard';
import { navigate } from '../lib/router';
import Polaroid, { type PolaroidTone } from './Polaroid';

/**
 * 홈 폴라로이드 스택 — Figma home / home-swipe 1~3
 *
 * - 앞 카드를 왼쪽으로 스와이프하면 카드가 화면 아래(지나간 카드 자리)로 내려가고
 *   뒤에 기울어져 있던 다음 카드가 똑바로 서며 앞으로 나온다. 끝까지 가면 처음으로 순환.
 * - 앞 카드를 탭하면 상세페이지로 이동.
 *
 * 좌표는 Figma 375×812 프레임에서 앞 카드(238×345) 중심 기준으로 측정한 값
 * (회전된 인스턴스의 바운딩 박스 중심 → 앞 카드 중심 차이).
 */

type Pose = { x: number; y: number; r: number; s: number; tone: PolaroidTone; z: number };

const POSE = {
  front: { x: 0, y: 0, r: 0, s: 1, tone: 'front', z: 30 },
  back1: { x: 0, y: 11, r: -14, s: 1, tone: 'back', z: 20 },
  back2: { x: 0, y: 19, r: -27, s: 0.903, tone: 'far', z: 10 },
} satisfies Record<string, Pose>;

/** 지나간 카드 자리 — Figma home-swipe: 카드 중심 (204.2, 852.5) = 앞 카드 중심 + (16.7, 453) */
const PILE = { x: 17, y: 453, r: -14, s: 0.903, tone: 'far', z: 5 } satisfies Pose;
const SWIPE_DISTANCE = 60; // px
const SWIPE_VELOCITY = 0.45; // px/ms
const TAP_SLOP = 6; // px

interface Props {
  items: PolaroidData[];
  /** 앞 카드가 바뀔 때 (제목·인디케이터 갱신용) */
  onChange?: (index: number) => void;
}

export default function PolaroidStack({ items, onChange }: Props) {
  const ids = items.map((p) => p.id);
  const [order, setOrder] = useState<string[]>(ids);
  const [pileId, setPileId] = useState<string | null>(null);
  const [drag, setDrag] = useState<{ dx: number; active: boolean }>({ dx: 0, active: false });
  const scale = useArtboardScale();
  const gesture = useRef<{ x: number; y: number; t: number; id: number; moved: boolean; axis: 'x' | 'y' | null } | null>(null);

  // 데이터가 바뀌면(다른 날짜 등) 스택 초기화
  const key = ids.join(',');
  useEffect(() => {
    setOrder(ids);
    setPileId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const i = items.findIndex((p) => p.id === order[0]);
    onChange?.(Math.max(0, i));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order[0]]);

  const canSwipe = order.length > 1;

  const [leavingId, setLeavingId] = useState<string | null>(null);
  const leaveTimer = useRef<number | undefined>(undefined);

  const advance = useCallback(() => {
    if (!canSwipe) return;
    const [first, ...rest] = order;
    const next = [...rest, first];
    setOrder(next);
    setPileId(next.length >= 3 ? first : null);
    // 내려가는 동안은 새 앞 카드보다 위에 보이도록
    setLeavingId(first);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => setLeavingId(null), 420);
  }, [canSwipe, order]);

  useEffect(() => () => window.clearTimeout(leaveTimer.current), []);

  const poseFor = (id: string): Pose & { hidden?: boolean } => {
    const k = order.indexOf(id);
    if (k === 0) return POSE.front;
    if (k === 1) return POSE.back1;
    if (id === pileId) return PILE;
    if (k === 2) return POSE.back2;
    return { ...POSE.back2, z: 1, hidden: true };
  };

  /* ---------- gesture ---------- */
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    gesture.current = { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId, moved: false, axis: null };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    // 화면 px → 디자인 px
    const dx = (e.clientX - g.x) / scale;
    const dy = (e.clientY - g.y) / scale;
    if (!g.axis && Math.hypot(dx, dy) > TAP_SLOP) {
      g.axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      g.moved = true;
      if (g.axis === 'x') e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (g.axis === 'x' && canSwipe) {
      // 오른쪽으로는 저항을 줘서 조금만 움직이게
      setDrag({ dx: dx > 0 ? dx * 0.25 : dx, active: true });
    }
  };

  const endGesture = (e: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || g.id !== e.pointerId) return;
    const dx = (e.clientX - g.x) / scale;
    const dt = Math.max(1, performance.now() - g.t);
    const v = dx / dt;

    if (!cancelled && !g.moved) {
      setDrag({ dx: 0, active: false });
      navigate(`/polaroids/${order[0]}`);
      return;
    }
    const commit = !cancelled && g.axis === 'x' && canSwipe && (dx < -SWIPE_DISTANCE || (v < -SWIPE_VELOCITY && dx < -15));
    setDrag({ dx: 0, active: false });
    if (commit) advance();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      navigate(`/polaroids/${order[0]}`);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      advance();
    }
  };

  const front = items.find((p) => p.id === order[0]);

  return (
    <div className="pstack">
      {items.map((p) => {
        const pose = poseFor(p.id);
        const isFront = p.id === order[0];
        const dragging = isFront && drag.active;
        const dx = isFront ? drag.dx : 0;
        const style = {
          '--x': `${pose.x + dx}px`,
          '--y': `${pose.y}px`,
          '--r': `${pose.r + dx * 0.05}deg`,
          '--s': pose.s,
          zIndex: p.id === leavingId ? 40 : pose.z,
          opacity: pose.hidden ? 0 : 1,
        } as CSSProperties;
        return (
          <div
            key={p.id}
            className={`pstack__card${dragging ? ' is-dragging' : ''}${p.id === pileId ? ' is-pile' : ''}`}
            style={style}
            aria-hidden={!isFront}
            {...(isFront
              ? {
                  role: 'button',
                  tabIndex: 0,
                  'aria-label': `${formatStamp(p.date, p.time)} ${p.title}. 탭하면 상세 보기${canSwipe ? ', 왼쪽으로 스와이프하면 다음 끼니' : ''}`,
                  onPointerDown,
                  onPointerMove,
                  onPointerUp: (e: PointerEvent<HTMLDivElement>) => endGesture(e),
                  onPointerCancel: (e: PointerEvent<HTMLDivElement>) => endGesture(e, true),
                  onKeyDown,
                }
              : {})}
          >
            <Polaroid polaroid={p} tone={pose.tone} />
          </div>
        );
      })}
      {/* 하단 블러: 뒤 카드·지나간 카드 위, 앞 카드 아래 */}
      <div className={`home__veil${pileId ? ' is-on' : ''}`} aria-hidden="true" />
      {front && <span className="sr-only" aria-live="polite">{`${formatStamp(front.date, front.time)} ${front.title}`}</span>}
    </div>
  );
}
