import React from 'react';
import { motion } from 'motion/react';
import { Resort } from '../types';
import { haptic } from '../lib/feedback';

interface TirolMapProps {
  resorts: Resort[];
  visits: Record<string, number>; // Besuche pro Gebiet (aktuelle Saison)
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

// Grober Ausschnitt Tirol (stilisierte Karte, nicht maßstabsgetreu)
const BOUNDS = { minLat: 46.8, maxLat: 47.7, minLng: 10.1, maxLng: 12.9 };

const pos = (lat: number, lng: number) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100,
  y: 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100,
});

const CITIES = [
  { name: 'Innsbruck', lat: 47.26, lng: 11.4 },
  { name: 'Kufstein', lat: 47.58, lng: 12.17 },
  { name: 'Landeck', lat: 47.13, lng: 10.56 },
  { name: 'Reutte', lat: 47.48, lng: 10.71 },
  { name: 'Lienz', lat: 46.83, lng: 12.77 },
];

export const TirolMap: React.FC<TirolMapProps> = ({ resorts, visits, selectedId, onSelect }) => (
  <div
    className="relative aspect-[2/1] overflow-hidden rounded-[14px] bg-gradient-to-br from-accent/[0.06] via-teal/[0.08] to-indigo/[0.06] dark:from-accent/[0.14] dark:via-teal/[0.1] dark:to-indigo/[0.14]"
    onClick={() => onSelect(undefined)}
  >
    {/* Angedeutete Bergketten und der Inn */}
    <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
      <path d="M0,50 L0,38 L8,30 L14,35 L22,26 L30,33 L38,24 L46,31 L55,22 L63,30 L72,21 L80,28 L88,20 L100,27 L100,50 Z" className="fill-label/[0.03]" />
      <path d="M0,50 L0,44 L10,38 L18,42 L28,36 L36,41 L46,35 L56,40 L66,34 L76,39 L86,33 L100,38 L100,50 Z" className="fill-label/[0.03]" />
      <path d="M5,42 Q20,38 35,32 L45,26 Q55,22 75,18 L95,12" fill="none" className="stroke-accent/30" strokeWidth="0.5" strokeLinecap="round" />
    </svg>

    {CITIES.map(c => {
      const { x, y } = pos(c.lat, c.lng);
      return (
        <div key={c.name} className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none" style={{ left: `${Math.min(x, 93)}%`, top: `${Math.min(y, 91)}%` }}>
          <span className="w-1 h-1 rounded-full bg-secondary/60" />
          <span className="text-[8px] font-medium text-secondary/80 mt-0.5">{c.name}</span>
        </div>
      );
    })}

    {resorts.map(resort => {
      if (resort.lat == null || resort.lng == null) return null;
      const { x, y } = pos(resort.lat, resort.lng);
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
  </div>
);
