import { parseLocalDate } from './dateUtils';

const euro0 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const euro2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1.050 € bzw. mit Cent: 72,50 € */
export const formatEuro = (value: number, cents = false) => (cents ? euro2 : euro0).format(value);

/** Vorzeichen immer anzeigen: +340 € / −120 € */
export const formatSignedEuro = (value: number) => `${value >= 0 ? '+' : '−'}${euro0.format(Math.abs(value))}`;

export const formatDate = (dateStr: string, options: Intl.DateTimeFormatOptions) =>
  parseLocalDate(dateStr).toLocaleDateString('de-DE', options);

/** „Sa., 3. Okt.“ */
export const formatDayLong = (dateStr: string) => formatDate(dateStr, { weekday: 'short', day: 'numeric', month: 'short' });

/** „Januar 2027“ */
export const formatMonthYear = (dateStr: string) => formatDate(dateStr, { month: 'long', year: 'numeric' });

/** „2026/2027“ → „2026/27“ */
export const shortSeasonLabel = (label: string) => label.replace(/\/(\d{2})(\d{2})$/, '/$2');

/** Einzelpreis: ganze Euro ohne Cent (76 €), sonst mit Cent (72,50 €) */
export const formatPrice = (value: number) => formatEuro(value, !Number.isInteger(value));
