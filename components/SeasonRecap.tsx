
import React from 'react';
import { Zap, Mountain, Star, Calendar, X, Gift, TrendingUp } from 'lucide-react';
import { SkiDay, Resort } from '../types';

interface SeasonRecapProps {
  days: SkiDay[];
  resorts: Resort[];
  seasonLabel: string;
  savings: number;
  freeDays: number;
  totalValue: number;
  onClose: () => void;
}

export const SeasonRecap: React.FC<SeasonRecapProps> = ({ days, resorts, seasonLabel, savings, freeDays, totalValue, onClose }) => {
  const topResortId = days.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.resortId] = (acc[curr.resortId] || 0) + 1;
    return acc;
  }, {});

  const topResort = Object.entries(topResortId).sort((a,b) => b[1] - a[1])[0];
  const resortName = resorts.find(r => r.id === topResort?.[0])?.name || days.find(d => d.resortId === topResort?.[0])?.resortName || 'Unbekannt';

  return (
    <div className="fixed inset-0 bg-blue-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-sm relative py-12">
        <button onClick={onClose} className="absolute top-0 right-0 text-white opacity-60 hover:opacity-100 transition-opacity p-2">
          <X size={32} />
        </button>

        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-8 rounded-[3rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          
          <div className="space-y-2 text-center relative z-10">
            <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
              Season Recap {seasonLabel}
            </div>
            <h2 className="text-4xl font-black italic tracking-tighter leading-none">DEIN WINTER IM RÜCKBLICK.</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 relative z-10">
             <div className="bg-white/10 backdrop-blur-sm p-5 rounded-[2rem] flex flex-col items-center text-center">
               <Calendar size={20} className="text-cyan-200 mb-2" />
               <div className="text-3xl font-black">{days.length}</div>
               <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Skitage</div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-5 rounded-[2rem] flex flex-col items-center text-center border border-white/10">
               <Gift size={20} className="text-orange-300 mb-2" />
               <div className="text-3xl font-black">{freeDays}</div>
               <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Gratis-Tage</div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-5 rounded-[2rem] flex flex-col items-center text-center">
               <TrendingUp size={20} className="text-emerald-300 mb-2" />
               <div className="text-2xl font-black">{totalValue.toFixed(0)}€</div>
               <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Gesamtwert</div>
             </div>
             <div className="bg-white/10 backdrop-blur-sm p-5 rounded-[2rem] flex flex-col items-center text-center bg-emerald-500/20">
               <Zap size={20} className="text-yellow-300 mb-2" />
               <div className="text-2xl font-black">+{savings.toFixed(0)}€</div>
               <div className="text-[9px] font-bold opacity-60 uppercase tracking-widest">Ersparnis</div>
             </div>
          </div>

          <div className="bg-white/10 p-6 rounded-[2.5rem] relative group border border-white/5">
             <Mountain size={24} className="text-white mb-2 opacity-40" />
             <div className="text-[10px] font-bold opacity-60 uppercase tracking-widest mb-1">Lieblingsgebiet</div>
             <div className="text-2xl font-black leading-tight">{resortName}</div>
             <div className="mt-3 text-[10px] font-black bg-white/20 inline-block px-3 py-1 rounded-full">{topResort?.[1]} Besuche</div>
          </div>

          <div className="text-center pt-2 relative z-10">
            <Star className="mx-auto text-yellow-400 mb-2 animate-bounce" size={32} fill="currentColor" />
            <p className="text-sm font-bold opacity-80 leading-relaxed italic">
              "Du hast den Winter gerockt, Flo. {freeDays > 0 ? `Ab Tag ${days.length - freeDays} bist du pures Gold gefahren!` : 'Die Snowcard lohnt sich!'}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
