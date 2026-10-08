import React, { useEffect, useRef, useState } from 'react';
import { Check, Download, HardDrive, Upload } from 'lucide-react';
import { Page } from '../components/ui/Page';
import { IconBadge, ListGroup, ListRow } from '../components/ui/List';
import { TIER_INFO } from '../constants';
import { Snowcard } from '../lib/useSnowcard';
import { parseImportFile } from '../lib/storage';
import { daysSinceBackup } from '../lib/backup';
import { haptic } from '../lib/feedback';

const backupLabel = (days?: number) =>
  days === undefined ? 'Noch nie gesichert' : days === 0 ? 'Zuletzt heute gesichert' : days === 1 ? 'Zuletzt gestern gesichert' : `Zuletzt vor ${days} Tagen gesichert`;

interface SettingsViewProps {
  app: Snowcard;
  notify: (message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ app, notify }) => {
  const { state } = app;
  const importInputRef = useRef<HTMLInputElement>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);

  useEffect(() => {
    navigator.storage?.persisted?.().then(setPersisted).catch(() => setPersisted(null));
  }, []);

  const exportData = async () => {
    const result = await app.backupNow();
    if (result === 'downloaded') notify('Backup heruntergeladen');
    if (result === 'shared') notify('Backup gesichert');
  };

  const importData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { state: imported, exportedAt } = parseImportFile(await file.text());
      const exportedLabel = exportedAt ? ` vom ${new Date(exportedAt).toLocaleString('de-DE')}` : '';
      const archivedDays = imported.archivedSeasons.reduce((sum, s) => sum + s.days.length, 0);
      const message = `Backup${exportedLabel} importieren?\n\n`
        + `${imported.skiDays.length} Skitage, ${imported.archivedSeasons.length} archivierte Saisons (${archivedDays} Tage), ${imported.settings.resorts.length} Gebiete.\n\n`
        + 'Alle aktuellen Daten auf diesem Gerät werden überschrieben.';
      if (!confirm(message)) return;
      app.replaceState(imported);
      notify('Import erfolgreich');
    } catch (err) {
      alert(`Import fehlgeschlagen: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <Page title="Einstellungen">
      <ListGroup header="Snowcard-Tarif" footer="Der gewählte Tarif ist die Grundlage für Break-even und Ersparnis. Preise sind antippbar.">
        {TIER_INFO.map(t => {
          const active = state.settings.activeTier === t.key;
          // Auswahl-Knopf und Preisfeld nebeneinander (kein Eingabefeld innerhalb eines Buttons)
          return (
            <div key={t.key} className="relative flex items-center pressable after:absolute after:bottom-0 after:left-[46px] after:right-0 after:h-[0.5px] after:bg-separator last:after:hidden">
              <button
                onClick={() => {
                  if (!active) haptic();
                  app.setActiveTier(t.key);
                }}
                aria-pressed={active}
                className="flex-1 self-stretch flex items-center gap-2.5 pl-4 min-h-[44px] text-left"
              >
                <Check size={20} strokeWidth={2.5} className={`text-accent shrink-0 ${active ? 'opacity-100' : 'opacity-0'}`} />
                <span className={`text-[17px] ${active ? 'font-semibold' : ''}`}>{t.label}</span>
              </button>
              <label className="flex items-center pr-4 text-[17px] text-secondary">
                <input
                  type="number"
                  inputMode="decimal"
                  value={state.settings.snowcardTiers[t.key]}
                  onChange={e => app.setTierPrice(t.key, Number(e.target.value))}
                  className="w-20 bg-transparent text-right outline-none tabular-nums"
                  aria-label={`Preis ${t.label}`}
                />
                <span className="ml-1">€</span>
              </label>
            </div>
          );
        })}
      </ListGroup>

      <ListGroup
        header="Datensicherung"
        footer="Deine Daten liegen nur auf diesem Gerät. Exportiere regelmäßig ein Backup, z. B. über „In Dateien sichern“."
      >
        <ListRow
          title="Backup exportieren"
          subtitle={backupLabel(daysSinceBackup(state.lastBackupAt))}
          leading={<IconBadge icon={Download} className="bg-accent" />}
          chevron
          onClick={exportData}
        />
        <ListRow title="Backup importieren" leading={<IconBadge icon={Upload} className="bg-success" />} chevron onClick={() => importInputRef.current?.click()} />
        <ListRow
          title="Speicher"
          leading={<IconBadge icon={HardDrive} className="bg-[#8E8E93]" />}
          value={persisted === null ? 'unbekannt' : persisted ? 'dauerhaft' : 'nicht garantiert'}
        />
      </ListGroup>
      <input ref={importInputRef} type="file" accept=".json,application/json" onChange={importData} className="hidden" />

      <ListGroup footer="Löscht alle Skitage, Gebiete und Einstellungen auf diesem Gerät.">
        <ListRow
          title="Alle Daten löschen"
          destructive
          onClick={() => {
            if (confirm('Wirklich alle Daten auf diesem Gerät löschen? Das kann nicht rückgängig gemacht werden.')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        />
      </ListGroup>

      <p className="text-center text-[13px] text-secondary">Flo's Snowcard Tracker</p>
    </Page>
  );
};
