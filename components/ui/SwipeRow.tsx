import React, { useRef, useState } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { Trash2 } from 'lucide-react';
import { haptic } from '../../lib/feedback';

const ACTION_WIDTH = 84;
const FULL_SWIPE = 200; // so weit durchwischen = direkt löschen

interface SwipeRowProps {
  onDelete: () => void;
  children: React.ReactNode;
}

/** Listenzeile, die sich nach links wischen lässt, um „Löschen“ freizulegen (ganz durchwischen löscht direkt). */
export const SwipeRow: React.FC<SwipeRowProps> = ({ onDelete, children }) => {
  const x = useMotionValue(0);
  const [open, setOpen] = useState(false);
  const dragged = useRef(false);
  const actionOpacity = useTransform(x, [-ACTION_WIDTH, -16, 0], [1, 0.4, 0]);

  const settle = (target: number) => {
    animate(x, target, { type: 'spring', damping: 32, stiffness: 400 });
    setOpen(target !== 0);
  };

  const remove = () => {
    haptic();
    animate(x, -window.innerWidth, { duration: 0.2 }).then(onDelete);
  };

  return (
    <div className="group relative overflow-hidden">
      <motion.button
        style={{ opacity: actionOpacity, pointerEvents: open ? 'auto' : 'none' }}
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        onClick={remove}
        className="absolute inset-y-0 right-0 w-full bg-danger text-white flex items-center justify-end"
        aria-label="Löschen"
      >
        <span className="w-[84px] flex flex-col items-center gap-0.5 text-[13px] font-medium">
          <Trash2 size={20} /> Löschen
        </span>
      </motion.button>
      <motion.div
        className="relative bg-card"
        style={{ x }}
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -ACTION_WIDTH, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }}
        onDragStart={() => { dragged.current = true; }}
        onDragEnd={(_, info) => {
          // Durchwischen löscht nur bei großer Strecke, nicht schon bei einem schnellen kurzen Wisch
          if (info.offset.x < -FULL_SWIPE) return remove();
          const flickOpen = info.velocity.x < -500;
          const flickClose = info.velocity.x > 500;
          settle(flickClose ? 0 : flickOpen || x.get() < -ACTION_WIDTH / 2 ? -ACTION_WIDTH : 0);
        }}
        onClickCapture={e => {
          // Loslassen nach einer Wischgeste ist kein Tipp; offene Zeile: Tippen schließt nur
          if (dragged.current || open) {
            e.stopPropagation();
            e.preventDefault();
            if (!dragged.current) settle(0);
          }
          dragged.current = false;
        }}
        onPointerDown={() => { dragged.current = false; }}
      >
        {children}
      </motion.div>
    </div>
  );
};
