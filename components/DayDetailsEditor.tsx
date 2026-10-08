import React, { useState } from 'react';
import { Plus, Star, X } from 'lucide-react';
import { ListGroup } from './ui/List';
import { DayDetails } from '../lib/useSnowcard';
import { SNOW_OPTIONS, WEATHER_OPTIONS } from '../lib/dayMeta';
import { haptic } from '../lib/feedback';

interface DayDetailsEditorProps {
  value: DayDetails;
  onChange: (value: DayDetails) => void;
  suggestions: string[]; // bekannte Begleiter
}

const chip = (active: boolean) =>
  `h-9 px-3 rounded-full text-[15px] flex items-center gap-1.5 transition-colors active:scale-95 ${
    active ? 'bg-accent text-on-accent' : 'bg-fill/[0.12] dark:bg-fill/[0.24] text-label'
  }`;

/** Schnee, Wetter, Bewertung, Begleiter und Notiz – alles optional, nochmal tippen hebt die Auswahl auf. */
export const DayDetailsEditor: React.FC<DayDetailsEditorProps> = ({ value, onChange, suggestions }) => {
  const [name, setName] = useState('');
  const set = (patch: Partial<DayDetails>) => {
    haptic();
    onChange({ ...value, ...patch });
  };
  const companions = value.companions ?? [];
  const addCompanion = (raw: string) => {
    const n = raw.trim();
    if (n && !companions.some(c => c.toLowerCase() === n.toLowerCase())) set({ companions: [...companions, n] });
    setName('');
  };
  const openSuggestions = suggestions.filter(s => !companions.includes(s)).slice(0, 8);

  return (
    <>
      <ListGroup header="Schnee">
        <div className="p-3 flex flex-wrap gap-2">
          {SNOW_OPTIONS.map(o => (
            <button key={o.value} onClick={() => set({ snow: value.snow === o.value ? undefined : o.value })} className={chip(value.snow === o.value)} aria-pressed={value.snow === o.value}>
              <span>{o.emoji}</span> {o.label}
            </button>
          ))}
        </div>
      </ListGroup>

      <ListGroup header="Wetter">
        <div className="p-3 grid grid-cols-5 gap-2">
          {WEATHER_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => set({ weather: value.weather === o.value ? undefined : o.value })}
              aria-pressed={value.weather === o.value}
              aria-label={o.label}
              className={`h-14 rounded-[12px] flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 ${
                value.weather === o.value ? 'bg-accent/15 ring-2 ring-accent' : 'bg-fill/[0.08] dark:bg-fill/[0.2]'
              }`}
            >
              <span className="text-[22px] leading-none">{o.emoji}</span>
              <span className="text-[10px] text-secondary">{o.label}</span>
            </button>
          ))}
        </div>
      </ListGroup>

      <ListGroup header="Bewertung">
        <div className="px-3 py-2 flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => set({ rating: value.rating === n ? undefined : n })}
              aria-label={`${n} Sterne`}
              className="w-11 h-11 flex items-center justify-center active:scale-90 transition-transform"
            >
              <Star size={28} className={n <= (value.rating ?? 0) ? 'text-warning fill-warning' : 'text-tertiary'} />
            </button>
          ))}
        </div>
      </ListGroup>

      <ListGroup header="Unterwegs mit">
        <div className="p-3 space-y-3">
          {companions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {companions.map(c => (
                <button key={c} onClick={() => set({ companions: companions.filter(x => x !== c) })} className={chip(true)} aria-label={`${c} entfernen`}>
                  {c} <X size={14} />
                </button>
              ))}
            </div>
          )}
          <form
            className="flex gap-2"
            onSubmit={e => {
              e.preventDefault();
              addCompanion(name);
            }}
          >
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name hinzufügen"
              enterKeyHint="done"
              autoCapitalize="words"
              className="flex-1 min-w-0 h-9 px-3 rounded-[10px] bg-fill/[0.12] dark:bg-fill/[0.24] outline-none placeholder:text-secondary"
              aria-label="Begleiter hinzufügen"
            />
            <button type="submit" disabled={!name.trim()} className="w-9 h-9 rounded-full bg-accent text-on-accent flex items-center justify-center disabled:opacity-30" aria-label="Name übernehmen">
              <Plus size={18} />
            </button>
          </form>
          {openSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {openSuggestions.map(s => (
                <button key={s} onClick={() => addCompanion(s)} className="h-8 px-3 rounded-full border border-separator text-[13px] text-secondary active:bg-fill/20">
                  + {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </ListGroup>

      <ListGroup header="Notiz">
        <textarea
          value={value.note ?? ''}
          onChange={e => onChange({ ...value, note: e.target.value })}
          placeholder="Pistenzustand, Hütte, Highlights …"
          rows={3}
          className="w-full block bg-transparent px-4 py-3 outline-none resize-none placeholder:text-tertiary"
          aria-label="Notiz"
        />
      </ListGroup>
    </>
  );
};
