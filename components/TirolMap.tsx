import React from 'react';
import { motion } from 'motion/react';
import { Resort } from '../types';
import { haptic } from '../lib/feedback';
import { MAP_H, MAP_W, TIROL_PATH, projectPercent } from './tirolShape';

interface TirolMapProps {
  resorts: Resort[];
  visits: Record<string, number>; // Besuche pro Gebiet (aktuelle Saison)
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

const CITIES = [
  { name: 'Innsbruck', lat: 47.26, lng: 11.4 },
  { name: 'Kufstein', lat: 47.58, lng: 12.17 },
  { name: 'Landeck', lat: 47.14, lng: 10.57 },
  { name: 'Reutte', lat: 47.48, lng: 10.72 },
  { name: 'Lienz', lat: 46.83, lng: 12.77 },
];

// Verlauf des Inn über Orte am Fluss (vereinfacht)
const INN: [number, number][] = [
  [46.97, 10.54], [47.14, 10.57], [47.24, 10.74], [47.29, 10.95], [47.31, 11.07], [47.27, 11.24],
  [47.27, 11.39], [47.28, 11.51], [47.35, 11.71], [47.39, 11.78], [47.49, 12.07], [47.58, 12.17], [47.64, 12.2],
];

const toSvg = (lat: number, lng: number) => {
  const p = projectPercent(lat, lng);
  return `${((p.x / 100) * MAP_W).toFixed(1)},${((p.y / 100) * MAP_H).toFixed(1)}`;
};
const INN_PATH = `M${INN.map(([lat, lng]) => toSvg(lat, lng)).join('L')}`;

export const TirolMap: React.FC<TirolMapProps> = ({ resorts, visits, selectedId, onSelect }) => (
  <div
    className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-accent/[0.05] to-teal/[0.08] dark:from-accent/[0.12] dark:to-teal/[0.1]"
    style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}
    onClick={() => onSelect(undefined)}
  >
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 w-full h-full" aria-hidden="true">
      <path d={TIROL_PATH} className="fill-card stroke-accent/40" strokeWidth={2.5} strokeLinejoin="round" fillRule="evenodd" />
      <path d={INN_PATH} fill="none" className="stroke-accent/35" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </svg>

    {CITIES.map(c => {
      const { x, y } = projectPercent(c.lat, c.lng);
      return (
        <div key={c.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
          <span className="w-1 h-1 rounded-full bg-secondary/70" />
          <span className="text-[8px] font-medium text-secondary mt-0.5">{c.name}</span>
        </div>
      );
    })}

    {resorts.map(resort => {
      if (resort.lat == null || resort.lng == null) return null;
      const { x, y } = projectPercent(resort.lat, resort.lng);
      const count = visits[resort.id] ?? 0;
      const selected = resort.id === selectedId;
      return (
        <button
          key={resort.id}
          aria-label={`${resort.name}, ${count} Besuche`}
          onClick={e => {
            e.stopPropagation();
            haptic();
            onSelect(selected ? undefined : resort.id);
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center"
          style={{ left: `${x}%`, top: `${y}%`, zIndex: selected ? 20 : count ? 10 : 1 }}
        >
          <motion.span
            initial={false}
            animate={{ scale: selected ? 1.35 : 1 }}
            transition={{ type: 'spring', damping: 18, stiffness: 400 }}
            className={
              count
                ? `min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-md ring-2 ring-card ${resort.glacier ? 'bg-teal' : 'bg-accent'}`
                : `w-2.5 h-2.5 rounded-full ring-2 ring-card ${selected ? 'bg-secondary' : 'bg-tertiary'}`
            }
          >
            {count > 0 && count}
          </motion.span>
        </button>
      );
    })}

    <span className="absolute bottom-1 right-2 text-[7px] text-secondary/70 pointer-events-none">Grenzen: Statistik Austria, CC BY 4.0</span>
  </div>
);
