import { Award, Resort, SkiDay } from '../types';

export interface SeasonStats {
  daysCount: number;
  totalValue: number;      // Summe der Tageskartenpreise
  snowcardPrice: number;
  net: number;             // totalValue - snowcardPrice (positiv = Ersparnis)
  isProfitable: boolean;
  progress: number;        // totalValue / snowcardPrice (1 = Break-even)
  freeDays: number;        // Tage nach dem Break-even-Tag
  avgCostPerDay: number;   // Snowcard-Preis / Skitage
  avgDayPrice: number;     // Ø Tageskartenpreis der gefahrenen Tage
  breakEvenDate?: string;
}

export const sortByDate = (days: SkiDay[]) => [...days].sort((a, b) => a.date.localeCompare(b.date));

export const computeSeasonStats = (days: SkiDay[], snowcardPrice: number): SeasonStats => {
  const sorted = sortByDate(days);
  let cumulative = 0;
  let breakEvenIndex = -1;
  sorted.forEach((day, index) => {
    cumulative += day.priceAtTime;
    if (breakEvenIndex === -1 && cumulative >= snowcardPrice) breakEvenIndex = index;
  });
  const totalValue = cumulative;
  const net = totalValue - snowcardPrice;
  return {
    daysCount: days.length,
    totalValue,
    snowcardPrice,
    net,
    isProfitable: net >= 0 && days.length > 0,
    progress: snowcardPrice > 0 ? totalValue / snowcardPrice : 0,
    freeDays: breakEvenIndex === -1 ? 0 : sorted.length - 1 - breakEvenIndex,
    avgCostPerDay: days.length > 0 ? snowcardPrice / days.length : 0,
    avgDayPrice: days.length > 0 ? totalValue / days.length : 0,
    breakEvenDate: breakEvenIndex === -1 ? undefined : sorted[breakEvenIndex].date,
  };
};

/** Geschätzte Skitage bis zum Break-even, auf Basis des Ø Tagespreises (Fallback: Ø Gebietspreis). */
export const estimateDaysToBreakEven = (stats: SeasonStats, resorts: Resort[]) => {
  if (stats.net >= 0) return 0;
  const fallback = resorts.length ? resorts.reduce((s, r) => s + r.dailyPrice, 0) / resorts.length : 0;
  const perDay = stats.avgDayPrice || fallback;
  return perDay > 0 ? Math.ceil(-stats.net / perDay) : 0;
};

export const computeAwards = (days: SkiDay[], resorts: Resort[]): Award[] => {
  const visitedCount = new Set(days.map(d => d.resortId)).size;
  const daysCount = days.length;
  const hasGlacier = days.some(d => resorts.find(r => r.id === d.resortId)?.glacier === true);
  const milestones: [number, string, string, string][] = [
    [1, 'First Tracks', 'Dein erster Tag im Schnee', 'Award'],
    [10, 'Snow-Fan', 'Stolze 10 Skitage geloggt', 'Star'],
    [15, 'Stammgast', '15 Tage! Der Berg ruft', 'Zap'],
    [20, 'Season Pro', '20 Skitage erreicht', 'Award'],
    [25, 'Pisten-Profi', '25 Tage! Fast ein Profi', 'Star'],
    [30, 'Pisten-Liebe', 'Stolze 30 Tage im Schnee!', 'Star'],
    [35, 'Schnee-Süchtiger', '35 Tage! Wahnsinn', 'Zap'],
    [40, 'Tirol Legende', 'Extremer Winter: 40 Tage!', 'Crown'],
  ];
  return [
    ...milestones.map(([target, title, description, icon]) => ({
      id: String(target), title, description, icon, isUnlocked: daysCount >= target, progress: daysCount, target,
    })),
    { id: 'hopper', title: 'Resort Hopper', description: 'Besuche 5 Gebiete', icon: 'Map', isUnlocked: visitedCount >= 5, progress: visitedCount, target: 5 },
    { id: 'glacier', title: 'Gletscher-König', description: 'Ein Skitag in einem Gletscherskigebiet', icon: 'Mountain', isUnlocked: hasGlacier },
  ];
};
