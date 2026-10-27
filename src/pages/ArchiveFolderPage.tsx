import Icon from '../components/Icon';
import SubHeader from '../components/SubHeader';
import TabBar from '../components/TabBar';
import { ARCHIVE_BY_KEYWORD, ARCHIVE_THUMB } from '../data/mock';
import { formatShortDate, formatTime12, getKeyword, isKeywordId } from '../data/utils';
import { ScrollArtboard } from '../lib/artboard';
import { goBack, Link } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

// 스티커 컴포넌트(98×110) → 상단 스티커(68×76)
const STICKER_SCALE = 68 / 98;

/** 아카이브 · 키워드 폴더 안 — Figma 'archive: keyword2' (스티커 + 폴라로이드 2열) */
export default function ArchiveFolderPage({ keyword }: { keyword: string }) {
  const { getById } = usePolaroids();
  if (!isKeywordId(keyword)) return <NotFoundPage message="없는 키워드 폴더예요." />;
  const k = getKeyword(keyword)!;
  const items = ARCHIVE_BY_KEYWORD[keyword].map(getById).filter((p) => p !== undefined);
  const s = STICKER_SCALE;

  return (
    <ScrollArtboard height={1111} className="archive" overlay={<TabBar inArtboard />}>
      <SubHeader word="keyword" onBack={() => goBack('/archive/folders')} />

      <img
        className="kfolder__sticker"
        src={k.sticker}
        alt={`${k.label} 키워드 스티커: ${k.name}`}
        draggable={false}
        style={{ left: 24 + k.art.dx * s, top: 100 + k.art.dy * s, width: k.art.w * s }}
      />
      <button type="button" className="kfolder__period">
        기간
        <Icon name="arrow_down_light" size={24} />
      </button>

      <ul className="kfolder__grid">
        {items.map((p) => (
          <li key={p.id}>
            <Link to={`/archive/polaroids/${p.id}`} className="kpolaroid" aria-label={`${p.title} 상세 보기`}>
              <span className="kpolaroid__card">
                <span className="kpolaroid__photo">
                  <img src={ARCHIVE_THUMB} alt="" draggable={false} />
                </span>
              </span>
              <span className="kpolaroid__meta">
                <span>{formatShortDate(p.date)}</span>
                <i aria-hidden="true" />
                <span>{formatTime12(p.time)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </ScrollArtboard>
  );
}
