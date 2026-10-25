import type { CSSProperties } from 'react';

/**
 * Figma 아이콘 (public/assets/icon/*.svg) — 마스크로 그려서 색은 currentColor를 따른다.
 * name: 파일명 (예: 'home_fill', 'box', 'lamp_light', 'setting_line_light')
 */
export default function Icon({ name, size = 24, className = '' }: { name: string; size?: number; className?: string }) {
  const url = `url("/assets/icon/${name}.svg")`;
  const style: CSSProperties = {
    width: size,
    height: size,
    WebkitMaskImage: url,
    maskImage: url,
  };
  return <span className={`icon ${className}`} style={style} aria-hidden="true" />;
}
