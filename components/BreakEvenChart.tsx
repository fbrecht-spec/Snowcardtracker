import React from 'react';
import { 
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { SkiDay, SnowcardTiers } from '../types';

interface BreakEvenChartProps {
  skiDays: SkiDay[];
  tiers: SnowcardTiers;
  activeTier: string;
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ skiDays, tiers, activeTier }) => {
  const sortedDays = [...skiDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let cumulative = 0;
  const data = sortedDays.map((day, index) => {
    cumulative += day.priceAtTime;
    return {
      name: `Tag ${index + 1}`,
      cost: cumulative,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        Noch keine Skitage erfasst
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#9CA3AF'}} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 12, fill: '#9CA3AF'}} 
            unit="€"
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          
          {/* Alle drei Tarife als Referenzlinien anzeigen */}
          <ReferenceLine 
            y={tiers.normal} 
            stroke="#EF4444" 
            strokeWidth={1}
            strokeDasharray="4 4" 
            label={{ value: 'Normal', position: 'insideTopRight', fill: '#EF4444', fontSize: 9, fontWeight: 900 }} 
          />
          <ReferenceLine 
            y={tiers.vorverkauf} 
            stroke="#F59E0B" 
            strokeWidth={1}
            strokeDasharray="4 4" 
            label={{ value: 'VVK', position: 'insideTopRight', fill: '#F59E0B', fontSize: 9, fontWeight: 900 }} 
          />
          <ReferenceLine 
            y={tiers.ermassigt} 
            stroke="#10B981" 
            strokeWidth={1}
            strokeDasharray="4 4" 
            label={{ value: 'Ermäßigt', position: 'insideTopRight', fill: '#10B981', fontSize: 9, fontWeight: 900 }} 
          />

          <Area 
            type="monotone" 
            dataKey="cost" 
            stroke="#3B82F6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCost)" 
            name="Gesamtwert"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};