
export interface Resort {
  id: string;
  name: string;
  dailyPrice: number;
  location?: string;
  lat?: number;
  lng?: number;
}

export interface SkiDay {
  id: string;
  date: string;
  resortId: string;
  priceAtTime: number;
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
}

export type SnowcardTierKey = keyof SnowcardTiers;

export interface AppSettings {
  snowcardTiers: SnowcardTiers;
  activeTier: SnowcardTierKey;
  resorts: Resort[];
}

export interface AppState {
  settings: AppSettings;
  skiDays: SkiDay[];
  archivedSeasons: ArchivedSeason[];
}
