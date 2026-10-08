import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarDays, Gift, Loader2, Mountain, Share, Snowflake, Star, TrendingUp, Users, X, Zap } from 'lucide-react';
import { RecapData, createRecapImage, recapQuote } from '../lib/recapImage';
import { shareOrDownload } from '../lib/backup';
import { formatEuro, shortSeasonLabel } from '../lib/format';

interface SeasonRecapProps {
  open: boolean;
  data: RecapData;
  onClose: () => void;
  onShared: (result: 'shared' | 'downloaded') => void;
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, damping: 22, stiffness: 200 } },
};

export const SeasonRecap: React.FC<SeasonRecapProps> = ({ open, data, onClose, onShared }) => {
  const { stats } = data;
  const [image, setImage] = useState<File | null>(null);

  // Bild schon beim Öffnen erzeugen: iOS erlaubt das Teilen-Menü nur direkt beim Tippen,
  // nicht erst nach einer längeren asynchronen Berechnung.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setImage(null);
    createRecapImage(data)
      .then(file => { if (!cancelled) setImage(file); })
      .catch(e => console.error('Rückblick-Bild fehlgeschlagen:', e));
    return () => { cancelled = true; };
  }, [open]);

  const share = async () => {
    if (!image) return;
    const result = await shareOrDownload(image);
    if (result !== 'cancelled') onShared(result);
  };

  const tiles = [
    { icon: CalendarDays, value: String(stats.daysCount), label: 'Skitage', tint: 'text-cyan-200' },
    { icon: Gift, value: String(stats.freeDays), label: 'Gratis-Tage', tint: 'text-orange-200' },
    { icon: TrendingUp, value: formatEuro(stats.totalValue), label: 'Gesamtwert', tint: 'text-emerald-200' },
    { icon: Zap, value: formatEuro(Math.max(0, stats.net)), label: 'Ersparnis', tint: 'text-yellow-200' },
  ];

  const highlights = [
    data.favorite && { icon: Mountain, label: 'Lieblingsgebiet', value: data.favorite.name, extra: `${data.favorite.count} Besuche` },
    data.buddy && { icon: Users, label: 'Ski-Buddy', value: data.buddy.name, extra: `${data.buddy.count} gemeinsame Tage` },
    data.powderDays > 0 && { icon: Snowflake, label: 'Pulvertage', value: String(data.powderDays), extra: 'Tage im Pulverschnee' },
    data.avgRating > 0 && { icon: Star, label: 'Ø Bewertung', value: `${data.avgRating.toFixed(1).replace('.', ',')} ★`, extra: 'von 5 Sternen' },
  ].filter(Boolean) as { icon: typeof Mountain; label: string; value: string; extra: string }[];

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
            variants={{ show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
          >
            <motion.div variants={item}>
              <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/70">Saison {shortSeasonLabel(data.seasonLabel)}</div>
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

            {highlights.map(h => (
              <motion.div key={h.label} variants={item} className="rounded-[20px] bg-white/[0.12] p-4 flex items-center gap-4">
                <span className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <h.icon size={22} />
                </span>
                <div className="min-w-0">
                  <div className="text-[12px] text-white/70">{h.label}</div>
                  <div className="text-[19px] font-bold leading-tight truncate">{h.value}</div>
                  <div className="text-[13px] text-white/80">{h.extra}</div>
                </div>
              </motion.div>
            ))}

            <motion.p variants={item} className="text-[17px] leading-relaxed text-white/90 text-center pt-2">
              {recapQuote(data)}
            </motion.p>

            <motion.div variants={item}>
              <button
                onClick={share}
                disabled={!image}
                className="w-full h-[52px] rounded-full bg-white text-[#1d4ed8] text-[17px] font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-70"
              >
                {image ? <Share size={20} /> : <Loader2 size={20} className="animate-spin" />}
                Als Bild teilen
              </button>
              <p className="text-[12px] text-white/60 text-center mt-2">Story-Format für WhatsApp & Instagram</p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
