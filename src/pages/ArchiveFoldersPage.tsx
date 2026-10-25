import { Link } from '../lib/router';
import ArchiveTabs from '../components/ArchiveTabs';
import TopBar from '../components/TopBar';
import { KEYWORDS } from '../data/mock';
import { usePolaroids } from '../store/PolaroidStore';

/** 아카이빙 · 폴더 보기 (키워드 폴더 아카이브) */
export default function ArchiveFoldersPage() {
  const { polaroids } = usePolaroids();
  return (
    <>
      <TopBar title="아카이빙" />
      <ArchiveTabs />
      <section className="page" aria-label="키워드 폴더">
        <ul className="folder-grid">
          {KEYWORDS.map((k) => {
            const count = polaroids.filter((p) => p.keywords.includes(k.id)).length;
            return (
              <li key={k.id}>
                <Link to={`/archive/folders/${k.id}`} className="folder" aria-label={`${k.label} 폴더, 폴라로이드 ${count}장`}>
                  <img className="folder__icon" src={k.sticker} alt="" width={56} />
                  <div>
                    <p className="folder__name">{k.label}</p>
                    <p className="folder__count">{count}장</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
