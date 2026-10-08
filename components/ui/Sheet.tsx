import React, { useEffect } from 'react';
import { AnimatePresence, motion, useDragControls } from 'motion/react';

export interface SheetAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  cancel?: SheetAction;
  confirm?: SheetAction;
  children: React.ReactNode;
}

/** iOS-Bottom-Sheet: von unten einfahren, am Griff oder Kopf nach unten wischen schließt es. */
export const Sheet: React.FC<SheetProps> = ({ open, onClose, title, cancel, confirm, children }) => {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg max-h-[92dvh] flex flex-col bg-bg rounded-t-[14px] shadow-2xl"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose();
            }}
          >
            <div
              className="shrink-0 touch-none cursor-grab"
              onPointerDown={e => {
                // Auf Knöpfen kein Wischen starten, sonst verschluckt iOS den Tipp
                if ((e.target as HTMLElement).closest('button')) return;
                dragControls.start(e);
              }}
            >
              <div className="mx-auto mt-1.5 h-[5px] w-9 rounded-full bg-tertiary" />
              <div className="h-12 px-4 grid grid-cols-[1fr_auto_1fr] items-center">
                <div>
                  {cancel && (
                    <button onClick={cancel.onClick} className="text-[17px] text-accent active:opacity-50">{cancel.label}</button>
                  )}
                </div>
                <h2 className="text-[17px] font-semibold text-center">{title}</h2>
                <div className="text-right">
                  {confirm && (
                    <button
                      onClick={confirm.onClick}
                      disabled={confirm.disabled}
                      className="text-[17px] font-semibold text-accent disabled:text-tertiary active:opacity-50"
                    >
                      {confirm.label}
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 pt-2 pb-[calc(env(safe-area-inset-bottom)+24px)] space-y-7">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
