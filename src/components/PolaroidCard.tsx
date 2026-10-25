import type { Polaroid as PolaroidData } from '../data/mock';
import { formatStamp } from '../data/utils';
import { Link } from '../lib/router';
import Polaroid from './Polaroid';

interface Props {
  polaroid: PolaroidData;
  size?: 'default' | 'large';
  asStatic?: boolean;
}

/** 목록·상세에서 쓰는 폴라로이드 (임시 레이아웃 — Figma 화면 리빌드 시 교체) */
export default function PolaroidCard({ polaroid, size = 'default', asStatic = false }: Props) {
  const body = (
    <>
      <Polaroid polaroid={polaroid} stickers={size === 'large'} />
      <p className="polaroid__title">{polaroid.title}</p>
      <p className="polaroid__meta">{formatStamp(polaroid.date, polaroid.time)}</p>
    </>
  );
  const className = size === 'large' ? 'polaroid-item polaroid-item--large' : 'polaroid-item';
  if (asStatic) return <div className={className}>{body}</div>;
  return (
    <Link to={`/polaroids/${polaroid.id}`} className={className}>
      {body}
    </Link>
  );
}
