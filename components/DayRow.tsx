import React from 'react';
import { Snowflake } from 'lucide-react';
import { SkiDay } from '../types';
import { formatDate, formatPrice } from '../lib/format';

interface DayRowProps {
  day: SkiDay;
  resortName: string;
  glacier?: boolean;
  onClick?: () => void;
}

/** Zeile im Logbuch: Kalenderblatt, Gebiet, Wochentag, Preis. */
export const DayRow: React.FC<DayRowProps> = ({ day, resortName, glacier, onClick }) => {
  const Tag = onClick ? 'button' : 'div';
  return (
  <Tag onClick={onClick} className={`w-full flex items-center text-left ${onClick ? 'pressable' : ''}`}>
    <div className="pl-4 py-2 shrink-0">
      <div className="w-11 h-11 rounded-[10px] bg-accent/10 text-accent flex flex-col items-center justify-center leading-none">
        <span className="text-[10px] font-semibold uppercase">{formatDate(day.date, { month: 'short' }).replace('.', '')}</span>
        <span className="text-[19px] font-semibold tabular-nums mt-0.5">{Number(day.date.split('-')[2])}</span>
      </div>
    </div>
    <div className="flex-1 min-w-0 flex items-center gap-3 min-h-[60px] pl-3 pr-4 border-b-[0.5px] border-separator group-last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-[17px] leading-[22px] flex items-center gap-1.5 min-w-0">
          <span className="truncate">{resortName}</span>
          {glacier && <Snowflake size={13} className="text-teal shrink-0" aria-label="Gletscher" />}
        </div>
        <div className="text-[13px] text-secondary">{formatDate(day.date, { weekday: 'long' })}</div>
      </div>
      <div className="text-[17px] text-secondary tabular-nums">{formatPrice(day.priceAtTime)}</div>
    </div>
  </Tag>
  );
};
