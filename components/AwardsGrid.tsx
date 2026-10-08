import React from 'react';
import { motion } from 'motion/react';
import { Award as AwardIcon, CalendarCheck, Coins, Compass, Crown, Flame, Gift, Heart, Lock, Map, Mountain, PiggyBank, Repeat, Star, Sun, Sunrise, Zap } from 'lucide-react';
import { Award } from '../types';

const ICONS = { Star, Crown, Zap, Map, Mountain, Award: AwardIcon, PiggyBank, Coins, Sunrise, Sun, Gift, Repeat, Flame, Compass, Heart, CalendarCheck };

const COLORS: Record<string, string> = {
  Star: 'bg-warning',
  Crown: 'bg-indigo',
  Zap: 'bg-danger',
  Map: 'bg-success',
  Mountain: 'bg-teal',
  Award: 'bg-accent',
  PiggyBank: 'bg-success',
  Coins: 'bg-warning',
  Sunrise: 'bg-warning',
  Sun: 'bg-warning',
  Gift: 'bg-danger',
  Repeat: 'bg-indigo',
  Flame: 'bg-danger',
  Compass: 'bg-teal',
  Heart: 'bg-danger',
  CalendarCheck: 'bg-indigo',
};

export const AwardsGrid: React.FC<{ awards: Award[] }> = ({ awards }) => {
  const sorted = [...awards].sort((a, b) => Number(b.isUnlocked) - Number(a.isUnlocked));
  return (
    <div className="grid grid-cols-2 gap-3">
      {sorted.map((award, i) => {
        const Icon = ICONS[award.icon as keyof typeof ICONS] ?? AwardIcon;
        const ratio = award.target ? Math.min(1, (award.progress ?? 0) / award.target) : 0;
        return (
          <motion.div
            key={award.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-[14px] p-3.5"
          >
            <div className="flex items-start justify-between">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-on-accent ${award.isUnlocked ? COLORS[award.icon] ?? 'bg-accent' : 'bg-fill/[0.2]'}`}>
                {award.isUnlocked ? <Icon size={18} /> : <Lock size={15} className="text-secondary" />}
              </span>
              {award.target && !award.isUnlocked && (
                <span className="text-[12px] text-secondary tabular-nums">{award.progress}/{award.target}</span>
              )}
            </div>
            <div className={`mt-2.5 text-[15px] font-semibold leading-tight ${award.isUnlocked ? '' : 'text-secondary'}`}>{award.title}</div>
            <div className="text-[12px] text-secondary leading-snug mt-0.5">{award.description}</div>
            {award.target && !award.isUnlocked && (
              <div className="mt-2.5 h-1 rounded-full bg-fill/[0.12] dark:bg-fill/[0.24] overflow-hidden">
                <motion.div className="h-full bg-accent rounded-full" initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} />
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
