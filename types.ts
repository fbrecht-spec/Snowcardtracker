
export interface Resort {
  id: string;
  name: string;
  dailyPrice: number;
  glacier?: boolean;
  lat?: number;
  lng?: number;
}

export interface SkiDay {
  id: string;
  date: string;
  resortId: string;
  priceAtTime: number;
  resortName?: string; // Sicherung des Namens, falls das Gebiet gelöscht wird
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
}
