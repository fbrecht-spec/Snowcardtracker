import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';

interface ListGroupProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** iOS „Inset Grouped“-Liste. */
export const ListGroup: React.FC<ListGroupProps> = ({ header, footer, children }) => (
  <section>
    {header && <h3 className="px-4 pb-1.5 text-[13px] uppercase tracking-[0.02em] text-secondary">{header}</h3>}
    <div className="bg-card rounded-[10px] overflow-hidden">{children}</div>
    {footer && <p className="px-4 pt-1.5 text-[13px] leading-snug text-secondary">{footer}</p>}
  </section>
);

/** Farbiges Symbol-Quadrat wie in den iOS-Einstellungen. */
export const IconBadge: React.FC<{ icon: LucideIcon; className: string; size?: number }> = ({ icon: Icon, className, size = 29 }) => (
  <span className={`shrink-0 rounded-[7px] text-white flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    <Icon size={size * 0.6} strokeWidth={2.2} />
  </span>
);

interface ListRowProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  value?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  accent?: boolean;
  /** Für Eingabefelder: Titel behält seine Breite, trailing füllt den Rest */
  stretchTrailing?: boolean;
  onClick?: () => void;
}

export const ListRow: React.FC<ListRowProps> = ({ title, subtitle, value, leading, trailing, chevron, destructive, accent, stretchTrailing, onClick }) => {
  const content = (
    <>
      {leading && <div className="pl-4 py-2 shrink-0">{leading}</div>}
      <div className={`flex-1 min-w-0 flex items-center gap-3 min-h-[44px] py-2.5 pr-4 ${leading ? 'pl-3' : 'pl-4'} border-b-[0.5px] border-separator group-last:border-b-0`}>
        <div className={stretchTrailing ? 'shrink-0 text-left' : 'flex-1 min-w-0 text-left'}>
          <div className={`text-[17px] leading-[22px] truncate ${destructive ? 'text-danger' : accent ? 'text-accent' : ''}`}>{title}</div>
          {subtitle && <div className="text-[13px] leading-[18px] text-secondary truncate">{subtitle}</div>}
        </div>
        {value !== undefined && <div className="text-[17px] text-secondary shrink-0 tabular-nums">{value}</div>}
        {stretchTrailing ? <div className="flex-1 min-w-0 flex justify-end">{trailing}</div> : trailing}
        {chevron && <ChevronRight size={18} className="text-tertiary shrink-0 -mr-1" />}
      </div>
    </>
  );
  return onClick ? (
    <button onClick={onClick} className="group w-full flex items-center pressable">{content}</button>
  ) : (
    <div className="group w-full flex items-center">{content}</div>
  );
};
