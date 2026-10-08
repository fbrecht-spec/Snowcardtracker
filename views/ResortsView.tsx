import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Plus, Search, Snowflake, X } from 'lucide-react';
import { Page, NavButton } from '../components/ui/Page';
import { ListGroup, ListRow } from '../components/ui/List';
import { SegmentedControl } from '../components/ui/Controls';
import { TirolMap } from '../components/TirolMap';
import { BestSnowCard } from '../components/BestSnowCard';
import { WeatherInfo } from '../lib/weather';
import { Resort } from '../types';
import { Snowcard } from '../lib/useSnowcard';
import { formatDayLong, formatEuro } from '../lib/format';

type SortKey = 'name' | 'visits' | 'price';

interface ResortsViewProps {
  app: Snowcard;
  weather: WeatherInfo;
  onOpenResort: (resort?: Resort) => void;
}

export const ResortsView: React.FC<ResortsViewProps> = ({ app, weather, onOpenResort }) => {
  const { sortedResorts, visitsByResort } = app;
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('name');
  const [selectedId, setSelectedId] = useState<string>();

  const seasonVisits = useMemo(
    () => Object.fromEntries(Object.entries(visitsByResort).map(([id, v]) => [id, v.season])),
    [visitsByResort],
  );
  const visitedCount = Object.values(seasonVisits).filter(Boolean).length;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = sortedResorts.filter(r => r.name.toLowerCase().includes(q));
    if (sort === 'visits') return [...filtered].sort((a, b) => (visitsByResort[b.id]?.total ?? 0) - (visitsByResort[a.id]?.total ?? 0));
    if (sort === 'price') return [...filtered].sort((a, b) => b.dailyPrice - a.dailyPrice);
    return filtered;
  }, [sortedResorts, visitsByResort, query, sort]);

  const selected = sortedResorts.find(r => r.id === selectedId);

  const subtitleOf = (r: Resort) => {
    const v = visitsByResort[r.id];
    if (!v?.total) return 'Noch nicht besucht';
    return `${v.season} diese Saison · ${v.total} gesamt`;
  };

  return (
    <Page
      title="Gebiete"
      subtitle={`${visitedCount} von ${sortedResorts.length} diese Saison besucht`}
      trailing={<NavButton onClick={() => onOpenResort()} label="Gebiet hinzufügen"><Plus size={20} strokeWidth={2.5} /></NavButton>}
    >
      <BestSnowCard weather={weather} resorts={sortedResorts} onOpenResort={onOpenResort} />

      <section>
        <TirolMap resorts={sortedResorts} visits={seasonVisits} selectedId={selectedId} onSelect={setSelectedId} />
        <AnimatePresence mode="popLayout">
          {selected && (
            <motion.button
              key={selected.id}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              onClick={() => onOpenResort(selected)}
              className="mt-3 w-full bg-card rounded-[14px] p-4 flex items-center gap-3 text-left pressable"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[17px] font-semibold truncate flex items-center gap-1.5">
                  {selected.name}
                  {selected.glacier && <Snowflake size={14} className="text-teal" />}
                </div>
                <div className="text-[13px] text-secondary">
                  {formatEuro(selected.dailyPrice, true)} · {subtitleOf(selected)}
                  {visitsByResort[selected.id]?.lastDate && ` · zuletzt ${formatDayLong(visitsByResort[selected.id]!.lastDate!)}`}
                </div>
              </div>
              <ChevronRight size={18} className="text-tertiary" />
            </motion.button>
          )}
        </AnimatePresence>
        <p className="px-4 pt-1.5 text-[13px] text-secondary">Zahlen = Besuche diese Saison. Punkt antippen für Details.</p>
      </section>

      <div className="space-y-3">
        <label className="flex items-center gap-2 h-9 px-2.5 rounded-[10px] bg-fill/[0.12] dark:bg-fill/[0.24] text-secondary">
          <Search size={17} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Suchen"
            className="flex-1 bg-transparent text-label outline-none placeholder:text-secondary"
            aria-label="Gebiete durchsuchen"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Suche löschen" className="text-secondary"><X size={16} /></button>
          )}
        </label>
        <SegmentedControl
          options={[{ value: 'name', label: 'Name' }, { value: 'visits', label: 'Besuche' }, { value: 'price', label: 'Preis' }]}
          value={sort}
          onChange={setSort}
        />
      </div>

      <ListGroup footer={list.length === 0 ? 'Kein Gebiet gefunden.' : 'Preise tippst du in der Detailansicht an. Sie gelten für neue Skitage.'}>
        {list.map(r => (
          <ListRow
            key={r.id}
            title={<span className="flex items-center gap-1.5 min-w-0"><span className="truncate">{r.name}</span>{r.glacier && <Snowflake size={13} className="text-teal shrink-0" />}</span>}
            subtitle={subtitleOf(r)}
            value={formatEuro(r.dailyPrice, true)}
            chevron
            onClick={() => onOpenResort(r)}
          />
        ))}
      </ListGroup>
    </Page>
  );
};
