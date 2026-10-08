import React from 'react';
import { ChevronRight, RefreshCw, WifiOff } from 'lucide-react';
import { Card } from './ui/Feedback';
import { Resort } from '../types';
import { WeatherInfo, describeWeather, snowScore } from '../lib/weather';
import { haptic } from '../lib/feedback';

const MEDALS = ['🥇', '🥈', '🥉'];

const timeLabel = (ms?: number) =>
  ms ? new Date(ms).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) : '';

interface BestSnowCardProps {
  weather: WeatherInfo;
  resorts: Resort[];
  onOpenResort: (resort: Resort) => void;
}

/** „Wo liegt heute der beste Schnee?“ – Top 3 nach Schneehöhe und Neuschnee. */
export const BestSnowCard: React.FC<BestSnowCardProps> = ({ weather, resorts, onOpenResort }) => {
  const top = weather.ranking.filter(w => snowScore(w) > 0).slice(0, 3);
  const nameOf = (id: string) => resorts.find(r => r.id === id);

  return (
    <Card
      title="Wo liegt heute der beste Schnee?"
      trailing={
        <button
          onClick={() => {
            haptic();
            weather.refresh(true);
          }}
          disabled={weather.loading}
          aria-label="Wetter aktualisieren"
          className="w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-accent active:bg-fill/20"
        >
          <RefreshCw size={17} className={weather.loading ? 'animate-spin' : ''} />
        </button>
      }
    >
      {weather.ranking.length === 0 ? (
        <div className="flex items-center gap-3 text-[15px] text-secondary py-2">
          {weather.error ? <WifiOff size={20} className="shrink-0" /> : <RefreshCw size={20} className="shrink-0 animate-spin" />}
          {weather.error ? `${weather.error}. Wetter und Schnee erscheinen, sobald du online bist.` : 'Wetterdaten werden geladen …'}
        </div>
      ) : top.length === 0 ? (
        <p className="text-[15px] text-secondary py-1">Laut Modell liegt gerade in keinem Gebiet Schnee. Sobald es schneit, siehst du hier die Top 3.</p>
      ) : (
        <div className="-mx-4">
          {top.map((w, i) => {
            const resort = nameOf(w.resortId);
            if (!resort) return null;
            const desc = describeWeather(w.weatherCode);
            return (
              <button key={w.resortId} onClick={() => onOpenResort(resort)} className="group w-full flex items-center gap-3 pl-4 text-left pressable">
                <span className="text-[24px] shrink-0">{MEDALS[i]}</span>
                <span className="flex-1 min-w-0 flex items-center gap-3 py-2.5 pr-4 border-b-[0.5px] border-separator group-last:border-b-0">
                  <span className="flex-1 min-w-0">
                    <span className="block text-[17px] truncate">{resort.name}</span>
                    <span className="block text-[13px] text-secondary truncate">
                      {desc.emoji} {Math.round(w.temperature)}° · {w.newSnowCm > 0 ? `+${w.newSnowCm} cm Neuschnee` : 'kein Neuschnee'} · {w.elevation} m
                    </span>
                  </span>
                  <span className="text-right shrink-0">
                    <span className="block text-[20px] font-semibold tabular-nums leading-tight">{w.snowDepthCm} cm</span>
                    <span className="block text-[11px] text-secondary">Schneehöhe</span>
                  </span>
                  <ChevronRight size={16} className="text-tertiary shrink-0" />
                </span>
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[11px] text-secondary mt-3 leading-snug">
        {weather.fetchedAt && <>Stand {timeLabel(weather.fetchedAt)}{weather.error ? ' (offline)' : ''} · </>}
        Modellwerte für die Höhe des Gebietspunkts, kein Pistenbericht. Wetterdaten:{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">Open-Meteo.com</a>
      </p>
    </Card>
  );
};

/** Kompakte Zeile für die Übersicht. */
export const BestSnowTeaser: React.FC<{ weather: WeatherInfo; resorts: Resort[]; onClick: () => void }> = ({ weather, resorts, onClick }) => {
  const best = weather.ranking[0];
  const resort = best && resorts.find(r => r.id === best.resortId);
  if (!best || !resort || snowScore(best) === 0) return null;
  return (
    <button onClick={onClick} className="w-full bg-card rounded-[14px] p-4 flex items-center gap-3 text-left pressable">
      <span className="text-[28px]">{describeWeather(best.weatherCode).emoji}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] text-secondary">Bester Schnee heute</span>
        <span className="block text-[17px] font-semibold truncate">{resort.name}</span>
      </span>
      <span className="text-right shrink-0">
        <span className="block text-[17px] font-semibold tabular-nums">{best.snowDepthCm} cm</span>
        {best.newSnowCm > 0 && <span className="block text-[12px] text-accent">+{best.newSnowCm} cm neu</span>}
      </span>
      <ChevronRight size={16} className="text-tertiary" />
    </button>
  );
};
