import React from 'react';
import { MapPin, Mountain as PeakIcon } from 'lucide-react';
import { Resort, SkiDay } from '../types';

interface TirolMapProps {
  resorts: Resort[];
  skiDays: SkiDay[];
}

export const TirolMap: React.FC<TirolMapProps> = ({ resorts, skiDays }) => {
  const visitedResortIds = new Set(skiDays.map(d => d.resortId));
  
  // Tirol bounding box (roughly)
  const minLat = 46.8;
  const maxLat = 47.7;
  const minLng = 10.1;
  const maxLng = 12.9;

  const getPos = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;
    return { x, y };
  };

  // Major Cities Coordinates
  const cities = [
    { name: 'Innsbruck', lat: 47.26, lng: 11.40 },
    { name: 'Kitzbühel', lat: 47.44, lng: 12.39 },
    { name: 'Landeck', lat: 47.13, lng: 10.56 },
    { name: 'Reutte', lat: 47.48, lng: 10.71 },
    { name: 'Kufstein', lat: 47.58, lng: 12.17 },
    { name: 'Lienz', lat: 46.83, lng: 12.77 }
  ];

  // Mountain Peaks
  const peaks = [
    { name: 'Zugspitze', lat: 47.42, lng: 10.98 },
    { name: 'Großglockner', lat: 47.07, lng: 12.70 },
    { name: 'Wildspitze', lat: 46.88, lng: 10.87 }
  ];

  return (
    <div className="relative aspect-[2/1] bg-blue-50/40 rounded-[2.5rem] border border-blue-100 overflow-hidden group shadow-inner">
      {/* Enhanced Tirol Background with Inn River */}
      <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full">
        {/* Main Shape */}
        <path 
          d="M5,25 Q15,10 30,15 T50,10 T70,20 T95,15 L95,45 Q80,48 60,40 T30,45 T5,40 Z" 
          className="fill-blue-900/5 stroke-blue-200/30"
          strokeWidth="0.5"
        />
        {/* Inn River - flowing through the main valley */}
        <path 
          d="M5,42 Q20,38 35,32 L45,26 Q55,22 75,18 L95,12" 
          fill="none" 
          className="stroke-blue-200/80" 
          strokeWidth="0.6"
          strokeDasharray="2,1"
        />
        {/* Drau River (East Tirol) */}
        <path 
          d="M85,45 L95,48" 
          fill="none" 
          className="stroke-blue-200/60" 
          strokeWidth="0.4"
        />
      </svg>

      {/* City Labels */}
      {cities.map(city => {
        const { x, y } = getPos(city.lat, city.lng);
        return (
          <div 
            key={city.name}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className="w-1 h-1 bg-gray-500 rounded-full mb-0.5" />
            <span className="text-[6px] font-black text-gray-500/70 uppercase tracking-tighter">{city.name}</span>
          </div>
        );
      })}

      {/* Mountain Peaks */}
      {peaks.map(peak => {
        const { x, y } = getPos(peak.lat, peak.lng);
        return (
          <div 
            key={peak.name}
            className="absolute flex items-center gap-0.5 pointer-events-none opacity-40"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <PeakIcon size={6} className="text-gray-400" />
            <span className="text-[5px] font-bold text-gray-400 italic">{peak.name}</span>
          </div>
        );
      })}

      {/* Resort Pins */}
      {resorts.map(resort => {
        if (!resort.lat || !resort.lng) return null;
        const { x, y } = getPos(resort.lat, resort.lng);
        const isVisited = visitedResortIds.has(resort.id);

        return (
          <div 
            key={resort.id}
            className="absolute transition-all duration-500 z-10"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div className={`relative ${isVisited ? 'scale-110' : 'scale-50 opacity-30'} group/pin`}>
              <MapPin 
                size={isVisited ? 18 : 12} 
                className={isVisited ? 'text-blue-600' : 'text-gray-400'} 
                strokeWidth={isVisited ? 3 : 2}
                fill={isVisited ? "white" : "none"}
              />
              {isVisited && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-1 opacity-0 group-hover/pin:opacity-100 transition-opacity whitespace-nowrap bg-blue-900 text-white text-[8px] font-black py-1 px-2 rounded-lg pointer-events-none z-20 shadow-xl">
                  {resort.name}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-6 flex items-center gap-4 bg-white/70 backdrop-blur-sm py-1 px-3 rounded-full border border-white/50 shadow-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span className="text-[7px] font-black text-blue-900/60 uppercase tracking-widest">Besucht</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-blue-200" />
          <span className="text-[7px] font-black text-blue-300 uppercase tracking-widest">Inn</span>
        </div>
      </div>
    </div>
  );
};