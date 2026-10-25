import PolaroidList from '../components/PolaroidList';
import TopBar from '../components/TopBar';
import { getKeyword, isKeywordId } from '../data/utils';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

/** 아카이빙 · 키워드 폴더 내 폴라로이드 모음 */
export default function ArchiveFolderPage({ keyword }: { keyword: string }) {
  const { polaroids } = usePolaroids();

  if (!isKeywordId(keyword)) return <NotFoundPage message="폴더를 찾을 수 없어요." />;

  const k = getKeyword(keyword)!;
  const items = polaroids.filter((p) => p.keywords.includes(keyword));

  return (
    <>
      <TopBar title={k.label} back backFallback="/archive/folders" />
      <section className="page" aria-label={`${k.label} 키워드 폴라로이드`}>
        <p className="page__desc">‘{k.label}’ 키워드를 획득한 폴라로이드 {items.length}장</p>
        <PolaroidList items={items} emptyText="이 키워드를 획득한 폴라로이드가 없어요." />
      </section>
    </>
  );
}
