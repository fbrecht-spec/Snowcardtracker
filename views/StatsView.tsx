import React, { useMemo } from 'react';
import { ChartColumn, Sparkles } from 'lucide-react';
import { Page } from '../components/ui/Page';
import { Card, EmptyState } from '../components/ui/Feedback';
import { BreakEvenChart, MonthlyChart, RankingBars, SeasonComparison, SeasonSummary } from '../components/Charts';
import { AwardsGrid } from '../components/AwardsGrid';
import { Snowcard } from '../lib/useSnowcard';
import { computeAwards, computeSeasonStats } from '../lib/stats';
import { shortSeasonLabel } from '../lib/format';

interface StatsViewProps {
  app: Snowcard;
  onShowRecap: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ app, onShowRecap }) => {
  const { seasonDays, seasonStats, state, currentSeasonLabel } = app;

  const ranking = useMemo(() => {
    const counts: Record<string, number> = {};
    seasonDays.forEach(d => { counts[d.resortId] = (counts[d.resortId] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, value]) => {
        const day = seasonDays.find(d => d.resortId === id)!;
        return { label: app.resortNameOf(day), value, highlight: state.settings.resorts.find(r => r.id === id)?.glacier };
      });
  }, [seasonDays, state.settings.resorts, app]);

  const seasons: SeasonSummary[] = useMemo(
    () => [
      { label: shortSeasonLabel(currentSeasonLabel), days: seasonStats.daysCount, net: seasonStats.net, current: true },
      ...state.archivedSeasons.map(s => ({
        label: shortSeasonLabel(s.seasonLabel),
        days: s.days.length,
        net: computeSeasonStats(s.days, s.snowcardPrice).net,
      })),
    ],
    [currentSeasonLabel, seasonStats, state.archivedSeasons],
  );

  const awards = useMemo(() => computeAwards(seasonDays, state.settings.resorts, seasonStats.snowcardPrice), [seasonDays, state.settings.resorts, seasonStats.snowcardPrice]);
  const unlocked = awards.filter(a => a.isUnlocked).length;

  return (
    <Page title="Statistik" subtitle={`Saison ${shortSeasonLabel(currentSeasonLabel)}`}>
      <button
        onClick={onShowRecap}
        className="w-full rounded-[14px] p-4 flex items-center gap-3 text-left text-white bg-gradient-to-r from-indigo to-accent shadow-lg shadow-accent/20 active:scale-[0.98] transition-transform"
      >
        <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><Sparkles size={20} /></span>
        <span className="flex-1">
          <span className="block text-[17px] font-semibold">Saison-Rückblick</span>
          <span className="block text-[13px] text-white/80">Dein Winter auf einen Blick</span>
        </span>
      </button>

      {seasonDays.length === 0 ? (
        <EmptyState icon={ChartColumn} title="Noch keine Daten" text="Sobald du Skitage einträgst, siehst du hier Kurven, Monate und Lieblingsgebiete." />
      ) : (
        <>
          <Card title="Amortisation" trailing={<span className="text-[13px] text-secondary">Antippen für Details</span>}>
            <BreakEvenChart days={seasonDays} tiers={state.settings.snowcardTiers} activeTier={state.settings.activeTier} resortNameOf={app.resortNameOf} />
          </Card>

          <Card title="Skitage pro Monat">
            <MonthlyChart days={seasonDays} />
          </Card>

          <Card title="Lieblingsgebiete">
            <RankingBars items={ranking} unit="×" />
          </Card>
        </>
      )}

      {seasons.length > 1 && (
        <Card title="Saisonvergleich" trailing={<span className="text-[13px] text-secondary">Tage · Bilanz</span>}>
          <SeasonComparison seasons={seasons} />
        </Card>
      )}

      <section>
        <div className="flex items-baseline justify-between px-1 pb-2">
          <h2 className="text-[22px] font-bold">Erfolge</h2>
          <span className="text-[15px] text-secondary tabular-nums">{unlocked} von {awards.length}</span>
        </div>
        <AwardsGrid awards={awards} />
      </section>
    </Page>
  );
};
