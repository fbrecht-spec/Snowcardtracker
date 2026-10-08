import { AppState } from '../types';
import { createExportFile } from './storage';
import { todayLocal } from './dateUtils';

export const BACKUP_REMINDER_DAYS = 15;

/**
 * Datei teilen: auf dem iPhone über das Teilen-Menü (z. B. „In Dateien sichern“, WhatsApp),
 * sonst als Download. Liefert 'cancelled', wenn das Teilen-Menü abgebrochen wurde.
 */
export const shareOrDownload = async (file: File): Promise<'shared' | 'downloaded' | 'cancelled'> => {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
      console.warn('Teilen fehlgeschlagen, nutze Download:', e);
    }
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
};

/** Exportiert den gesamten State als JSON-Backup. */
export const exportBackup = (state: AppState) => shareOrDownload(createExportFile(state, todayLocal()));

/** Tage seit dem letzten Backup, undefined = noch nie gesichert. */
export const daysSinceBackup = (lastBackupAt?: string) =>
  lastBackupAt ? Math.floor((Date.now() - Date.parse(lastBackupAt)) / 86_400_000) : undefined;
