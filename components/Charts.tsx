import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SkiDay, SnowcardTierKey, SnowcardTiers } from '../types';
import { TIER_INFO } from '../constants';
import { formatDayLong, formatEuro, formatPrice, formatSignedEuro } from '../lib/format';
import { sortByDate } from '../lib/stats';
import { haptic } from '../lib/feedback';

const css = (token: string, alpha = 1) => `rgb(var(--${token}) / ${alpha})`;

const TIER_LINES = TIER_INFO.map(t => ({ ...t, label: t.short }));

interface BreakEvenChartProps {
  days: SkiDay[];
  tiers: SnowcardTiers;
  activeTier: SnowcardTierKey;
  resortNameOf: (day: SkiDay) => string;
}

/** Kumulierter Wert der Tageskarten gegen die drei Snowcard-Preise. Antippen zeigt Details. */
export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ days, tiers, activeTier, resortNameOf }) => {
  const data = useMemo(() => {
    let sum = 0;
    return [
      { n: 0, value: 0, day: undefined as SkiDay | undefined },
      ...sortByDate(days).map((day, i) => {
        sum += day.priceAtTime;
        return { n: i + 1, value: sum, day };
      }),
    ];
  }, [days]);

  // Runde Obergrenze (volle 200 €), damit die Achse saubere Werte zeigt
  const maxY = Math.ceil((Math.max(...Object.values(tiers), data[data.length - 1].value) * 1.04) / 200) * 200;

  return (
    <div className="select-none">
    <div className="h-56 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }} onClick={() => haptic()}>
          <defs>
            <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={css('accent')} stopOpacity={0.3} />
              <stop offset="100%" stopColor={css('accent')} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={css('separator', 0.5)} />
          <XAxis dataKey="n" type="number" domain={[0, Math.max(1, data.length - 1)]} allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: css('secondary') }} />
          <YAxis orientation="right" domain={[0, maxY]} tickLine={false} axisLine={false} width={44} tick={{ fontSize: 11, fill: css('secondary') }} tickCount={5} tickFormatter={v => `${Math.round(v)}`} />
          {TIER_LINES.map(t => (
            <ReferenceLine
              key={t.key}
              y={tiers[t.key]}
              stroke={css(t.color, t.key === activeTier ? 1 : 0.45)}
              strokeWidth={t.key === activeTier ? 1.5 : 1}
              strokeDasharray="4 4"
              label={t.key === activeTier ? { value: t.label, position: 'insideTopLeft', fill: css(t.color), fontSize: 10, fontWeight: 600 } : undefined}
            />
          ))}
          <Tooltip
            cursor={{ stroke: css('secondary', 0.6), strokeWidth: 1 }}
            content={({ active, payload }) => {
              const point = payload?.[0]?.payload as (typeof data)[number] | undefined;
              if (!active || !point?.day) return null;
              const net = point.value - tiers[activeTier];
              return (
                <div className="rounded-xl bg-card/95 backdrop-blur px-3 py-2 shadow-lg border-[0.5px] border-separator text-[13px]">
                  <div className="font-semibold">Tag {point.n} · {formatDayLong(point.day.date)}</div>
                  <div className="text-secondary">{resortNameOf(point.day)} · {formatPrice(point.day.priceAtTime)}</div>
                  <div className="mt-1 tabular-nums">
                    {formatEuro(point.value)} <span className={net >= 0 ? 'text-success' : 'text-secondary'}>({formatSignedEuro(net)})</span>
                  </div>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="value" stroke={css('accent')} strokeWidth={2.5} fill="url(#valueFill)" activeDot={{ r: 5, fill: css('accent'), stroke: css('card'), strokeWidth: 2 }} animationDuration={900} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[12px] text-secondary">
      {TIER_LINES.map(t => (
        <span key={t.key} className={`flex items-center gap-1.5 ${t.key === activeTier ? 'text-label font-semibold' : ''}`}>
          <span className="w-3 border-t-2 border-dashed" style={{ borderColor: css(t.color) }} />
          {t.label} {formatEuro(tiers[t.key])}
        </span>
      ))}
    </div>
    </div>
  );
};

const MONTHS = ['10', '11', '12', '01', '02', '03', '04', '05'];
const MONTH_LABELS = ['Okt', 'Nov', 'Dez', 'Jan', 'Feb', 'Mär', 'Apr', 'Mai'];

/** Skitage pro Monat der Saison; Antippen hebt einen Monat hervor. */
export const MonthlyChart: React.FC<{ days: SkiDay[] }> = ({ days }) => {
  const counts = MONTHS.map(m => days.filter(d => d.date.slice(5, 7) === m).length);
  const max = Math.max(1, ...counts);
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <div className="flex items-end gap-2 h-40">
      {counts.map((count, i) => {
        const isSel = selected === i;
        return (
          <button
            key={MONTHS[i]}
            onClick={() => {
              haptic();
              setSelected(isSel ? null : i);
            }}
            className="flex-1 h-full flex flex-col items-center justify-end gap-1.5"
            aria-label={`${MONTH_LABELS[i]}: ${count} Skitage`}
          >
            <span className={`text-[12px] font-semibold tabular-nums transition-opacity ${isSel || (selected === null && count > 0) ? 'opacity-100' : 'opacity-0'} ${isSel ? 'text-accent' : 'text-secondary'}`}>
              {count}
            </span>
            <div className="w-full flex-1 flex items-end">
              <motion.div
                className={`w-full rounded-[6px] ${count === 0 ? 'bg-fill/[0.12]' : isSel || selected === null ? 'bg-accent' : 'bg-accent/35'}`}
                initial={{ height: 0 }}
                animate={{ height: `${count === 0 ? 4 : Math.max(8, (count / max) * 100)}%` }}
                transition={{ type: 'spring', damping: 22, stiffness: 180, delay: i * 0.03 }}
              />
            </div>
            <span className={`text-[11px] ${isSel ? 'text-accent font-semibold' : 'text-secondary'}`}>{MONTH_LABELS[i]}</span>
          </button>
        );
      })}
    </div>
  );
};

/** Horizontale Balken, z. B. Lieblingsgebiete. */
export const RankingBars: React.FC<{ items: { label: string; value: number; highlight?: boolean }[]; unit?: string }> = ({ items, unit = '' }) => {
  const max = Math.max(1, ...items.map(i => i.value));
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={item.label}>
          <div className="flex justify-between text-[15px] mb-1">
            <span className="truncate pr-3">{item.label}</span>
            <span className="text-secondary tabular-nums shrink-0">{item.value}{unit}</span>
          </div>
          <div className="h-2 rounded-full bg-fill/[0.12] dark:bg-fill/[0.24] overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${item.highlight ? 'bg-teal' : 'bg-accent'}`}
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ type: 'spring', damping: 24, stiffness: 140, delay: i * 0.05 }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export interface SeasonSummary {
  label: string;
  days: number;
  net: number;
  current?: boolean;
}

/** Vergleich der Saisons: Skitage als Balken, Ersparnis bzw. Verlust als Zahl. */
export const SeasonComparison: React.FC<{ seasons: SeasonSummary[] }> = ({ seasons }) => {
  const max = Math.max(1, ...seasons.map(s => s.days));
  return (
    <div className="space-y-3.5">
      {seasons.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <div className="w-16 shrink-0 text-[13px]">
            <div className={s.current ? 'font-semibold' : ''}>{s.label}</div>
            {s.current && <div className="text-[11px] text-accent">aktuell</div>}
          </div>
          <div className="flex-1 h-6 rounded-[6px] bg-fill/[0.08] dark:bg-fill/[0.2] overflow-hidden">
            <motion.div
              className={`h-full rounded-[6px] flex items-center justify-end pr-2 text-[12px] font-semibold text-on-accent ${s.current ? 'bg-accent' : 'bg-indigo/80'}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(12, (s.days / max) * 100)}%` }}
              transition={{ type: 'spring', damping: 24, stiffness: 140, delay: i * 0.06 }}
            >
              {s.days}
            </motion.div>
          </div>
          <div className={`w-[68px] text-right text-[13px] font-semibold tabular-nums ${s.net >= 0 ? 'text-success' : 'text-secondary'}`}>
            {formatSignedEuro(s.net)}
          </div>
        </div>
      ))}
    </div>
  );
};
