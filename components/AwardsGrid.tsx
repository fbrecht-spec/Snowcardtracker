import React from 'react';
import { Award as AwardIcon, CheckCircle, Lock, Star, Crown, Zap, Map, Mountain } from 'lucide-react';
import { Award } from '../types';

interface AwardsGridProps {
  awards: Award[];
}

const getIcon = (iconName: string, size: number) => {
  switch (iconName) {
    case 'Star': return <Star size={size} />;
    case 'Crown': return <Crown size={size} />;
    case 'Zap': return <Zap size={size} />;
    case 'Map': return <Map size={size} />;
    case 'Mountain': return <Mountain size={size} />;
    default: return <AwardIcon size={size} />;
  }
};

export const AwardsGrid: React.FC<AwardsGridProps> = ({ awards }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {awards.map((award) => (
        <div 
          key={award.id} 
          className={`p-5 rounded-[2rem] border transition-all ${
            award.isUnlocked 
              ? 'bg-white border-blue-100 shadow-sm' 
              : 'bg-gray-50/50 border-gray-100 grayscale opacity-60'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className={`p-2.5 rounded-2xl ${award.isUnlocked ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-200 text-gray-400'}`}>
              {getIcon(award.icon, 18)}
            </div>
            {award.isUnlocked ? (
              <CheckCircle size={16} className="text-emerald-500" />
            ) : (
              <Lock size={16} className="text-gray-300" />
            )}
          </div>
          <h4 className="text-sm font-black text-gray-800 leading-tight mb-1">{award.title}</h4>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight leading-tight">
            {award.description}
          </p>
          {award.progress !== undefined && award.target !== undefined && !award.isUnlocked && (
            <div className="mt-3 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full rounded-full transition-all" 
                style={{ width: `${(award.progress / award.target) * 100}%` }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};