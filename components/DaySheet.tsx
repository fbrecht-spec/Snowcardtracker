import React, { useEffect, useState } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Sheet } from './ui/Sheet';
import { ListGroup, ListRow } from './ui/List';
import { Switch } from './ui/Controls';
import { SkiDay } from '../types';
import { DayDetails, Snowcard } from '../lib/useSnowcard';
import { DayDetailsEditor } from './DayDetailsEditor';
import { todayLocal } from '../lib/dateUtils';
import { formatEuro } from '../lib/format';

interface DaySheetProps {
  open: boolean;
  day?: SkiDay; // gesetzt = bearbeiten
  app: Snowcard;
  onClose: () => void;
  onSaved: (result: { reachedBreakEven: boolean; isNew: boolean }) => void;
  onDelete: (day: SkiDay) => void;
}

export const DaySheet: React.FC<DaySheetProps> = ({ open, day, app, onClose, onSaved, onDelete }) => {
  const { sortedResorts, state } = app;
  const [date, setDate] = useState(todayLocal());
  const [resortId, setResortId] = useState('');
  const [applyCurrentPrice, setApplyCurrentPrice] = useState(false);
  const [details, setDetails] = useState<DayDetails>({});

  // Beim Öffnen vorbelegen: bestehender Tag oder heute + zuletzt genutztes Gebiet
  useEffect(() => {
    if (!open) return;
    if (day) {
      setDate(day.date);
      setResortId(day.resortId);
      setDetails({ snow: day.snow, weather: day.weather, rating: day.rating, companions: day.companions, note: day.note });
    } else {
      const last = [...state.skiDays].sort((a, b) => b.date.localeCompare(a.date))[0];
      const lastValid = last && sortedResorts.some(r => r.id === last.resortId) ? last.resortId : undefined;
      setDate(todayLocal());
      setResortId(lastValid ?? sortedResorts[0]?.id ?? '');
      setDetails({});
    }
    setApplyCurrentPrice(false);
  }, [open, day?.id]);

  const resort = sortedResorts.find(r => r.id === resortId);
  const deletedResort = day && !resort && day.resortId === resortId;
  const resortLabel = resort?.name ?? (deletedResort ? `${day.resortName ?? 'Unbekannt'} (gelöscht)` : 'Gebiet wählen');
  const price = day && !applyCurrentPrice ? day.priceAtTime : resort?.dailyPrice ?? 0;

  const save = () => {
    const result = app.saveDay({ id: day?.id, date, resortId, applyCurrentPrice, ...details });
    if (result.saved) onSaved({ reachedBreakEven: result.reachedBreakEven, isNew: !day });
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={day ? 'Skitag bearbeiten' : 'Neuer Skitag'}
      cancel={{ label: 'Abbrechen', onClick: onClose }}
      confirm={{ label: day ? 'Sichern' : 'Hinzufügen', onClick: save, disabled: !date || (!resort && !deletedResort) }}
    >
      <ListGroup>
        <ListRow
          title="Datum"
          trailing={
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="bg-fill/[0.12] dark:bg-fill/[0.24] rounded-md px-2 py-1 text-[17px] text-label outline-none"
              aria-label="Datum"
            />
          }
        />
        <div className="group relative">
          <ListRow
            title="Skigebiet"
            trailing={
              <span className="flex items-center gap-1 text-[17px] text-secondary max-w-[60%] text-right">
                <span className="truncate">{resortLabel}</span>
                <ChevronsUpDown size={16} className="shrink-0 text-tertiary" />
              </span>
            }
          />
          {/* Natives Auswahlrad von iOS über der ganzen Zeile */}
          <select
            value={resortId}
            onChange={e => setResortId(e.target.value)}
            className="absolute inset-0 opacity-0 w-full"
            aria-label="Skigebiet"
          >
            {deletedResort && <option value={day!.resortId}>{resortLabel}</option>}
            {sortedResorts.map(r => (
              <option key={r.id} value={r.id}>{r.name} · {formatEuro(r.dailyPrice, true)}</option>
            ))}
          </select>
        </div>
        <ListRow title="Tageskarte" value={formatEuro(price, true)} />
      </ListGroup>

      {day && resort && day.priceAtTime !== resort.dailyPrice && (
        <ListGroup footer={`Gespeichert ist der Preis vom Tag der Erfassung (${formatEuro(day.priceAtTime, true)}).`}>
          <ListRow
            title="Aktuellen Gebietspreis übernehmen"
            trailing={<Switch checked={applyCurrentPrice} onChange={setApplyCurrentPrice} label="Aktuellen Gebietspreis übernehmen" />}
          />
        </ListGroup>
      )}

      <DayDetailsEditor value={details} onChange={setDetails} suggestions={app.knownCompanions} />

      {day && (
        <ListGroup>
          <ListRow title="Skitag löschen" destructive onClick={() => onDelete(day)} />
        </ListGroup>
      )}
    </Sheet>
  );
};
