
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

interface ResortUsageData {
  name: string;
  count: number;
}

interface ResortUsageChartProps {
  data: ResortUsageData[];
}

const COLORS = ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'];

export const ResortUsageChart: React.FC<ResortUsageChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
        Keine Daten verfügbar
      </div>
    );
  }

  // Limit to top 8 resorts for readability if needed, or just show all
  const chartData = data.slice(0, 8);

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false} 
            width={100}
            tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}}
          />
          <Tooltip 
            cursor={{fill: '#F8FAFC'}}
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontWeight: 'bold' }}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
