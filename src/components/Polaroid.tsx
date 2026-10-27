import type { CSSProperties } from 'react';
import { MEAL_DESIGNS, type Polaroid as PolaroidData } from '../data/mock';
import { getKeyword } from '../data/utils';

/** 카드 톤 — Figma polaroid card home의 number 1/2/3 */
export type PolaroidTone = 'front' | 'back' | 'far';

interface Props {
  polaroid: PolaroidData;
  tone?: PolaroidTone;
  className?: string;
  style?: CSSProperties;
  /** 스티커 표시 여부 (키워드 목록 썸네일 등은 false) */
  stickers?: boolean;
}

// M 카드(238×345) 기준 좌표를 %로 변환
const CW = 238;
const CH = 345;
const pctX = (v: number) => `${(v / CW) * 100}%`;
const pctY = (v: number) => `${(v / CH) * 100}%`;

/**
 * 폴라로이드 카드 (사진 + 프레임 + 키워드 스티커)
 * 폭은 부모가 정하고 높이는 238:345 비율을 따른다. 스티커는 카드 크기에 비례해 배치된다.
 */
export default function Polaroid({ polaroid, tone = 'front', className = '', style, stickers = true }: Props) {
  const design = MEAL_DESIGNS[polaroid.design];
  return (
    <div className={`pcard pcard--${tone} ${className}`} style={style}>
      <div className="pcard__frame" aria-hidden="true" />
      <div className="pcard__body">
      <div className="pcard__photo">
        <img src={design.photo} alt={design.photoAlt} draggable={false} />
      </div>
      {stickers &&
        design.stickers.map((s) => {
          const k = getKeyword(s.keyword);
          if (!k) return null;
          const scale = s.w / 98;
          return (
            <img
              key={s.keyword}
              className="pcard__sticker"
              src={k.sticker}
              alt={`${k.label} 키워드 스티커: ${k.name}`}
              draggable={false}
              style={{
                left: pctX(s.x + k.art.dx * scale),
                top: pctY(s.y + k.art.dy * scale),
                width: pctX(k.art.w * scale),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
