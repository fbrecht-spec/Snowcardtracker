import { AppState, ArchivedSeason, Resort, SkiDay, SnowcardTierKey } from './types';
import { INITIAL_RESORTS, DEFAULT_SNOWCARD_TIERS } from './constants';

export const STORAGE_KEY = 'snowcard_tracker_state_v3';

const TIER_KEYS: SnowcardTierKey[] = ['normal', 'vorverkauf', 'ermassigt'];

const isObject = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isDateString = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const createDefaultState = (): AppState => ({
  settings: {
    snowcardTiers: { ...DEFAULT_SNOWCARD_TIERS },
    activeTier: 'normal',
    resorts: INITIAL_RESORTS.map(r => ({ ...r }))
  },
  skiDays: [],
  archivedSeasons: []
});

const normalizeResort = (raw: unknown): Resort | null => {
  if (!isObject(raw) || typeof raw.id !== 'string' || typeof raw.name !== 'string') return null;
  const initial = INITIAL_RESORTS.find(r => r.id === raw.id);
  const resort: Resort = {
    id: raw.id,
    name: raw.name,
    dailyPrice: isNumber(raw.dailyPrice) ? raw.dailyPrice : (initial?.dailyPrice ?? 0),
  };
  if (isNumber(raw.lat)) resort.lat = raw.lat;
  if (isNumber(raw.lng)) resort.lng = raw.lng;
  // Gletscher-Flag: vorhandenen Wert behalten, sonst aus INITIAL_RESORTS ergänzen.
  if (typeof raw.glacier === 'boolean') resort.glacier = raw.glacier;
  else if (initial?.glacier) resort.glacier = true;
  return resort;
};

const normalizeSkiDay = (raw: unknown): SkiDay | null => {
  if (!isObject(raw) || !isDateString(raw.date) || typeof raw.resortId !== 'string') return null;
  const day: SkiDay = {
    id: typeof raw.id === 'string' && raw.id ? raw.id : crypto.randomUUID(),
    date: raw.date,
    resortId: raw.resortId,
    priceAtTime: isNumber(raw.priceAtTime) ? raw.priceAtTime : 0,
  };
  if (typeof raw.resortName === 'string') day.resortName = raw.resortName;
  return day;
};

const normalizeSkiDays = (raw: unknown): SkiDay[] =>
  Array.isArray(raw) ? raw.map(normalizeSkiDay).filter((d): d is SkiDay => d !== null) : [];

const normalizeArchivedSeason = (raw: unknown): ArchivedSeason | null => {
  if (!isObject(raw) || typeof raw.seasonLabel !== 'string') return null;
  return {
    seasonLabel: raw.seasonLabel,
    days: normalizeSkiDays(raw.days),
    snowcardPrice: isNumber(raw.snowcardPrice) ? raw.snowcardPrice : 0,
    totalValue: isNumber(raw.totalValue) ? raw.totalValue : 0,
    profit: isNumber(raw.profit) ? raw.profit : 0,
  };
};

/** Ergänzt fehlende oder ungültige Felder mit Defaults, ohne vorhandene Werte (z. B. Preise) zu überschreiben. */
export const normalizeState = (raw: unknown): AppState => {
  const defaults = createDefaultState();
  if (!isObject(raw)) return defaults;
  const settings = isObject(raw.settings) ? raw.settings : {};
  const rawTiers = isObject(settings.snowcardTiers) ? settings.snowcardTiers : {};

  const snowcardTiers = { ...defaults.settings.snowcardTiers };
  TIER_KEYS.forEach(k => { if (isNumber(rawTiers[k])) snowcardTiers[k] = rawTiers[k]; });

  const resorts = Array.isArray(settings.resorts)
    ? settings.resorts.map(normalizeResort).filter((r): r is Resort => r !== null)
    : defaults.settings.resorts;

  return {
    settings: {
      snowcardTiers,
      activeTier: TIER_KEYS.includes(settings.activeTier) ? settings.activeTier : 'normal',
      resorts,
    },
    skiDays: normalizeSkiDays(raw.skiDays),
    archivedSeasons: Array.isArray(raw.archivedSeasons)
      ? raw.archivedSeasons.map(normalizeArchivedSeason).filter((s): s is ArchivedSeason => s !== null)
      : [],
  };
};

/** Lädt den State. Bei defektem JSON wird der Rohwert unter einem Backup-Key gesichert und mit Defaults gestartet. */
export const loadState = (): AppState => {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    console.error('localStorage nicht verfügbar:', e);
    return createDefaultState();
  }
  if (!saved) return createDefaultState();
  try {
    return normalizeState(JSON.parse(saved));
  } catch (e) {
    console.error('Gespeicherte Daten defekt, starte mit Defaults:', e);
    try {
      localStorage.setItem(`${STORAGE_KEY}_corrupt_backup_${Date.now()}`, saved);
    } catch { /* Speicher voll o. ä. – nichts weiter möglich */ }
    return createDefaultState();
  }
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Speichern fehlgeschlagen:', e);
  }
};
