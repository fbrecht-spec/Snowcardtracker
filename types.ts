
export interface Resort {
  id: string;
  name: string;
  dailyPrice: number;
  glacier?: boolean;
  lat?: number;
  lng?: number;
}

export type SnowQuality = 'pulver' | 'firn' | 'eis';
export type Weather = 'sonne' | 'wolkig' | 'bedeckt' | 'schnee' | 'nebel';

export interface SkiDay {
  id: string;
  date: string;
  resortId: string;
  priceAtTime: number;
  resortName?: string; // Sicherung des Namens, falls das Gebiet gelöscht wird
  snow?: SnowQuality;
  weather?: Weather;
  rating?: number;        // 1–5 Sterne
  companions?: string[];  // mit wem unterwegs
  note?: string;
}

export interface ArchivedSeason {
  seasonLabel: string; // e.g., "2023/2024"
  days: SkiDay[];
  snowcardPrice: number;
  totalValue: number;
  profit: number;
}

export interface Award {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress?: number;
  target?: number;
}

export interface SnowcardTiers {
  normal: number;
  vorverkauf: number;
  ermassigt: number;
  ermassigtVvk: number;
}

export type SnowcardTierKey = keyof SnowcardTiers;

export interface AppSettings {
  snowcardTiers: SnowcardTiers;
  activeTier: SnowcardTierKey;
  resorts: Resort[];
}

export const STATE_VERSION = 5;

export interface AppState {
  version: typeof STATE_VERSION;
  settings: AppSettings;
  skiDays: SkiDay[];
  archivedSeasons: ArchivedSeason[];
  lastBackupAt?: string;  // ISO-Zeitpunkt des letzten erfolgreichen Exports
}
