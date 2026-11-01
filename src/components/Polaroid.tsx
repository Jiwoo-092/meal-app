import type { CSSProperties } from 'react';
import { MEAL_DESIGNS, type Polaroid as PolaroidData } from '../data/mock';
import { getKeyword } from '../data/utils';
import PeelSticker from './PeelSticker';

/** 카드 톤 — Figma polaroid card home의 number 1/2/3 */
export type PolaroidTone = 'front' | 'back' | 'far';

interface Props {
  polaroid: PolaroidData;
  tone?: PolaroidTone;
  className?: string;
  style?: CSSProperties;
  /** 스티커 표시 여부 (키워드 목록 썸네일 등은 false) */
  stickers?: boolean;
  /** 사진 아래 '자세히 보기 >' 안내 — 겹쳐진 폴라로이드(홈·날짜별 모음)에서 표시 */
  more?: boolean;
  /** 스티커를 '착' 붙이는 모션으로 등장 (상세 페이지) */
  peel?: boolean;
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
export default function Polaroid({ polaroid, tone = 'front', className = '', style, stickers = true, more = false, peel = false }: Props) {
  const design = MEAL_DESIGNS[polaroid.design];
  return (
    <div className={`pcard pcard--${tone} ${className}`} style={style}>
      <div className="pcard__frame" aria-hidden="true" />
      <div className="pcard__body">
      <div className="pcard__photo">
        <img src={design.photo} alt={design.photoAlt} draggable={false} />
      </div>
      {stickers &&
        design.stickers.map((s, i) => {
          const k = getKeyword(s.keyword);
          if (!k) return null;
          const scale = s.w / 98;
          const pos = {
            left: pctX(s.x + k.art.dx * scale),
            top: pctY(s.y + k.art.dy * scale),
            width: pctX(k.art.w * scale),
            aspectRatio: `${k.art.w} / ${k.art.h}`,
          };
          if (peel) {
            // 상세 진입 후 잠깐 쉬었다가 한 장씩 차례로
            return (
              <PeelSticker
                key={s.keyword}
                src={k.sticker}
                alt={`${k.label} 키워드 스티커: ${k.name}`}
                style={pos}
                delay={260 + i * 420}
              />
            );
          }
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
        {more && (
          <span className="pcard__more" aria-hidden="true">
            자세히 보기 &gt;
          </span>
        )}
      </div>
    </div>
  );
}
