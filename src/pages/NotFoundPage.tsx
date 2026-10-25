import TopBar from '../components/TopBar';
import { Link } from '../lib/router';

/** 존재하지 않는 항목/경로 (처리 방식은 확인 필요 — 임시 화면) */
export default function NotFoundPage({ message = '페이지를 찾을 수 없어요.' }: { message?: string }) {
  return (
    <>
      <TopBar title="" back backFallback="/home" />
      <section className="page empty">
        <p>{message}</p>
        <Link to="/home" className="btn btn--primary">
          홈으로
        </Link>
      </section>
    </>
  );
}
