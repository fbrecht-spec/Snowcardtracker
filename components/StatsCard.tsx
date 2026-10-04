import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  valueClass?: string;
  className?: string;
  children?: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  colorClass = "text-blue-600", 
  valueClass = "text-3xl",
  className = "",
  children
}) => {
  return (
    <div className={`bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className={`${colorClass} opacity-80 p-2 bg-gray-50 rounded-xl`}>{icon}</div>
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{title}</h3>
        </div>
        <div className="flex flex-col">
          <div className={`font-black ${colorClass} tracking-tighter leading-none ${valueClass}`}>{value}</div>
          {subtitle && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-2 leading-tight">{subtitle}</p>}
        </div>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};