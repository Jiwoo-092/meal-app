import { useMemo, useState } from 'react';
import { Link } from '../lib/router';
import ArchiveTabs from '../components/ArchiveTabs';
import { IconChevronLeft, IconChevronRight } from '../components/Icons';
import TopBar from '../components/TopBar';
import type { Polaroid } from '../data/mock';
import { toDateKey } from '../data/utils';
import { usePolaroids } from '../store/PolaroidStore';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 아카이빙 · 캘린더 보기 (월간) */
export default function ArchiveCalendarPage() {
  const { polaroids } = usePolaroids();

  // 전시용: 가장 최근 기록이 있는 달에서 시작
  const latest = polaroids[0]?.date ?? toDateKey(new Date().getFullYear(), new Date().getMonth(), 1);
  const [cursor, setCursor] = useState(() => ({
    year: Number(latest.slice(0, 4)),
    month: Number(latest.slice(5, 7)) - 1,
  }));

  const byDate = useMemo(() => {
    const map = new Map<string, Polaroid[]>();
    polaroids.forEach((p) => map.set(p.date, [...(map.get(p.date) ?? []), p]));
    return map;
  }, [polaroids]);

  const firstDay = new Date(cursor.year, cursor.month, 1).getDay();
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const now = new Date();
  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const move = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  return (
    <>
      <TopBar title="아카이빙" />
      <ArchiveTabs />
      <section className="page" aria-labelledby="cal-month">
        <div className="calendar__head">
          <button type="button" className="icon-btn" onClick={() => move(-1)} aria-label="이전 달">
            <IconChevronLeft />
          </button>
          <h2 id="cal-month" className="calendar__month" aria-live="polite">
            {cursor.year}년 {cursor.month + 1}월
          </h2>
          <button type="button" className="icon-btn" onClick={() => move(1)} aria-label="다음 달">
            <IconChevronRight />
          </button>
        </div>

        <div className="calendar__grid" role="grid" aria-labelledby="cal-month">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calendar__weekday" role="columnheader">
              {w}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`blank-${i}`} aria-hidden="true" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const key = toDateKey(cursor.year, cursor.month, day);
            const items = byDate.get(key) ?? [];
            const cls = [
              'calendar__cell',
              items.length ? 'calendar__cell--has' : '',
              key === todayKey ? 'calendar__cell--today' : '',
            ].join(' ');

            if (!items.length) {
              return (
                <div key={key} className={cls} role="gridcell" aria-label={`${cursor.month + 1}월 ${day}일, 기록 없음`}>
                  {day}
                </div>
              );
            }
            return (
              <Link
                key={key}
                to={`/archive/days/${key}`}
                className={cls}
                role="gridcell"
                aria-label={`${cursor.month + 1}월 ${day}일, 폴라로이드 ${items.length}장`}
              >
                <span>{day}</span>
                <span className="calendar__dot" aria-hidden="true" />
                {items.length > 1 && <span className="calendar__count" aria-hidden="true">+{items.length - 1}</span>}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
