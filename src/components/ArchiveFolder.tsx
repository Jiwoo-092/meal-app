import { FOLDER_TONES, type Keyword } from '../data/mock';
import { Link } from '../lib/router';

/**
 * 키워드 폴더 — Figma 'archive folder' (156×177)
 * 뒤 종이 2장 + 기울어진 폴라로이드가 반투명 폴더에 꽂혀 있고, 폴더 위에 그 키워드 스티커.
 */
const FOLDER_PATH =
  'M7.14725 114.945L4.50238 10.6775C4.40258 6.74327 7.56462 3.5 11.5001 3.5H83.6902C85.3857 3.5 87.0237 4.11543 88.2997 5.23197L100.341 15.768C101.617 16.8846 103.255 17.5 104.95 17.5H153.116C157.061 17.5 160.227 20.7581 160.113 24.7013L157.516 114.969C157.407 118.755 154.306 121.768 150.519 121.768H14.145C10.3482 121.768 7.24353 118.741 7.14725 114.945Z';

// 스티커 컴포넌트(98×110) → 폴더 위 스티커(68×76)
const STICKER_SCALE = 68 / 98;

export default function ArchiveFolder({ keyword }: { keyword: Keyword }) {
  const tone = FOLDER_TONES[keyword.id];
  const s = STICKER_SCALE;
  return (
    <Link to={`/archive/folders/${keyword.id}`} className="afolder" aria-label={`${keyword.label} 폴더`}>
      <div className="afolder__art" aria-hidden="true">
        <span className="afolder__paper afolder__paper--back" style={{ background: tone.back }} />
        <span className="afolder__paper afolder__paper--mid" style={{ background: tone.mid }} />
        <span className="afolder__card" style={{ background: tone.card }} />
        {/* 반투명 폴더: 뒤를 흐리게(배경 블러) + 면 + 테두리·그림자 */}
        <span className="afolder__blur" style={{ clipPath: `path('${FOLDER_PATH}')`, WebkitClipPath: `path('${FOLDER_PATH}')` }} />
        <svg className="afolder__shape" width="165" height="128" viewBox="0 0 165 128" fill="none">
          <defs>
            <filter id="afolder-shadow" x="-7.8" y="-8.8" width="180.216" height="142.868" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
              <feOffset dy="1" />
              <feGaussianBlur stdDeviation="2" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
              <feBlend mode="normal" in2="BackgroundImageFix" result="shadow" />
              <feBlend mode="normal" in="SourceGraphic" in2="shadow" result="shape" />
            </filter>
          </defs>
          <g filter="url(#afolder-shadow)">
            <path d={FOLDER_PATH} fill="#DEE0E6" fillOpacity="0.51" />
            <path d={FOLDER_PATH} stroke="#EBECEF" strokeLinecap="round" />
          </g>
        </svg>
        <img
          className="afolder__sticker"
          src={keyword.sticker}
          alt=""
          draggable={false}
          style={{ left: 78 + keyword.art.dx * s, top: 61 + keyword.art.dy * s, width: keyword.art.w * s }}
        />
      </div>
      <span className="afolder__label">{keyword.label}</span>
    </Link>
  );
}
