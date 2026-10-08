import { LucideIcon } from 'lucide-react';
import { haptic } from '../../lib/feedback';

export interface TabItem<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

interface TabBarProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: NoInfer<T>) => void;
}

export const TabBar = <T extends string>({ tabs, active, onChange }: TabBarProps<T>) => (
  <nav className="fixed bottom-0 inset-x-0 z-40 bg-bar/80 backdrop-blur-xl backdrop-saturate-150 border-t-[0.5px] border-separator/70 pb-[env(safe-area-inset-bottom)]">
    <div className="mx-auto max-w-lg flex">
      {tabs.map(tab => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            onClick={() => {
              if (!isActive) haptic();
              onChange(tab.id);
            }}
            aria-current={isActive ? 'page' : undefined}
            className={`flex-1 h-[52px] pt-1.5 flex flex-col items-center gap-0.5 transition-colors ${isActive ? 'text-accent' : 'text-secondary'}`}
          >
            <tab.icon size={24} strokeWidth={isActive ? 2.2 : 1.8} />
            <span className="text-[10px] font-medium tracking-[0.01em]">{tab.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);
