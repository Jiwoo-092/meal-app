import { useState, type FormEvent } from 'react';
import TopBar from '../components/TopBar';
import { navigate } from '../lib/router';
import { usePolaroids } from '../store/PolaroidStore';
import NotFoundPage from './NotFoundPage';

const MAX = 20;

/** 타이틀 수정 (저장·취소 흐름은 디자인 확인 필요 — 임시: 저장 후 상세로 복귀) */
export default function TitleEditPage({ id }: { id: string }) {
  const { getById, update } = usePolaroids();
  const polaroid = getById(id);
  const [title, setTitle] = useState(polaroid?.title ?? '');

  if (!polaroid) return <NotFoundPage message="폴라로이드를 찾을 수 없어요." />;

  const trimmed = title.trim();
  const backTo = `/polaroids/${polaroid.id}`;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    update(polaroid.id, { title: trimmed });
    navigate(backTo, { replace: true });
  };

  return (
    <>
      <TopBar title="타이틀 수정" back backFallback={backTo} />
      <form className="page" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="title" className="field__label">타이틀</label>
          <input
            id="title"
            className="field__input"
            value={title}
            maxLength={MAX}
            onChange={(e) => setTitle(e.target.value)}
            aria-describedby="title-hint"
            autoFocus
          />
          <span id="title-hint" className="field__hint">
            {title.length}/{MAX}
          </span>
        </div>
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => navigate(backTo, { replace: true })}>
            취소
          </button>
          <button type="submit" className="btn btn--primary" disabled={!trimmed}>
            저장
          </button>
        </div>
      </form>
    </>
  );
}
