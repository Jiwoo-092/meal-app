import { useState, type FormEvent } from 'react';
import Icon from '../components/Icon';
import TabBar from '../components/TabBar';
import { Artboard } from '../lib/artboard';
import { goBack } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

const MAX = 20;

/**
 * 타이틀 수정 — 헤더·버튼: Figma 'editpage_헤더랑 버튼만 이 디자인으로 반영', 텍스트 필드: 기존 구현.
 * 저장하면 상세로 돌아가고 바뀐 타이틀이 홈·상세에 반영된다(새로고침 시 더미로 초기화).
 */
export default function TitleEditPage({ id }: { id: string }) {
  const { getById, update } = usePolaroids();
  const polaroid = getById(id);
  const [title, setTitle] = useState(polaroid?.title ?? '');

  if (!polaroid) return <NotFoundPage message="폴라로이드를 찾을 수 없어요." />;

  const trimmed = title.trim();
  const backTo = `/polaroids/${polaroid.id}`;
  const close = () => goBack(backTo);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    update(polaroid.id, { title: trimmed });
    close();
  };

  return (
    <Artboard className="edit">
      <header className="sub-header">
        <button type="button" className="sub-header__btn" aria-label="뒤로 가기" onClick={close}>
          <Icon name="arrow_left_light" size={28} />
        </button>
        <h1 className="sub-header__title">Edit</h1>
        <span className="sub-header__btn" aria-hidden="true" />
      </header>

      <form className="edit__form" onSubmit={onSubmit}>
        <div className="field edit__field">
          <label htmlFor="title" className="field__label">타이틀</label>
          <input
            id="title"
            className="field__input"
            value={title}
            maxLength={MAX}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby="title-hint"
            autoComplete="off"
            enterKeyHint="done"
          />
          <span id="title-hint" className="field__hint">
            {title.length}/{MAX}
          </span>
        </div>

        <div className="edit__buttons">
          <button type="button" className="pill-btn pill-btn--stroke" onClick={close}>
            취소
          </button>
          <button type="submit" className="pill-btn pill-btn--fill" disabled={!trimmed}>
            저장
          </button>
        </div>
      </form>

      <TabBar inArtboard />
    </Artboard>
  );
}
