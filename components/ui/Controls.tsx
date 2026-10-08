import React, { useEffect, useId, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'motion/react';
import { haptic } from '../../lib/feedback';

interface SegmentedControlProps<T extends string> {
  options: { value: NoInfer<T>; label: string }[];
  value: T;
  onChange: (value: NoInfer<T>) => void;
}

export const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
  const id = useId();
  return (
    <div className="flex p-[2px] rounded-[9px] bg-fill/[0.12] dark:bg-fill/[0.24]">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => {
            if (o.value !== value) haptic();
            onChange(o.value);
          }}
          className="relative flex-1 h-7 text-[13px] font-medium"
        >
          {o.value === value && (
            <motion.span
              layoutId={`seg-${id}`}
              className="absolute inset-0 rounded-[7px] bg-card dark:bg-thumb shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
};

/** iOS-Schalter */
export const Switch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
  <button
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => {
      haptic();
      onChange(!checked);
    }}
    className={`relative shrink-0 w-[51px] h-[31px] rounded-full transition-colors duration-200 ${checked ? 'bg-success' : 'bg-fill/[0.16] dark:bg-fill/[0.32]'}`}
  >
    <motion.span
      className="absolute top-[2px] left-[2px] w-[27px] h-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)]"
      animate={{ x: checked ? 20 : 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 500 }}
    />
  </button>
);

/** Zahl, die beim Ändern sanft hoch- bzw. runterzählt. */
export const AnimatedNumber: React.FC<{ value: number; format: (n: number) => string; className?: string }> = ({ value, format, className }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      el.textContent = format(value);
      previous.current = value;
      return;
    }
    const controls = animate(previous.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => { el.textContent = format(v); },
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, format, reduceMotion]);

  return <span ref={ref} className={`tabular-nums ${className ?? ''}`}>{format(0)}</span>;
};

interface ProgressRingProps {
  progress: number; // 1 = 100 %
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
}

/** Fortschrittsring; über 100 % läuft eine zweite Runde in Grün. */
export const ProgressRing: React.FC<ProgressRingProps> = ({ progress, size = 128, stroke = 14, children }) => {
  const r = (size - stroke) / 2;
  const base = Math.min(progress, 1);
  const extra = Math.min(Math.max(progress - 1, 0), 1);
  const ring = (cls: string, value: number, delay = 0) => (
    <motion.circle
      cx={size / 2}
      cy={size / 2}
      r={r}
      fill="none"
      strokeWidth={stroke}
      strokeLinecap="round"
      className={cls}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: value }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ opacity: value > 0 ? 1 : 0 }}
    />
  );
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-fill/[0.14] dark:stroke-fill/[0.3]" />
        {ring(progress >= 1 ? 'stroke-success' : 'stroke-accent', base)}
        {extra > 0 && ring('stroke-teal', extra, 0.9)}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
};
