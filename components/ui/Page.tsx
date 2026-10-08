import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../lib/theme';
import { haptic } from '../../lib/feedback';

interface PageProps {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Seite mit iOS-„Large Title“: Der große Titel scrollt mit, danach erscheint
 * er klein in der durchscheinenden Navigationsleiste oben.
 */
export const Page: React.FC<PageProps> = ({ title, subtitle, trailing, children }) => {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-30 pt-[env(safe-area-inset-top)]">
        <motion.div
          className="absolute inset-0 bg-bar/80 backdrop-blur-xl backdrop-saturate-150 border-b-[0.5px] border-separator/70"
          initial={false}
          animate={{ opacity: compact ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
        <div className="relative mx-auto max-w-lg h-11 px-4 flex items-center justify-between">
          <ThemeToggle />
          <motion.div
            className="absolute inset-x-16 text-center text-[17px] font-semibold truncate pointer-events-none"
            initial={false}
            animate={{ opacity: compact ? 1 : 0, y: compact ? 0 : 6 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.div>
          <div className="relative flex items-center gap-2">{trailing}</div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pt-[calc(env(safe-area-inset-top)+44px)] pb-[calc(env(safe-area-inset-bottom)+104px)]">
        <h1 className="text-[34px] leading-[41px] font-bold tracking-[0.01em] dark:[text-shadow:0_0_18px_rgb(var(--label)/0.45)]">{title}</h1>
        {subtitle && <div className="text-[15px] text-secondary mt-0.5">{subtitle}</div>}
        <div className="mt-5 space-y-7">{children}</div>
      </main>
    </>
  );
};

/** Runder Aktionsknopf für die Navigationsleiste (z. B. „+“). */
export const NavButton: React.FC<{ onClick: () => void; label: string; children: React.ReactNode }> = ({ onClick, label, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="h-8 min-w-8 px-2 rounded-full bg-accent text-on-accent flex items-center justify-center gap-1 text-[15px] font-semibold active:opacity-60 transition-opacity"
  >
    {children}
  </button>
);

/** Schnellumschalter Hell/Dunkel oben links in jeder Seite. */
const ThemeToggle: React.FC = () => {
  const { resolved, toggle } = useTheme();
  const dark = resolved === 'dark';
  return (
    <button
      onClick={() => {
        haptic();
        toggle();
      }}
      aria-label={dark ? 'Hellen Modus einschalten' : 'Dunklen Modus einschalten'}
      className="relative w-8 h-8 rounded-full flex items-center justify-center text-accent bg-fill/[0.12] dark:bg-fill/[0.16] active:opacity-60 transition-opacity"
    >
      <motion.span key={resolved} initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 14, stiffness: 300 }}>
        {dark ? <Sun size={18} /> : <Moon size={17} />}
      </motion.span>
    </button>
  );
};
