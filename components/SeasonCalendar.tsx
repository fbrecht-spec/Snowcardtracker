import React, { useMemo, useState } from 'react';
import { SkiDay } from '../types';
import { todayLocal } from '../lib/dateUtils';
import { formatDayLong } from '../lib/format';
import { dayDetailsLine } from '../lib/dayMeta';
import { haptic } from '../lib/feedback';

interface SeasonCalendarProps {
  days: SkiDay[];
  seasonLabel: string; // „2026/2027“
  resortNameOf: (day: SkiDay) => string;
}

const pad = (n: number) => String(n).padStart(2, '0');
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

/** Aktivitätskalender der Saison (1. Oktober bis 31. Mai), eine Spalte pro Woche – wie bei GitHub. */
export const SeasonCalendar: React.FC<SeasonCalendarProps> = ({ days, seasonLabel, resortNameOf }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const today = todayLocal();

  const { weeks, monthStarts } = useMemo(() => {
    const startYear = Number(seasonLabel.slice(0, 4));
    const start = new Date(startYear, 9, 1);
    const end = new Date(startYear + 1, 4, 31);
    // Erste Spalte beginnt am Montag vor dem 1. Oktober
    const cursor = new Date(start);
    cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));
    const weeks: (string | null)[][] = [];
    const monthStarts: { col: number; label: string }[] = [];
    while (cursor <= end) {
      const week: (string | null)[] = [];
      for (let i = 0; i < 7; i++) {
        const inSeason = cursor >= start && cursor <= end;
        week.push(inSeason ? iso(cursor) : null);
        if (inSeason && cursor.getDate() === 1) monthStarts.push({ col: weeks.length, label: MONTHS[cursor.getMonth()] });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    return { weeks, monthStarts };
  }, [seasonLabel]);

  const byDate = useMemo(() => {
    const map: Record<string, SkiDay[]> = {};
    days.forEach(d => (map[d.date] ??= []).push(d));
    return map;
  }, [days]);

  const selectedDays = selected ? byDate[selected] ?? [] : [];

  return (
    <div>
      <div className="flex gap-1.5">
        {/* Wochentage */}
        <div className="grid grid-rows-7 gap-[2px] pt-4 text-[9px] text-secondary leading-none">
          {['Mo', '', 'Mi', '', 'Fr', '', 'So'].map((d, i) => (
            <span key={i} className="h-full flex items-center">{d}</span>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          {/* Monatsbeschriftung */}
          <div className="relative h-4 text-[9px] text-secondary">
            {monthStarts.map(m => (
              <span key={m.label} className="absolute top-0" style={{ left: `${(m.col / weeks.length) * 100}%` }}>{m.label}</span>
            ))}
          </div>
          <div className="grid gap-[2px]" style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}>
            {weeks.map((week, w) => (
              <div key={w} className="grid grid-rows-7 gap-[2px]">
                {week.map((date, d) => {
                  if (!date) return <span key={d} className="aspect-square" />;
                  const count = byDate[date]?.length ?? 0;
                  const isSel = selected === date;
                  const future = date > today;
                  return (
                    <button
                      key={d}
                      onClick={() => {
                        if (count) haptic();
                        setSelected(isSel ? null : date);
                      }}
                      aria-label={`${formatDayLong(date)}${count ? `: ${count} Skitag` : ''}`}
                      className={`aspect-square rounded-[2px] ${
                        count >= 2 ? 'bg-indigo' : count === 1 ? 'bg-accent' : future ? 'bg-fill/[0.05] dark:bg-fill/[0.12]' : 'bg-fill/[0.12] dark:bg-fill/[0.24]'
                      } ${isSel ? 'ring-2 ring-label ring-offset-1 ring-offset-card' : ''} ${date === today ? 'outline outline-1 outline-accent' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-[40px] text-[13px]">
        {selected ? (
          selectedDays.length ? (
            selectedDays.map(d => (
              <div key={d.id}>
                <span className="font-semibold">{formatDayLong(d.date)} · {resortNameOf(d)}</span>
                {dayDetailsLine(d) && <span className="text-secondary"> · {dayDetailsLine(d)}</span>}
              </div>
            ))
          ) : (
            <span className="text-secondary">{formatDayLong(selected)} · kein Skitag</span>
          )
        ) : (
          <div className="flex items-center gap-3 text-secondary">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-accent" /> Skitag</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] bg-indigo" /> mehrere</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-[2px] outline outline-1 outline-accent" /> heute</span>
            <span className="ml-auto">Tag antippen</span>
          </div>
        )}
      </div>
    </div>
  );
};
