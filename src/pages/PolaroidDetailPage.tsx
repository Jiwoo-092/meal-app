import PolaroidCard from '../components/PolaroidCard';
import TopBar from '../components/TopBar';
import { getKeyword } from '../data/utils';
import { Link } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

/** 폴라로이드 상세페이지 — 임시 레이아웃 (다음 단계에서 Figma 'polaroid detail'로 리빌드) */
export default function PolaroidDetailPage({ id }: { id: string }) {
  const { getById } = usePolaroids();
  const polaroid = getById(id);
  if (!polaroid) return <NotFoundPage message="폴라로이드를 찾을 수 없어요." />;

  return (
    <>
      <TopBar title="Archive" back backFallback="/home" />
      <article className="page detail">
        <PolaroidCard polaroid={polaroid} size="large" asStatic />

        <section aria-labelledby="kw-title">
          <h2 id="kw-title" className="section-title">획득한 키워드</h2>
          <ul className="chips">
            {polaroid.keywords.map((kid) => {
              const k = getKeyword(kid);
              if (!k) return null;
              return (
                <li key={kid}>
                  <Link to={`/archive/folders/${kid}`} className="chip">
                    {k.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="btn-row" style={{ marginTop: 0 }}>
          <Link to={`/polaroids/${polaroid.id}/title`} className="btn">
            타이틀 수정
          </Link>
          <Link to={`/polaroids/${polaroid.id}/edit`} className="btn btn--primary">
            수정하기
          </Link>
        </div>
      </article>
    </>
  );
}
