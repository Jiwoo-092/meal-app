import ArchiveFolder from '../components/ArchiveFolder';
import ArchiveTabs from '../components/ArchiveTabs';
import SubHeader from '../components/SubHeader';
import TabBar from '../components/TabBar';
import { KEYWORDS } from '../data/mock';
import { Artboard } from '../lib/artboard';
import { goBack } from '../lib/router';

/** 아카이브 · 키워드 — Figma 'archive: keyword' (키워드별 폴라로이드 폴더 5개) */
export default function ArchiveFoldersPage() {
  return (
    <Artboard className="archive">
      <SubHeader word="archive" onBack={() => goBack('/home')} />
      <ArchiveTabs active="keyword" />
      <div className="archive__folders">
        {KEYWORDS.map((k) => (
          <ArchiveFolder key={k.id} keyword={k} />
        ))}
      </div>
      <TabBar inArtboard />
    </Artboard>
  );
}
