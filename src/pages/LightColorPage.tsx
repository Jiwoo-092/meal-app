import TopBar from '../components/TopBar';
import { LIGHT_PRESETS } from '../data/mock';
import { useLight } from '../store/LightStore';

/** 전등 컬러 — 실제 기기 연동 여부 확인 필요. 현재는 화면 내 시뮬레이션 */
export default function LightColorPage() {
  const { on, color, brightness, setOn, setColor, setBrightness } = useLight();
  const preset = LIGHT_PRESETS.find((p) => p.color === color);

  return (
    <>
      <TopBar title="전등 컬러" />
      <section className="page">
        <p className="notice">전시용 시뮬레이션입니다. 실제 전등과 연결되어 있지 않아요.</p>

        <div className="lamp">
          <div
            className="lamp__bulb"
            aria-hidden="true"
            style={{
              background: on ? color : 'var(--color-muted)',
              opacity: on ? 0.35 + (brightness / 100) * 0.65 : 1,
              boxShadow: on ? `0 0 ${20 + brightness * 0.8}px ${color}` : 'none',
            }}
          />
          <p className="lamp__label" aria-live="polite">
            {on ? `${preset?.label ?? '사용자 지정'} · 밝기 ${brightness}%` : '꺼짐'}
          </p>
          <button type="button" className={on ? 'btn' : 'btn btn--primary'} aria-pressed={on} onClick={() => setOn(!on)}>
            {on ? '전등 끄기' : '전등 켜기'}
          </button>
        </div>

        <h2 className="section-title">컬러</h2>
        <ul className="swatches">
          {LIGHT_PRESETS.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="swatch"
                aria-pressed={p.color === color}
                onClick={() => {
                  setColor(p.color);
                  setOn(true);
                }}
              >
                <span className="swatch__dot" style={{ background: p.color }} aria-hidden="true">
                  {p.color === color ? '✓' : ''}
                </span>
                {p.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="field" style={{ marginTop: 'var(--space-6)' }}>
          <label htmlFor="brightness" className="field__label">
            밝기 {brightness}%
          </label>
          <input
            id="brightness"
            className="slider"
            type="range"
            min={10}
            max={100}
            step={5}
            value={brightness}
            disabled={!on}
            onChange={(e) => setBrightness(Number(e.target.value))}
          />
        </div>
      </section>
    </>
  );
}
