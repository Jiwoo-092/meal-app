import TopBar from '../components/TopBar';
import { formatStamp } from '../data/utils';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

/** 수정용 페이지 — Figma 'editpage_추후제작' (내용 미정, 헤더만 구성) */
export default function PolaroidEditPage({ id }: { id: string }) {
  const { getById } = usePolaroids();
  const polaroid = getById(id);
  if (!polaroid) return <NotFoundPage message="폴라로이드를 찾을 수 없어요." />;

  return (
    <>
      <TopBar title="Edit" back backFallback={`/polaroids/${polaroid.id}`} />
      <section className="page" style={{ textAlign: 'center' }}>
        <p className="home__stamp">{formatStamp(polaroid.date, polaroid.time)}</p>
        <p className="home__name" style={{ fontWeight: 600 }}>{polaroid.title}</p>
      </section>
    </>
  );
}
