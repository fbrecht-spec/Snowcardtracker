
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface MonthlyData {
  name: string;
  count: number;
}

interface MonthlyUsageChartProps {
  data: MonthlyData[];
}

export const MonthlyUsageChart: React.FC<MonthlyUsageChartProps> = ({ data }) => {
  // Check if there is any data to show
  const hasData = data.some(d => d.count > 0);

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
        Keine Monatsdaten verfügbar
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 11, fontWeight: 800, fill: '#94a3b8'}} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fontSize: 11, fontWeight: 800, fill: '#94a3b8'}}
            allowDecimals={false}
          />
          <Tooltip 
            cursor={{fill: '#f8fafc'}}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)', 
              fontWeight: 'bold',
              fontSize: '12px'
            }}
          />
          <Bar 
            dataKey="count" 
            fill="#3B82F6" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
            name="Skitage"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
