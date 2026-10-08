import React, { useMemo, useState } from 'react';
import { Archive, BookOpen, Plus } from 'lucide-react';
import { Page, NavButton } from '../components/ui/Page';
import { ListGroup, ListRow } from '../components/ui/List';
import { SegmentedControl } from '../components/ui/Controls';
import { EmptyState } from '../components/ui/Feedback';
import { SwipeRow } from '../components/ui/SwipeRow';
import { Sheet } from '../components/ui/Sheet';
import { DayRow } from '../components/DayRow';
import { ArchivedSeason, SkiDay } from '../types';
import { Snowcard } from '../lib/useSnowcard';
import { computeSeasonStats } from '../lib/stats';
import { formatEuro, formatMonthYear, formatSignedEuro, shortSeasonLabel } from '../lib/format';

interface LogbookViewProps {
  app: Snowcard;
  onAddDay: () => void;
  onEditDay: (day: SkiDay) => void;
  onDeleteDay: (day: SkiDay) => void;
}

/** Tage absteigend, gruppiert nach Monat. */
const groupByMonth = (days: SkiDay[]) => {
  const groups: { key: string; label: string; days: SkiDay[] }[] = [];
  [...days].sort((a, b) => b.date.localeCompare(a.date)).forEach(day => {
    const key = day.date.slice(0, 7);
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) groups.push((group = { key, label: formatMonthYear(day.date), days: [] }));
    group.days.push(day);
  });
  return groups;
};

export const LogbookView: React.FC<LogbookViewProps> = ({ app, onAddDay, onEditDay, onDeleteDay }) => {
  const [mode, setMode] = useState<'current' | 'archive'>('current');
  const [openSeason, setOpenSeason] = useState<ArchivedSeason | null>(null);
  const { seasonDays, currentSeasonLabel, state } = app;
  const groups = useMemo(() => groupByMonth(seasonDays), [seasonDays]);
  const glacierOf = (day: SkiDay) => state.settings.resorts.find(r => r.id === day.resortId)?.glacier;

  return (
    <Page
      title="Logbuch"
      subtitle={mode === 'current' ? `Saison ${shortSeasonLabel(currentSeasonLabel)} · ${seasonDays.length} Skitage` : `${state.archivedSeasons.length} archivierte Saisons`}
      trailing={<NavButton onClick={onAddDay} label="Skitag hinzufügen"><Plus size={20} strokeWidth={2.5} /></NavButton>}
    >
      <SegmentedControl
        options={[{ value: 'current', label: 'Aktuelle Saison' }, { value: 'archive', label: 'Archiv' }]}
        value={mode}
        onChange={setMode}
      />

      {mode === 'current' && (
        <>
          {groups.length === 0 && (
            <EmptyState icon={BookOpen} title="Logbuch ist leer" text="Hier erscheinen deine Skitage dieser Saison." action={{ label: 'Skitag eintragen', onClick: onAddDay }} />
          )}
          {groups.map(g => (
            <ListGroup key={g.key} header={`${g.label} · ${g.days.length}`}>
              {g.days.map(day => (
                <SwipeRow key={day.id} onDelete={() => onDeleteDay(day)}>
                  <DayRow day={day} resortName={app.resortNameOf(day)} glacier={glacierOf(day)} onClick={() => onEditDay(day)} />
                </SwipeRow>
              ))}
            </ListGroup>
          ))}
          {seasonDays.length > 0 && (
            <ListGroup footer="Tipp: Zeile nach links wischen zum Löschen, antippen zum Bearbeiten. Am Saisonende archivieren, dann startet die Zählung neu.">
              <ListRow
                title={`Saison ${shortSeasonLabel(currentSeasonLabel)} archivieren`}
                accent
                leading={<Archive size={20} className="text-accent" />}
                onClick={() => {
                  if (app.archiveSeason(currentSeasonLabel)) setMode('archive');
                }}
              />
            </ListGroup>
          )}
        </>
      )}

      {mode === 'archive' && (
        state.archivedSeasons.length === 0 ? (
          <EmptyState icon={Archive} title="Noch kein Archiv" text="Abgeschlossene Saisons landen hier – mit allen Skitagen und der Bilanz." />
        ) : (
          <ListGroup>
            {state.archivedSeasons.map(season => {
              const stats = computeSeasonStats(season.days, season.snowcardPrice);
              return (
                <ListRow
                  key={season.seasonLabel}
                  title={`Saison ${shortSeasonLabel(season.seasonLabel)}`}
                  subtitle={`${season.days.length} Skitage · Snowcard ${formatEuro(season.snowcardPrice)}`}
                  trailing={<span className={`text-[17px] font-semibold tabular-nums ${stats.net >= 0 ? 'text-success' : 'text-secondary'}`}>{formatSignedEuro(stats.net)}</span>}
                  chevron
                  onClick={() => setOpenSeason(season)}
                />
              );
            })}
          </ListGroup>
        )
      )}

      <ArchivedSeasonSheet season={openSeason} app={app} onClose={() => setOpenSeason(null)} />
    </Page>
  );
};

const ArchivedSeasonSheet: React.FC<{ season: ArchivedSeason | null; app: Snowcard; onClose: () => void }> = ({ season, app, onClose }) => {
  // Inhalt beim Schließen stehen lassen, damit die Ausblend-Animation nicht leer ist
  const [shown, setShown] = useState<ArchivedSeason | null>(season);
  if (season && season !== shown) setShown(season);
  const s = shown;
  const stats = s ? computeSeasonStats(s.days, s.snowcardPrice) : null;

  return (
    <Sheet open={!!season} onClose={onClose} title={s ? `Saison ${shortSeasonLabel(s.seasonLabel)}` : ''} confirm={{ label: 'Fertig', onClick: onClose }}>
      {s && stats && (
        <>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Skitage', String(stats.daysCount)],
              ['Gratis-Tage', String(stats.freeDays)],
              ['Gesamtwert', formatEuro(stats.totalValue)],
              [stats.net >= 0 ? 'Ersparnis' : 'Verlust', formatSignedEuro(stats.net)],
            ].map(([label, value]) => (
              <div key={label} className="bg-card rounded-[14px] p-4">
                <div className="text-[13px] text-secondary">{label}</div>
                <div className="text-[24px] font-bold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
          {groupByMonth(s.days).map(g => (
            <ListGroup key={g.key} header={g.label}>
              {g.days.map(day => (
                <div key={day.id} className="group">
                  <DayRow day={day} resortName={app.resortNameOf(day)} />
                </div>
              ))}
            </ListGroup>
          ))}
          <ListGroup>
            <ListRow
              title="Archivierte Saison löschen"
              destructive
              onClick={() => {
                if (app.deleteArchivedSeason(s.seasonLabel)) onClose();
              }}
            />
          </ListGroup>
        </>
      )}
    </Sheet>
  );
};
