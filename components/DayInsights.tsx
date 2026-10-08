import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Card } from './ui/Feedback';
import { SegmentedControl } from './ui/Controls';
import { RankingBars } from './Charts';
import { SkiDay } from '../types';
import { SNOW_OPTIONS, WEATHER_OPTIONS, companionRanking } from '../lib/dayMeta';

/** Mit wem warst du am meisten unterwegs – aktuelle Saison oder alle Saisons. */
export const CompanionsCard: React.FC<{ seasonDays: SkiDay[]; allDays: SkiDay[] }> = ({ seasonDays, allDays }) => {
  const [scope, setScope] = useState<'season' | 'all'>('season');
  const days = scope === 'season' ? seasonDays : allDays;
  const ranking = companionRanking(days).slice(0, 8);
  const alone = days.filter(d => !d.companions?.length).length;

  return (
    <Card title="Unterwegs mit">
      <SegmentedControl options={[{ value: 'season', label: 'Diese Saison' }, { value: 'all', label: 'Alle Saisons' }]} value={scope} onChange={setScope} />
      <div className="mt-4">
        {ranking.length === 0 ? (
          <div className="flex items-center gap-3 text-[15px] text-secondary py-2">
            <Users size={22} className="shrink-0" />
            Trag beim Skitag ein, mit wem du unterwegs warst – dann siehst du hier deine Ski-Buddys.
          </div>
        ) : (
          <>
            <RankingBars items={ranking.map(([label, value], i) => ({ label: i === 0 ? `🏆 ${label}` : label, value }))} unit="×" />
            {alone > 0 && <p className="text-[13px] text-secondary mt-3">{alone} {alone === 1 ? 'Tag' : 'Tage'} ohne Begleitung eingetragen</p>}
          </>
        )}
      </div>
    </Card>
  );
};

/** Verteilung von Schnee und Wetter, Ø Bewertung. Erscheint nur, wenn etwas erfasst wurde. */
export const ConditionsCard: React.FC<{ days: SkiDay[] }> = ({ days }) => {
  const rated = days.filter(d => d.rating);
  const hasAny = days.some(d => d.snow || d.weather) || rated.length > 0;
  if (!hasAny) return null;
  const avgRating = rated.length ? rated.reduce((s, d) => s + d.rating!, 0) / rated.length : 0;
  const best = [...rated].sort((a, b) => b.rating! - a.rating!)[0];

  const pill = (emoji: string, label: string, count: number) => (
    <div key={label} className={`rounded-[12px] px-3 py-2 text-center ${count ? 'bg-fill/[0.08] dark:bg-fill/[0.2]' : 'opacity-40'}`}>
      <div className="text-[20px] leading-none">{emoji}</div>
      <div className="text-[17px] font-semibold tabular-nums mt-1">{count}</div>
      <div className="text-[11px] text-secondary">{label}</div>
    </div>
  );

  return (
    <Card title="Schnee & Wetter" trailing={avgRating > 0 && <span className="text-[13px] text-secondary">Ø {avgRating.toFixed(1).replace('.', ',')} ★</span>}>
      <div className="grid grid-cols-3 gap-2">
        {SNOW_OPTIONS.map(o => pill(o.emoji, o.label, days.filter(d => d.snow === o.value).length))}
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2">
        {WEATHER_OPTIONS.map(o => pill(o.emoji, o.label, days.filter(d => d.weather === o.value).length))}
      </div>
      {best && best.rating === 5 && (
        <p className="text-[13px] text-secondary mt-3">
          {rated.filter(d => d.rating === 5).length}× fünf Sterne – dein Winter kann sich sehen lassen.
        </p>
      )}
    </Card>
  );
};
