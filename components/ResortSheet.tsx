import React, { useEffect, useState } from 'react';
import { Copy, MessageCircle, Utensils } from 'lucide-react';
import { Sheet } from './ui/Sheet';
import { IconBadge, ListGroup, ListRow } from './ui/List';
import { Switch } from './ui/Controls';
import { Resort } from '../types';
import { Snowcard } from '../lib/useSnowcard';
import { createId } from '../lib/id';
import { WeatherInfo, describeWeather } from '../lib/weather';
import { HUT_ASSISTANTS, copyText, hutPrompt } from '../lib/hutPrompt';
import { formatDayLong, formatPrice } from '../lib/format';

interface ResortSheetProps {
  open: boolean;
  resort?: Resort; // gesetzt = bearbeiten, sonst neu
  app: Snowcard;
  weather?: WeatherInfo;
  onClose: () => void;
  notify?: (message: string) => void;
}

const inputClass = 'w-full bg-transparent text-[17px] text-right text-label outline-none placeholder:text-tertiary';

export const ResortSheet: React.FC<ResortSheetProps> = ({ open, resort, app, weather, onClose, notify }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [glacier, setGlacier] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(resort?.name ?? '');
    setPrice(resort ? String(resort.dailyPrice).replace('.', ',') : '');
    setGlacier(resort?.glacier ?? false);
  }, [open, resort]);

  const parsedPrice = Number(price.replace(',', '.'));
  const valid = name.trim().length > 0 && price.trim() !== '' && Number.isFinite(parsedPrice) && parsedPrice >= 0;

  const save = () => {
    if (!valid) return;
    app.saveResort({ ...(resort ?? { id: createId() }), name: name.trim(), dailyPrice: parsedPrice, glacier });
    onClose();
  };

  const visits = resort ? app.visitsByResort[resort.id] : undefined;
  const visitDays = resort
    ? [...app.state.skiDays, ...app.state.archivedSeasons.flatMap(s => s.days)]
        .filter(d => d.resortId === resort.id)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={resort ? 'Gebiet' : 'Neues Gebiet'}
      cancel={{ label: 'Abbrechen', onClick: onClose }}
      confirm={{ label: resort ? 'Sichern' : 'Hinzufügen', onClick: save, disabled: !valid }}
    >
      <ListGroup footer="Der Preis gilt für neue Skitage. Bereits erfasste Tage behalten ihren Preis.">
        <ListRow title="Name" stretchTrailing trailing={<input value={name} onChange={e => setName(e.target.value)} placeholder="z. B. Kaunertal" className={inputClass} aria-label="Name" />} />
        <ListRow
          title="Tageskarte"
          stretchTrailing
          trailing={
            <span className="flex items-center gap-1 text-[17px]">
              <input value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal" placeholder="0,00" className={inputClass.replace('w-full', 'w-24')} aria-label="Preis Tageskarte" />
              <span className="text-secondary">€</span>
            </span>
          }
        />
        <ListRow title="Gletscherskigebiet" trailing={<Switch checked={glacier} onChange={setGlacier} label="Gletscherskigebiet" />} />
      </ListGroup>

      {resort && weather?.data[resort.id] && (() => {
        const w = weather.data[resort.id];
        const desc = describeWeather(w.weatherCode);
        return (
          <ListGroup header="Heute" footer={`Modellwerte auf ${w.elevation} m · Wetterdaten: Open-Meteo.com`}>
            <ListRow title="Wetter" value={`${desc.emoji} ${desc.label}, ${Math.round(w.temperature)}°`} />
            <ListRow title="Schneehöhe" value={`${w.snowDepthCm} cm`} />
            <ListRow title="Neuschnee (gestern + heute)" value={`${w.newSnowCm} cm`} />
          </ListGroup>
        );
      })()}

      {resort && (
        <ListGroup header="Hütten-Tipp" footer="Öffnet deinen Hütten-Guide-Prompt für dieses Gebiet in der KI deiner Wahl. KI-Angaben können falsch sein – vor Ort kurz prüfen.">
          {HUT_ASSISTANTS.map((a, i) => (
            <ListRow
              key={a.id}
              title={a.label}
              leading={<IconBadge icon={i === 0 ? Utensils : MessageCircle} className={i === 0 ? 'bg-warning' : 'bg-success'} />}
              chevron
              onClick={() => window.open(a.url(hutPrompt(resort.name)), '_blank', 'noopener')}
            />
          ))}
          <ListRow
            title="Prompt kopieren"
            leading={<IconBadge icon={Copy} className="bg-[#8E8E93]" />}
            onClick={async () => notify?.((await copyText(hutPrompt(resort.name))) ? 'Prompt kopiert' : 'Kopieren nicht möglich')}
          />
        </ListGroup>
      )}

      {resort && (
        <ListGroup header="Besuche">
          <ListRow title="Diese Saison" value={visits?.season ?? 0} />
          <ListRow title="Insgesamt" value={visits?.total ?? 0} />
          {visitDays.slice(0, 8).map(d => (
            <ListRow key={d.id} title={formatDayLong(d.date)} subtitle={d.date.slice(0, 4)} value={formatPrice(d.priceAtTime)} />
          ))}
        </ListGroup>
      )}

      {resort && (
        <ListGroup>
          <ListRow
            title="Gebiet löschen"
            destructive
            onClick={() => {
              if (app.deleteResort(resort.id)) onClose();
            }}
          />
        </ListGroup>
      )}
    </Sheet>
  );
};
