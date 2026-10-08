import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, Gift, Mountain, TrendingUp, X, Zap } from 'lucide-react';
import { SeasonStats } from '../lib/stats';
import { formatEuro, shortSeasonLabel } from '../lib/format';

interface SeasonRecapProps {
  open: boolean;
  seasonLabel: string;
  stats: SeasonStats;
  favorite?: { name: string; count: number };
  onClose: () => void;
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 200 } },
};

export const SeasonRecap: React.FC<SeasonRecapProps> = ({ open, seasonLabel, stats, favorite, onClose }) => {
  const tiles = [
    { icon: CalendarDays, value: String(stats.daysCount), label: 'Skitage', tint: 'text-cyan-200' },
    { icon: Gift, value: String(stats.freeDays), label: 'Gratis-Tage', tint: 'text-orange-200' },
    { icon: TrendingUp, value: formatEuro(stats.totalValue), label: 'Gesamtwert', tint: 'text-emerald-200' },
    { icon: Zap, value: formatEuro(Math.max(0, stats.net)), label: 'Ersparnis', tint: 'text-yellow-200' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] overflow-y-auto bg-gradient-to-br from-[#1e1b4b] via-[#1d4ed8] to-[#0891b2] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Saison-Rückblick"
        >
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="fixed right-4 top-[calc(env(safe-area-inset-top)+12px)] z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center active:bg-white/30"
          >
            <X size={20} />
          </button>
          <motion.div
            className="mx-auto max-w-lg px-6 pt-[calc(env(safe-area-inset-top)+64px)] pb-[calc(env(safe-area-inset-bottom)+40px)] space-y-6"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
          >
            <motion.div variants={item}>
              <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70">Saison {shortSeasonLabel(seasonLabel)}</div>
              <h2 className="text-[40px] leading-[1.05] font-extrabold tracking-tight mt-2">Dein Winter im Rückblick.</h2>
            </motion.div>

            <motion.div variants={item} className="grid grid-cols-2 gap-3">
              {tiles.map(t => (
                <div key={t.label} className="rounded-[20px] bg-white/[0.12] backdrop-blur-sm p-4">
                  <t.icon size={20} className={t.tint} />
                  <div className="text-[28px] font-bold mt-2 tabular-nums leading-none">{t.value}</div>
                  <div className="text-[12px] text-white/70 mt-1">{t.label}</div>
                </div>
              ))}
            </motion.div>

            {favorite && (
              <motion.div variants={item} className="rounded-[20px] bg-white/[0.12] p-5 flex items-center gap-4">
                <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Mountain size={24} />
                </span>
                <div>
                  <div className="text-[12px] text-white/70">Lieblingsgebiet</div>
                  <div className="text-[20px] font-bold leading-tight">{favorite.name}</div>
                  <div className="text-[13px] text-white/80">{favorite.count} Besuche</div>
                </div>
              </motion.div>
            )}

            <motion.p variants={item} className="text-[17px] leading-relaxed text-white/90 text-center pt-2">
              {stats.freeDays > 0
                ? `Du hast den Winter gerockt, Flo. Ab Tag ${stats.daysCount - stats.freeDays + 1} bist du gratis gefahren!`
                : stats.daysCount > 0
                  ? `Noch ${formatEuro(Math.max(0, -stats.net))} bis zum Break-even. Der Berg wartet, Flo!`
                  : 'Noch keine Skitage – der Winter kann kommen, Flo!'}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
