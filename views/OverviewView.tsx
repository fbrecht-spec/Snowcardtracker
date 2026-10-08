import React from 'react';
import { CalendarDays, CloudSnow, Euro, Gift, HardDriveDownload, Plus, TrendingDown, TriangleAlert } from 'lucide-react';
import { Page, NavButton } from '../components/ui/Page';
import { ListGroup, ListRow } from '../components/ui/List';
import { AnimatedNumber, ProgressRing } from '../components/ui/Controls';
import { EmptyState } from '../components/ui/Feedback';
import { DayRow } from '../components/DayRow';
import { SkiDay } from '../types';
import { TIER_INFO } from '../constants';
import { Snowcard } from '../lib/useSnowcard';
import { estimateDaysToBreakEven } from '../lib/stats';
import { BACKUP_REMINDER_DAYS, daysSinceBackup } from '../lib/backup';
import { formatDayLong, formatEuro, shortSeasonLabel } from '../lib/format';


const euro = (n: number) => formatEuro(Math.round(n));
const int = (n: number) => String(Math.round(n));
const euro1 = (n: number) => formatEuro(n, true);

interface OverviewViewProps {
  app: Snowcard;
  onAddDay: () => void;
  onEditDay: (day: SkiDay) => void;
  onShowLogbook: () => void;
  onBackup: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ app, onAddDay, onEditDay, onShowLogbook, onBackup }) => {
  const { seasonStats: s, seasonDays, otherSeasons, currentSeasonLabel, state } = app;
  const daysLeft = estimateDaysToBreakEven(s, state.settings.resorts);
  const hasData = state.skiDays.length + state.archivedSeasons.length > 0;
  const backupAge = daysSinceBackup(state.lastBackupAt);
  const backupDue = hasData && (backupAge === undefined || backupAge >= BACKUP_REMINDER_DAYS);
  const recent = [...seasonDays].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);

  const tiles = [
    { label: 'Skitage', value: s.daysCount, format: int, icon: CalendarDays, color: 'text-accent' },
    { label: 'Ø pro Skitag', value: s.avgCostPerDay, format: euro1, icon: TrendingDown, color: 'text-indigo', hint: 'Snowcard ÷ Tage' },
    { label: 'Gratis-Tage', value: s.freeDays, format: int, icon: Gift, color: 'text-warning', hint: 'nach Break-even' },
    { label: 'Gesamtwert', value: s.totalValue, format: euro, icon: Euro, color: 'text-success', hint: 'Summe Tageskarten' },
  ];

  return (
    <Page
      title="Übersicht"
      subtitle={`Saison ${shortSeasonLabel(currentSeasonLabel)} · ${TIER_INFO.find(t => t.key === state.settings.activeTier)?.label} ${formatEuro(s.snowcardPrice)}`}
      trailing={<NavButton onClick={onAddDay} label="Skitag hinzufügen"><Plus size={20} strokeWidth={2.5} /></NavButton>}
    >
      {backupDue && (
        <section className="bg-card rounded-[14px] p-4 flex gap-3">
          <HardDriveDownload size={22} className="text-accent shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[15px] font-semibold">Zeit für ein Backup</div>
            <p className="text-[13px] text-secondary mt-0.5">
              {backupAge === undefined ? 'Du hast noch nie ein Backup gemacht.' : `Dein letztes Backup ist ${backupAge} Tage her.`} Deine Skitage liegen nur auf diesem iPhone.
            </p>
            <button onClick={onBackup} className="mt-3 h-8 px-3.5 rounded-full bg-accent text-white text-[13px] font-semibold active:opacity-70">
              Jetzt sichern
            </button>
          </div>
        </section>
      )}

      {otherSeasons.length > 0 && (
        <section className="bg-card rounded-[14px] p-4 flex gap-3">
          <TriangleAlert size={22} className="text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-[15px] font-semibold">Nicht archivierte Skitage</div>
            <p className="text-[13px] text-secondary mt-0.5">
              {otherSeasons.map(o => `${shortSeasonLabel(o.label)}: ${o.count} Tage`).join(', ')}. Sie zählen nicht zur aktuellen Saison.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {otherSeasons.map(o => (
                <button key={o.label} onClick={() => app.archiveSeason(o.label)} className="h-8 px-3.5 rounded-full bg-warning/15 text-warning text-[13px] font-semibold active:opacity-60">
                  {shortSeasonLabel(o.label)} archivieren
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Break-even */}
      <section className="bg-card rounded-[14px] p-5 flex items-center gap-5">
        <ProgressRing progress={s.progress} size={124} stroke={13}>
          <AnimatedNumber value={Math.round(s.progress * 100)} format={n => `${Math.round(n)}%`} className="text-[26px] font-bold leading-none" />
          <span className="text-[11px] text-secondary mt-1">Break-even</span>
        </ProgressRing>
        <div className="min-w-0">
          {s.isProfitable ? (
            <>
              <div className="text-[13px] font-semibold text-success uppercase tracking-wide">Ersparnis</div>
              <AnimatedNumber value={s.net} format={n => `+${euro(n)}`} className="block text-[34px] font-bold leading-tight text-success" />
              <div className="text-[13px] text-secondary">
                Break-even am {s.breakEvenDate && formatDayLong(s.breakEvenDate)}
              </div>
            </>
          ) : (
            <>
              <div className="text-[13px] font-semibold text-secondary uppercase tracking-wide">Noch offen</div>
              <AnimatedNumber value={-s.net} format={euro} className="block text-[34px] font-bold leading-tight" />
              <div className="text-[13px] text-secondary">
                {s.daysCount === 0 ? 'bis sich die Snowcard lohnt' : `ca. ${daysLeft} ${daysLeft === 1 ? 'Skitag' : 'Skitage'} bis zum Break-even`}
              </div>
            </>
          )}
          <div className="text-[13px] text-secondary mt-2 tabular-nums">{formatEuro(s.totalValue)} von {formatEuro(s.snowcardPrice)}</div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map(t => (
          <section key={t.label} className="bg-card rounded-[14px] p-4">
            <div className={`flex items-center gap-1.5 text-[13px] font-semibold ${t.color}`}>
              <t.icon size={16} /> {t.label}
            </div>
            <AnimatedNumber value={t.value} format={t.format} className="block text-[28px] font-bold mt-1.5 leading-tight" />
            {t.hint && <div className="text-[12px] text-secondary">{t.hint}</div>}
          </section>
        ))}
      </div>

      {recent.length > 0 ? (
        <ListGroup header="Letzte Skitage">
          {recent.map(day => (
            <div key={day.id} className="group">
              <DayRow
                day={day}
                resortName={app.resortNameOf(day)}
                glacier={state.settings.resorts.find(r => r.id === day.resortId)?.glacier}
                onClick={() => onEditDay(day)}
              />
            </div>
          ))}
          {seasonDays.length > recent.length && <ListRow title={`Alle ${seasonDays.length} Skitage`} accent chevron onClick={onShowLogbook} />}
        </ListGroup>
      ) : (
        <EmptyState
          icon={CloudSnow}
          title="Noch keine Skitage"
          text="Trag deinen ersten Skitag ein und verfolge, ab wann sich die Snowcard lohnt."
          action={{ label: 'Skitag eintragen', onClick: onAddDay }}
        />
      )}
    </Page>
  );
};
