import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { BookOpen, ChartColumn, LayoutGrid, MountainSnow, Settings } from 'lucide-react';
import { Resort, SkiDay } from './types';
import { useSnowcard } from './lib/useSnowcard';
import { celebrate, haptic } from './lib/feedback';
import { TabBar, TabItem } from './components/ui/TabBar';
import { Toast, ToastData } from './components/ui/Feedback';
import { DaySheet } from './components/DaySheet';
import { ResortSheet } from './components/ResortSheet';
import { SeasonRecap } from './components/SeasonRecap';
import { OverviewView } from './views/OverviewView';
import { LogbookView } from './views/LogbookView';
import { ResortsView } from './views/ResortsView';
import { StatsView } from './views/StatsView';
import { SettingsView } from './views/SettingsView';

type Tab = 'overview' | 'logbook' | 'resorts' | 'stats' | 'settings';

const TABS: TabItem<Tab>[] = [
  { id: 'overview', label: 'Übersicht', icon: LayoutGrid },
  { id: 'logbook', label: 'Logbuch', icon: BookOpen },
  { id: 'resorts', label: 'Gebiete', icon: MountainSnow },
  { id: 'stats', label: 'Statistik', icon: ChartColumn },
  { id: 'settings', label: 'Einstellungen', icon: Settings },
];

type DaySheetState = { open: false; day?: SkiDay } | { open: true; day?: SkiDay };
type ResortSheetState = { open: boolean; resort?: Resort };

const App: React.FC = () => {
  const app = useSnowcard();
  const [tab, setTab] = useState<Tab>('overview');
  const [daySheet, setDaySheet] = useState<DaySheetState>({ open: false });
  const [resortSheet, setResortSheet] = useState<ResortSheetState>({ open: false });
  const [showRecap, setShowRecap] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Beim Tab-Wechsel nach oben springen
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const notify = useCallback((message: string, action?: ToastData['action']) => setToast({ id: Date.now(), message, action }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const openAddDay = () => setDaySheet({ open: true });
  const openEditDay = (day: SkiDay) => setDaySheet({ open: true, day });
  const closeDaySheet = () => setDaySheet(prev => ({ ...prev, open: false }));

  // Löschen ohne Rückfrage, dafür mit „Rückgängig“
  const deleteDay = (day: SkiDay) => {
    haptic();
    app.deleteDay(day.id);
    notify(`${app.resortNameOf(day)} gelöscht`, { label: 'Rückgängig', onClick: () => app.restoreDay(day) });
  };

  const favorite = useMemo(() => {
    const counts: Record<string, number> = {};
    app.seasonDays.forEach(d => { counts[d.resortId] = (counts[d.resortId] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (!top) return undefined;
    const day = app.seasonDays.find(d => d.resortId === top[0])!;
    return { name: app.resortNameOf(day), count: top[1] };
  }, [app]);

  const views: Record<Tab, React.ReactNode> = {
    overview: <OverviewView app={app} onAddDay={openAddDay} onEditDay={openEditDay} onShowLogbook={() => setTab('logbook')} />,
    logbook: <LogbookView app={app} onAddDay={openAddDay} onEditDay={openEditDay} onDeleteDay={deleteDay} />,
    resorts: <ResortsView app={app} onOpenResort={resort => setResortSheet({ open: true, resort })} />,
    stats: <StatsView app={app} onShowRecap={() => setShowRecap(true)} />,
    settings: <SettingsView app={app} notify={notify} />,
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {views[tab]}
        </motion.div>
      </AnimatePresence>

      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      <DaySheet
        open={daySheet.open}
        day={daySheet.day}
        app={app}
        onClose={closeDaySheet}
        onSaved={({ reachedBreakEven, isNew }) => {
          closeDaySheet();
          haptic();
          if (reachedBreakEven) {
            celebrate();
            notify('Break-even geschafft – ab jetzt fährst du gratis! 🎉');
          } else {
            notify(isNew ? 'Skitag hinzugefügt' : 'Änderungen gesichert');
          }
        }}
        onDelete={day => {
          closeDaySheet();
          deleteDay(day);
        }}
      />

      <ResortSheet
        open={resortSheet.open}
        resort={resortSheet.resort}
        app={app}
        onClose={() => setResortSheet(prev => ({ ...prev, open: false }))}
      />

      <SeasonRecap
        open={showRecap}
        seasonLabel={app.currentSeasonLabel}
        stats={app.seasonStats}
        favorite={favorite}
        onClose={() => setShowRecap(false)}
      />

      <Toast toast={toast} onDismiss={dismissToast} />
    </MotionConfig>
  );
};

export default App;
