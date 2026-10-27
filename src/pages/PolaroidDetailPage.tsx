import Icon from '../components/Icon';
import MealInsight from '../components/MealInsight';
import Polaroid from '../components/Polaroid';
import TabBar from '../components/TabBar';
import { formatStamp } from '../data/utils';
import { ScrollArtboard } from '../lib/artboard';
import { goBack, Link } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

/**
 * 폴라로이드 상세페이지 — Figma 'polaroid detail - first/second/third meal' (375×1111)
 * 홈과 같은 배율로 그리고 세로 스크롤. 탭바는 화면 하단에 고정(홈과 같은 위치·크기).
 */
export default function PolaroidDetailPage({ id }: { id: string }) {
  const { getById } = usePolaroids();
  const polaroid = getById(id);
  if (!polaroid) return <NotFoundPage message="폴라로이드를 찾을 수 없어요." />;

  return (
    <ScrollArtboard height={1058} className="detail" overlay={<TabBar inArtboard />}>
      <header className="sub-header">
        <button type="button" className="sub-header__btn" aria-label="뒤로 가기" onClick={() => goBack('/home')}>
          <Icon name="arrow_left_light" size={28} />
        </button>
        <h1 className="sub-header__title">Archive</h1>
        <button type="button" className="sub-header__btn" aria-label="설정">
          <Icon name="setting_line_light" size={28} />
        </button>
      </header>

      <div className="detail__title">
        <p className="home__stamp">{formatStamp(polaroid.date, polaroid.time)}</p>
        <h2 className="home__name">{polaroid.title}</h2>
      </div>
      <Link to={`/polaroids/${polaroid.id}/title`} className="detail__edit" aria-label="타이틀 수정">
        <Icon name="edit_duotone_line" size={28} />
      </Link>

      <div className="detail__polaroid">
        <Polaroid polaroid={polaroid} tone="front" />
      </div>

      <div className="detail__insight">
        <MealInsight polaroid={polaroid} />
      </div>
    </ScrollArtboard>
  );
}
