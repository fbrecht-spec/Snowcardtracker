import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface ToastData {
  id: number;
  message: string;
  action?: { label: string; onClick: () => void };
}

/** Kurze Meldung über der Tab-Leiste, optional mit Aktion (z. B. „Rückgängig“). */
export const Toast: React.FC<{ toast: ToastData | null; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+64px)] z-[60] flex justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="pointer-events-auto max-w-lg w-full flex items-center gap-3 rounded-2xl bg-[#1C1C1E]/90 dark:bg-[#2C2C2E]/90 backdrop-blur-xl text-white pl-4 pr-2 py-2 shadow-xl"
            role="status"
          >
            <span className="flex-1 text-[15px]">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action!.onClick();
                  onDismiss();
                }}
                className="px-3 py-1.5 rounded-xl text-[15px] font-semibold text-[#0A84FF] active:bg-white/10"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, text, action }) => (
  <div className="bg-card rounded-[10px] px-6 py-10 flex flex-col items-center text-center">
    <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-3">
      <Icon size={28} />
    </div>
    <h3 className="text-[17px] font-semibold">{title}</h3>
    <p className="text-[15px] text-secondary mt-1 max-w-[260px]">{text}</p>
    {action && (
      <button onClick={action.onClick} className="mt-4 h-11 px-5 rounded-full bg-accent text-white text-[15px] font-semibold active:opacity-70">
        {action.label}
      </button>
    )}
  </div>
);

/** Karte mit Titelzeile, für Diagramme und Kennzahlen. */
export const Card: React.FC<{ title?: React.ReactNode; trailing?: React.ReactNode; className?: string; children: React.ReactNode }> = ({ title, trailing, className, children }) => (
  <section className={`bg-card rounded-[14px] p-4 ${className ?? ''}`}>
    {(title || trailing) && (
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {trailing}
      </div>
    )}
    {children}
  </section>
);
