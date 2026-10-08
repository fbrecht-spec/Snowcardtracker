import { SkiDay, SnowQuality, Weather } from '../types';

export const SNOW_OPTIONS: { value: SnowQuality; label: string; emoji: string }[] = [
  { value: 'pulver', label: 'Pulver', emoji: '❄️' },
  { value: 'normal', label: 'Normal', emoji: '⛷️' },
  { value: 'eis', label: 'Eis', emoji: '🧊' },
];

export const WEATHER_OPTIONS: { value: Weather; label: string; emoji: string }[] = [
  { value: 'sonne', label: 'Sonne', emoji: '☀️' },
  { value: 'wolkig', label: 'Wolkig', emoji: '⛅' },
  { value: 'bedeckt', label: 'Bedeckt', emoji: '☁️' },
  { value: 'schnee', label: 'Schneefall', emoji: '🌨️' },
  { value: 'nebel', label: 'Nebel', emoji: '🌫️' },
];

export const snowLabel = (v?: SnowQuality) => SNOW_OPTIONS.find(o => o.value === v);
export const weatherLabel = (v?: Weather) => WEATHER_OPTIONS.find(o => o.value === v);

/** Kurzzeile für Listen: „☀️ · ❄️ Pulver · ★★★★ · mit Anna, Ben“ */
export const dayDetailsLine = (day: SkiDay) =>
  [
    weatherLabel(day.weather)?.emoji,
    snowLabel(day.snow) && `${snowLabel(day.snow)!.emoji} ${snowLabel(day.snow)!.label}`,
    day.rating && '★'.repeat(day.rating),
    day.companions?.length && `mit ${day.companions.join(', ')}`,
  ]
    .filter(Boolean)
    .join(' · ');

/** Häufigkeit der Begleiter, häufigste zuerst. */
export const companionRanking = (days: SkiDay[]) => {
  const counts: Record<string, number> = {};
  days.forEach(d => d.companions?.forEach(n => { counts[n] = (counts[n] || 0) + 1; }));
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};
