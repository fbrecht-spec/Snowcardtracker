import { useEffect, useMemo, useState } from 'react';
import { AppState, ArchivedSeason, Resort, SkiDay, SnowcardTierKey } from '../types';
import { loadState, saveState } from './storage';
import { getSeasonLabel, todayLocal } from './dateUtils';
import { computeSeasonStats } from './stats';
import { formatDate } from './format';

export interface DayInput {
  id?: string;
  date: string;
  resortId: string;
  applyCurrentPrice: boolean;
}

export interface ResortVisits {
  season: number;
  total: number;
  lastDate?: string;
}

const byLabel = (label: string) => (d: SkiDay) => getSeasonLabel(d.date) === label;

export const useSnowcard = () => {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Browser bitten, den Speicher nicht automatisch zu leeren
  useEffect(() => {
    navigator.storage?.persist?.().catch(() => {});
  }, []);

  const { settings, skiDays, archivedSeasons } = state;
  const currentSeasonLabel = useMemo(() => getSeasonLabel(todayLocal()), []);
  const activePrice = settings.snowcardTiers[settings.activeTier];

  // Nur Tage der aktuellen Saison zählen für Übersicht, Logbuch und Awards
  const seasonDays = useMemo(() => skiDays.filter(byLabel(currentSeasonLabel)), [skiDays, currentSeasonLabel]);
  const seasonStats = useMemo(() => computeSeasonStats(seasonDays, activePrice), [seasonDays, activePrice]);

  // Noch nicht archivierte Tage aus anderen Saisons
  const otherSeasons = useMemo(() => {
    const counts: Record<string, number> = {};
    skiDays.forEach(d => {
      const label = getSeasonLabel(d.date);
      if (label !== currentSeasonLabel) counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ label, count }));
  }, [skiDays, currentSeasonLabel]);

  const sortedResorts = useMemo(() => [...settings.resorts].sort((a, b) => a.name.localeCompare(b.name)), [settings.resorts]);

  const allDays = useMemo(() => [...skiDays, ...archivedSeasons.flatMap(s => s.days)], [skiDays, archivedSeasons]);

  const visitsByResort = useMemo(() => {
    const visits: Record<string, ResortVisits> = {};
    allDays.forEach(d => {
      const v = (visits[d.resortId] ??= { season: 0, total: 0 });
      v.total += 1;
      if (getSeasonLabel(d.date) === currentSeasonLabel) v.season += 1;
      if (!v.lastDate || d.date > v.lastDate) v.lastDate = d.date;
    });
    return visits;
  }, [allDays, currentSeasonLabel]);

  const resortNameOf = (day: SkiDay) => settings.resorts.find(r => r.id === day.resortId)?.name ?? day.resortName ?? 'Unbekannt';

  /** Speichert einen neuen oder bearbeiteten Skitag. Liefert, ob gespeichert wurde und ob damit der Break-even erreicht ist. */
  const saveDay = (input: DayInput): { saved: boolean; reachedBreakEven: boolean } => {
    const fail = { saved: false, reachedBreakEven: false };
    if (!input.date) return fail;
    const resort = settings.resorts.find(r => r.id === input.resortId);
    const existing = input.id ? skiDays.find(d => d.id === input.id) : undefined;
    // Beim Bearbeiten darf ein inzwischen gelöschtes Gebiet erhalten bleiben
    if (!resort && !(existing && existing.resortId === input.resortId)) return fail;

    const isDuplicate = skiDays.some(d => d.id !== input.id && d.date === input.date && d.resortId === input.resortId);
    if (isDuplicate) {
      const name = resort?.name ?? existing?.resortName ?? 'Unbekannt';
      if (!confirm(`Am ${formatDate(input.date, { day: 'numeric', month: 'numeric', year: 'numeric' })} gibt es bereits einen Skitag in ${name}. Trotzdem speichern?`)) return fail;
    }

    let day: SkiDay;
    if (existing) {
      day = {
        ...existing,
        date: input.date,
        resortId: input.resortId,
        priceAtTime: input.applyCurrentPrice && resort ? resort.dailyPrice : existing.priceAtTime,
      };
      if (resort) delete day.resortName;
    } else {
      day = { id: crypto.randomUUID(), date: input.date, resortId: input.resortId, priceAtTime: resort!.dailyPrice };
    }
    const nextDays = existing ? skiDays.map(d => (d.id === day.id ? day : d)) : [...skiDays, day];
    setState(prev => ({ ...prev, skiDays: nextDays }));

    const after = computeSeasonStats(nextDays.filter(byLabel(currentSeasonLabel)), activePrice);
    return { saved: true, reachedBreakEven: seasonStats.progress < 1 && after.progress >= 1 };
  };

  const deleteDay = (id: string) => {
    const day = skiDays.find(d => d.id === id);
    setState(prev => ({ ...prev, skiDays: prev.skiDays.filter(d => d.id !== id) }));
    return day;
  };

  const restoreDay = (day: SkiDay) =>
    setState(prev => (prev.skiDays.some(d => d.id === day.id) ? prev : { ...prev, skiDays: [...prev.skiDays, day] }));

  // Archiviert alle Tage einer Saison. Das Label kommt aus dem Datum der Tage.
  // Existiert die Saison schon im Archiv, werden die Tage dort ergänzt.
  const archiveSeason = (label: string) => {
    const days = skiDays.filter(byLabel(label));
    if (days.length === 0) return false;
    if (!confirm(`Saison ${label} archivieren? (${days.length} Skitage)\n\nDie Tage wandern ins Archiv im Logbuch.`)) return false;
    setState(prev => {
      const existing = prev.archivedSeasons.find(s => s.seasonLabel === label);
      const allSeasonDays = [...(existing?.days ?? []), ...prev.skiDays.filter(byLabel(label))];
      const snowcardPrice = existing?.snowcardPrice ?? activePrice;
      const totalValue = allSeasonDays.reduce((sum, d) => sum + d.priceAtTime, 0);
      const entry: ArchivedSeason = { seasonLabel: label, days: allSeasonDays, snowcardPrice, totalValue, profit: Math.max(0, totalValue - snowcardPrice) };
      return {
        ...prev,
        archivedSeasons: [entry, ...prev.archivedSeasons.filter(s => s.seasonLabel !== label)].sort((a, b) => b.seasonLabel.localeCompare(a.seasonLabel)),
        skiDays: prev.skiDays.filter(d => getSeasonLabel(d.date) !== label),
      };
    });
    return true;
  };

  const deleteArchivedSeason = (label: string) => {
    if (!confirm(`Archivierte Saison ${label} endgültig löschen?`)) return false;
    setState(prev => ({ ...prev, archivedSeasons: prev.archivedSeasons.filter(s => s.seasonLabel !== label) }));
    return true;
  };

  /** Legt ein Gebiet an oder aktualisiert es (gleiche id). */
  const saveResort = (resort: Resort) =>
    setState(prev => {
      const exists = prev.settings.resorts.some(r => r.id === resort.id);
      const resorts = exists ? prev.settings.resorts.map(r => (r.id === resort.id ? resort : r)) : [...prev.settings.resorts, resort];
      return { ...prev, settings: { ...prev.settings, resorts } };
    });

  // Gebiet löschen: Skitage, die darauf verweisen, behalten den Namen in resortName.
  const deleteResort = (id: string) => {
    const resort = settings.resorts.find(r => r.id === id);
    if (!resort) return false;
    const refCount = visitsByResort[id]?.total ?? 0;
    const message = refCount > 0
      ? `„${resort.name}“ wird in ${refCount} Skitag(en) verwendet. Der Name bleibt in diesen Skitagen erhalten, das Gebiet verschwindet aber aus Auswahl, Karte und Gletscher-Award. Trotzdem löschen?`
      : `„${resort.name}“ wirklich löschen?`;
    if (!confirm(message)) return false;
    const keepName = (d: SkiDay): SkiDay => (d.resortId === id ? { ...d, resortName: d.resortName ?? resort.name } : d);
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, resorts: prev.settings.resorts.filter(r => r.id !== id) },
      skiDays: prev.skiDays.map(keepName),
      archivedSeasons: prev.archivedSeasons.map(s => ({ ...s, days: s.days.map(keepName) })),
    }));
    return true;
  };

  const setActiveTier = (tier: SnowcardTierKey) =>
    setState(prev => ({ ...prev, settings: { ...prev.settings, activeTier: tier } }));

  const setTierPrice = (tier: SnowcardTierKey, price: number) =>
    setState(prev => ({ ...prev, settings: { ...prev.settings, snowcardTiers: { ...prev.settings.snowcardTiers, [tier]: price } } }));

  return {
    state,
    replaceState: setState,
    currentSeasonLabel,
    activePrice,
    seasonDays,
    seasonStats,
    otherSeasons,
    sortedResorts,
    visitsByResort,
    resortNameOf,
    saveDay,
    deleteDay,
    restoreDay,
    archiveSeason,
    deleteArchivedSeason,
    saveResort,
    deleteResort,
    setActiveTier,
    setTierPrice,
  };
};

export type Snowcard = ReturnType<typeof useSnowcard>;
