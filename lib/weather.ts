import { useCallback, useEffect, useState } from 'react';
import { Resort } from '../types';

/**
 * Wetter und Schnee über Open-Meteo (kostenlos, ohne Schlüssel, Daten unter CC BY 4.0).
 * Werte sind Modelldaten für die Koordinate des Gebiets – kein offizieller Pistenbericht.
 */

export interface ResortWeather {
  resortId: string;
  temperature: number;    // °C aktuell
  weatherCode: number;    // WMO-Code
  snowDepthCm: number;    // Schneehöhe aktuell
  newSnowCm: number;      // Neuschnee gestern + heute (inkl. Vorhersage für heute)
  elevation: number;      // Höhe des Modellpunkts in m
}

export interface WeatherState {
  data: Record<string, ResortWeather>;
  fetchedAt?: number;
  loading: boolean;
  error?: string;
}

const CACHE_KEY = 'snowcard_weather_cache';
const MAX_AGE_MS = 60 * 60 * 1000; // 1 Stunde

const WMO: [number[], string, string][] = [
  [[0], '☀️', 'Sonnig'],
  [[1, 2], '🌤️', 'Leicht bewölkt'],
  [[3], '☁️', 'Bedeckt'],
  [[45, 48], '🌫️', 'Nebel'],
  [[51, 53, 55, 56, 57], '🌦️', 'Nieselregen'],
  [[61, 63, 65, 66, 67, 80, 81, 82], '🌧️', 'Regen'],
  [[71, 73, 75, 77, 85, 86], '🌨️', 'Schneefall'],
  [[95, 96, 99], '⛈️', 'Gewitter'],
];

export const describeWeather = (code: number) => {
  const hit = WMO.find(([codes]) => codes.includes(code));
  return { emoji: hit?.[1] ?? '🌡️', label: hit?.[2] ?? 'Unbekannt' };
};

/** Punkte für „bester Schnee“: Schneehöhe plus doppelt gewichteter Neuschnee. */
export const snowScore = (w: ResortWeather) => w.snowDepthCm + 2 * w.newSnowCm;

const readCache = (): Pick<WeatherState, 'data' | 'fetchedAt'> | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const fetchWeather = async (resorts: Resort[]): Promise<Record<string, ResortWeather>> => {
  const located = resorts.filter(r => r.lat != null && r.lng != null);
  if (located.length === 0) return {};
  const params = new URLSearchParams({
    latitude: located.map(r => r.lat).join(','),
    longitude: located.map(r => r.lng).join(','),
    current: 'temperature_2m,weather_code,snow_depth',
    daily: 'snowfall_sum',
    past_days: '1',
    forecast_days: '1',
    timezone: 'Europe/Vienna',
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo antwortet mit ${res.status}`);
  const json = await res.json();
  const list = Array.isArray(json) ? json : [json]; // eine Koordinate → einzelnes Objekt
  const data: Record<string, ResortWeather> = {};
  list.forEach((entry, i) => {
    const r = located[i];
    if (!r || !entry?.current) return;
    const snowfall: number[] = entry.daily?.snowfall_sum ?? [];
    data[r.id] = {
      resortId: r.id,
      temperature: entry.current.temperature_2m,
      weatherCode: entry.current.weather_code,
      snowDepthCm: Math.round((entry.current.snow_depth ?? 0) * 100),
      newSnowCm: Math.round(snowfall.reduce((s, v) => s + (v ?? 0), 0)),
      elevation: Math.round(entry.elevation ?? 0),
    };
  });
  return data;
};

/** Lädt Wetterdaten (gecacht für 1 Stunde). Ohne Netz bleiben die letzten Daten stehen. */
export const useWeather = (resorts: Resort[]) => {
  const [state, setState] = useState<WeatherState>(() => ({ data: {}, loading: false, ...readCache() }));
  const resortKey = resorts.map(r => `${r.id}:${r.lat}:${r.lng}`).join('|');

  const refresh = useCallback(async (force = false) => {
    const cached = readCache();
    if (!force && cached?.fetchedAt && Date.now() - cached.fetchedAt < MAX_AGE_MS && resorts.every(r => r.lat == null || cached.data[r.id])) {
      setState(s => ({ ...s, ...cached, error: undefined }));
      return;
    }
    if (!navigator.onLine) {
      setState(s => ({ ...s, error: 'Keine Internetverbindung' }));
      return;
    }
    setState(s => ({ ...s, loading: true, error: undefined }));
    try {
      const data = await fetchWeather(resorts);
      const next = { data, fetchedAt: Date.now() };
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* Cache ist optional */ }
      setState({ ...next, loading: false });
    } catch (e) {
      console.warn('Wetter nicht verfügbar:', e);
      setState(s => ({ ...s, loading: false, error: 'Wetterdaten nicht erreichbar' }));
    }
  }, [resortKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Gebiete mit dem besten Schnee, beste zuerst */
  const ranking = Object.values(state.data)
    .filter(w => resorts.some(r => r.id === w.resortId))
    .sort((a, b) => snowScore(b) - snowScore(a));

  return { ...state, ranking, refresh };
};

export type WeatherInfo = ReturnType<typeof useWeather>;
