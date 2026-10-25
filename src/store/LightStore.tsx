import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { LIGHT_PRESETS } from '../data/mock';

/** 전등 컬러: 실제 기기 연동 여부는 확인 필요 — 현재는 화면 내 시뮬레이션 */
interface LightState {
  on: boolean;
  color: string;
  brightness: number; // 0~100
  setOn: (v: boolean) => void;
  setColor: (v: string) => void;
  setBrightness: (v: number) => void;
}

const Ctx = createContext<LightState | null>(null);

export function LightProvider({ children }: { children: ReactNode }) {
  const [on, setOn] = useState(true);
  const [color, setColor] = useState<string>(LIGHT_PRESETS[0].color);
  const [brightness, setBrightness] = useState(80);
  const value = useMemo(() => ({ on, color, brightness, setOn, setColor, setBrightness }), [on, color, brightness]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLight() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useLight must be used inside LightProvider');
  return ctx;
}
