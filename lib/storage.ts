import { AppState, ArchivedSeason, Resort, SkiDay, SnowcardTierKey, STATE_VERSION } from '../types';
import { INITIAL_RESORTS, DEFAULT_SNOWCARD_TIERS } from '../constants';

export const STORAGE_KEY = 'snowcard_tracker_state_v4';
// Alter Schlüssel (Schema ohne Versionsfeld). Bleibt nach der Migration als Sicherheitskopie liegen.
const LEGACY_STORAGE_KEY = 'snowcard_tracker_state_v3';
const EXPORT_APP_ID = 'flos-snowcard-tracker';

const TIER_KEYS: SnowcardTierKey[] = ['normal', 'vorverkauf', 'ermassigt'];

const isObject = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isDateString = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);

export const createDefaultState = (): AppState => ({
  version: STATE_VERSION,
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
    version: STATE_VERSION,
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

/**
 * Migration auf die aktuelle Schemaversion.
 * v3 (ohne Versionsfeld) → v4: Versionsfeld, Gletscher-Flags, Defaults für fehlende Felder.
 * Das übernimmt normalizeState, das ohnehin jedes Feld prüft.
 */
const migrateState = (raw: unknown): AppState => {
  if (isObject(raw) && isNumber(raw.version) && raw.version > STATE_VERSION) {
    throw new Error(`Die Daten stammen aus einer neueren App-Version (Schema ${raw.version}).`);
  }
  return normalizeState(raw);
};

const readStoredState = (key: string): AppState | null => {
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  try {
    return migrateState(JSON.parse(saved));
  } catch (e) {
    console.error('Gespeicherte Daten defekt, starte mit Defaults:', e);
    try {
      localStorage.setItem(`${key}_corrupt_backup_${Date.now()}`, saved);
    } catch { /* Speicher voll o. ä. – nichts weiter möglich */ }
    return createDefaultState();
  }
};

/**
 * Lädt den State aus localStorage, bei Bedarf migriert aus dem alten v3-Schlüssel.
 * Bei defektem JSON wird der Rohwert unter einem Backup-Key gesichert und mit Defaults gestartet.
 */
export const loadState = (): AppState => {
  try {
    return readStoredState(STORAGE_KEY) ?? readStoredState(LEGACY_STORAGE_KEY) ?? createDefaultState();
  } catch (e) {
    console.error('localStorage nicht verfügbar:', e);
    return createDefaultState();
  }
};

/** Export-Datei: gesamter State plus App-Kennung und Exportdatum. */
export const createExportFile = (state: AppState, dateLabel: string): File => {
  const payload = { app: EXPORT_APP_ID, exportedAt: new Date().toISOString(), ...state };
  return new File([JSON.stringify(payload, null, 2)], `snowcard-tracker-backup-${dateLabel}.json`, { type: 'application/json' });
};

/** Prüft eine Import-Datei und liefert den migrierten State. Wirft einen Fehler mit lesbarer Meldung. */
export const parseImportFile = (text: string): { state: AppState; exportedAt?: string } => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('Die Datei ist kein gültiges JSON.');
  }
  if (!isObject(raw) || !isObject(raw.settings) || !Array.isArray(raw.settings.resorts) || !Array.isArray(raw.skiDays)) {
    throw new Error('Die Datei sieht nicht wie ein Snowcard-Tracker-Backup aus.');
  }
  return {
    state: migrateState(raw),
    exportedAt: typeof raw.exportedAt === 'string' ? raw.exportedAt : undefined
  };
};

export const saveState = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Speichern fehlgeschlagen:', e);
  }
};
