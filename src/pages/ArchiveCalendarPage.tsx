import ArchiveTabs from '../components/ArchiveTabs';
import SubHeader from '../components/SubHeader';
import TabBar from '../components/TabBar';
import { CALENDAR, CALENDAR_DOTS, CALENDAR_SELECTED_DAY } from '../data/mock';
import { toDateKey } from '../data/utils';
import { Artboard } from '../lib/artboard';
import { goBack, Link } from '../lib/router';

const WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
/** Figma 그대로 강조된 요일 */
const WEEK_ACTIVE = 'Fri';

type Cell = { day: number; outside: boolean };

/**
 * 달력 칸 — Figma에 배치된 그대로 (실제 2026년 11월 요일과 다름, 디자인에서 임의로 정한 배치 유지)
 * 첫 줄: 30 31(지난달) 01~05 / 마지막 줄: 27~30, 01 02 03(다음달)
 */
const CELLS: Cell[] = [
  { day: 30, outside: true },
  { day: 31, outside: true },
  ...Array.from({ length: 30 }, (_, i) => ({ day: i + 1, outside: false })),
  { day: 1, outside: true },
  { day: 2, outside: true },
  { day: 3, outside: true },
];

/**
 * 아카이브 · 캘린더 — Figma 'archive: calendar' (2026년 11월, 기록 표시는 디자인에서 임의로 정한 그대로)
 * 색 원이 있는 날짜만 눌러서 그날의 폴라로이드 모음으로 이동.
 */
export default function ArchiveCalendarPage() {
  const { year, month } = CALENDAR;
  const cells = CELLS;
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <Artboard className="archive">
      <SubHeader word="archive" onBack={() => goBack('/home')} />
      <ArchiveTabs active="calendar" />

      <div className="cal__today">
        <img src="/assets/type/date-14.svg" alt="14일" width={43} height={39} />
        <span>mon</span>
      </div>
      <div className="cal__month">
        <img src="/assets/type/november.svg" alt="november" width={129} height={39} />
        <img src="/assets/type/year-2026.svg" alt="2026" width={47} height={28} />
      </div>

      <div className="cal__days">
        <div className="cal__week">
          {WEEK.map((w) => (
            <span key={w} className={w === WEEK_ACTIVE ? 'is-active' : ''}>
              {w}
            </span>
          ))}
        </div>
        {weeks.map((row, i) => (
          <div className="cal__row" key={i}>
            {row.map((c, j) => {
              const label = String(c.day).padStart(2, '0');
              const dots = c.outside ? undefined : CALENDAR_DOTS[c.day];
              if (dots) {
                return (
                  <Link
                    key={j}
                    to={`/archive/days/${toDateKey(year, month - 1, c.day)}`}
                    className="cal__date is-marked"
                    aria-label={`${month}월 ${c.day}일 기록 보기`}
                  >
                    <span className="cal__num">{label}</span>
                    <span className="cal__dots">
                      {dots.map((color, k) => (
                        <i key={k} style={{ background: color }} />
                      ))}
                    </span>
                  </Link>
                );
              }
              const selected = !c.outside && c.day === CALENDAR_SELECTED_DAY;
              return (
                <span key={j} className={`cal__date${c.outside ? ' is-outside' : ''}${selected ? ' is-selected' : ''}`}>
                  <span className="cal__num">{label}</span>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <TabBar inArtboard />
    </Artboard>
  );
}
