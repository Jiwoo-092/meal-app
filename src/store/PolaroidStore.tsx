import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ARCHIVE_POLAROIDS, POLAROIDS, type Polaroid } from '../data/mock';
import { sortPolaroids } from '../data/utils';

/**
 * 프로토타입용 메모리 스토어.
 * 저장 방식(영속성)은 명세상 확인 필요 항목이므로 새로고침 시 더미 데이터로 초기화됩니다.
 */
interface PolaroidStore {
  /** 홈 하루 화면용 (최신순) */
  polaroids: Polaroid[];
  getById: (id: string) => Polaroid | undefined;
  update: (id: string, patch: Partial<Omit<Polaroid, 'id'>>) => void;
}

const Ctx = createContext<PolaroidStore | null>(null);

export function PolaroidProvider({ children }: { children: ReactNode }) {
  const [polaroids, setPolaroids] = useState<Polaroid[]>(() => sortPolaroids(POLAROIDS));
  // 키워드 폴더 속 기록 — 홈 하루 화면에는 섞이지 않게 따로 보관
  const [archive, setArchive] = useState<Polaroid[]>(ARCHIVE_POLAROIDS);

  const getById = useCallback(
    (id: string) => polaroids.find((p) => p.id === id) ?? archive.find((p) => p.id === id),
    [polaroids, archive],
  );

  const update = useCallback((id: string, patch: Partial<Omit<Polaroid, 'id'>>) => {
    const apply = (prev: Polaroid[]) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
    setPolaroids(apply);
    setArchive(apply);
  }, []);

  const value = useMemo(() => ({ polaroids, getById, update }), [polaroids, getById, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePolaroids() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePolaroids must be used inside PolaroidProvider');
  return ctx;
}
