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

/** Längste Serie aufeinanderfolgender Skitage (Kalendertage). */
const longestStreak = (days: SkiDay[]) => {
  const dayNumbers = [...new Set(days.map(d => d.date))]
    .map(date => {
      const [y, m, d] = date.split('-').map(Number);
      return Date.UTC(y, m - 1, d) / 86_400_000; // UTC vermeidet Sprünge bei der Zeitumstellung
    })
    .sort((a, b) => a - b);
  let best = dayNumbers.length ? 1 : 0;
  let run = 1;
  for (let i = 1; i < dayNumbers.length; i++) {
    run = dayNumbers[i] - dayNumbers[i - 1] === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return best;
};

const counter = (target: number, value: number) => ({ isUnlocked: value >= target, progress: Math.min(Math.floor(value), target), target });

export const computeAwards = (days: SkiDay[], resorts: Resort[], snowcardPrice: number): Award[] => {
  const visitedCount = new Set(days.map(d => d.resortId)).size;
  const daysCount = days.length;
  const glacierIds = new Set(resorts.filter(r => r.glacier).map(r => r.id));
  const hasGlacier = days.some(d => glacierIds.has(d.resortId));
  const stats = computeSeasonStats(days, snowcardPrice);
  const month = (d: SkiDay) => d.date.slice(5, 7);
  const monthDay = (d: SkiDay) => d.date.slice(5);
  const perResort = days.reduce<Record<string, number>>((acc, d) => ({ ...acc, [d.resortId]: (acc[d.resortId] ?? 0) + 1 }), {});
  const maxSameResort = Math.max(0, ...Object.values(perResort));
  const streak = longestStreak(days);
  const winterMonths = ['12', '01', '02', '03'].filter(m => days.some(d => month(d) === m)).length;

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
    { id: 'hopper', title: 'Resort Hopper', description: 'Besuche 5 Gebiete', icon: 'Map', ...counter(5, visitedCount) },
    { id: 'glacier', title: 'Gletscher-König', description: 'Ein Skitag in einem Gletscherskigebiet', icon: 'Mountain', isUnlocked: hasGlacier },
    // Neue Erfolge
    { id: 'break-even', title: 'Rechnet sich!', description: 'Die Snowcard hat sich bezahlt gemacht', icon: 'PiggyBank', isUnlocked: stats.isProfitable },
    { id: 'savings-500', title: 'Goldener Winter', description: '500 € gegenüber Tageskarten gespart', icon: 'Coins', ...counter(500, Math.max(0, stats.net)) },
    { id: 'early', title: 'Frühstarter', description: 'Skitag im Oktober oder November', icon: 'Sunrise', isUnlocked: days.some(d => ['10', '11'].includes(month(d))) },
    { id: 'spring', title: 'Firn-Genießer', description: 'Skitag im April oder Mai', icon: 'Sun', isUnlocked: days.some(d => ['04', '05'].includes(month(d))) },
    { id: 'xmas', title: 'Christkind auf Ski', description: 'Skitag zwischen 24. und 26. Dezember', icon: 'Gift', isUnlocked: days.some(d => ['12-24', '12-25', '12-26'].includes(monthDay(d))) },
    { id: 'streak-2', title: 'Doppelschlag', description: 'Zwei Skitage hintereinander', icon: 'Repeat', ...counter(2, streak) },
    { id: 'streak-3', title: 'Serientäter', description: 'Drei Skitage am Stück', icon: 'Flame', ...counter(3, streak) },
    { id: 'explorer', title: 'Tirol-Entdecker', description: '10 verschiedene Gebiete in einer Saison', icon: 'Compass', ...counter(10, visitedCount) },
    { id: 'loyal', title: 'Treue Seele', description: '5 Skitage im selben Gebiet', icon: 'Heart', ...counter(5, maxSameResort) },
    { id: 'marathon', title: 'Winter-Marathon', description: 'In jedem Monat von Dezember bis März am Berg', icon: 'CalendarCheck', ...counter(4, winterMonths) },
  ];
};
