import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Settings, History, LayoutDashboard, Search, Trash2, RefreshCw, Euro, Calendar, Archive, Award as AwardIcon, Map as MapIcon, CloudSnow, Share2, TrendingDown, Target, TrendingUp, Gift, BarChart3, PlusCircle, Check } from 'lucide-react';
import { AppState, SkiDay, Resort, SnowcardTierKey, SnowcardTiers, ArchivedSeason, Award } from './types';
import { INITIAL_RESORTS, DEFAULT_SNOWCARD_TIERS } from './constants';
import { StatsCard } from './components/StatsCard';
import { BreakEvenChart } from './components/BreakEvenChart';
import { ResortUsageChart } from './components/ResortUsageChart';
import { MonthlyUsageChart } from './components/MonthlyUsageChart';
import { AwardsGrid } from './components/AwardsGrid';
import { TirolMap } from './components/TirolMap';
import { SeasonRecap } from './components/SeasonRecap';
import { fetchLatestResortPrice } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'resorts' | 'settings'>('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('snowcard_tracker_state_v3');
    if (saved) return JSON.parse(saved);
    return {
      settings: {
        snowcardTiers: DEFAULT_SNOWCARD_TIERS,
        activeTier: 'normal',
        resorts: INITIAL_RESORTS
      },
      skiDays: [],
      archivedSeasons: []
    };
  });

  const [isAddingDay, setIsAddingDay] = useState(false);
  const [isAddingResort, setIsAddingResort] = useState(false);
  const [newResortName, setNewResortName] = useState('');
  const [newResortPrice, setNewResortPrice] = useState(65);
  const [showRecap, setShowRecap] = useState(false);
  const [newDayDate, setNewDayDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedResortId, setSelectedResortId] = useState('');
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);

  const getSeasonLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return month >= 10 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
  };

  const currentSeasonLabel = useMemo(() => getSeasonLabel(new Date().toISOString()), []);

  const sortedResorts = useMemo(() => {
    return [...state.settings.resorts].sort((a, b) => a.name.localeCompare(b.name));
  }, [state.settings.resorts]);

  useEffect(() => {
    if (!selectedResortId && sortedResorts.length > 0) {
      setSelectedResortId(sortedResorts[0].id);
    }
  }, [sortedResorts, selectedResortId]);

  const awards = useMemo<Award[]>(() => {
    const visitedCount = new Set(state.skiDays.map(d => d.resortId)).size;
    const daysCount = state.skiDays.length;
    const hasGlacier = state.skiDays.some(d => {
      const r = state.settings.resorts.find(res => res.id === d.resortId);
      return r?.name.toLowerCase().includes('gletscher');
    });

    const allAwards: Award[] = [
      { id: '1', title: 'First Tracks', description: 'Dein erster Tag im Schnee', icon: 'Award', isUnlocked: daysCount >= 1, progress: daysCount, target: 1 },
      { id: '10', title: 'Snow-Fan', description: 'Stolze 10 Skitage geloggt', icon: 'Star', isUnlocked: daysCount >= 10, progress: daysCount, target: 10 },
      { id: '15', title: 'Stammgast', description: '15 Tage! Der Berg ruft', icon: 'Zap', isUnlocked: daysCount >= 15, progress: daysCount, target: 15 },
      { id: '20', title: 'Season Pro', description: '20 Skitage erreicht', icon: 'Award', isUnlocked: daysCount >= 20, progress: daysCount, target: 20 },
      { id: '25', title: 'Pisten-Profi', description: '25 Tage! Fast ein Profi', icon: 'Star', isUnlocked: daysCount >= 25, progress: daysCount, target: 25 },
      { id: '30', title: 'Pisten-Liebe', description: 'Stolze 30 Tage im Schnee!', icon: 'Star', isUnlocked: daysCount >= 30, progress: daysCount, target: 30 },
      { id: '35', title: 'Schnee-Süchtiger', description: '35 Tage! Wahnsinn', icon: 'Zap', isUnlocked: daysCount >= 35, progress: daysCount, target: 35 },
      { id: '40', title: 'Tirol Legende', description: 'Extremer Winter: 40 Tage!', icon: 'Crown', isUnlocked: daysCount >= 40, progress: daysCount, target: 40 },
      { id: 'hopper', title: 'Resort Hopper', description: 'Besuche 5 Gebiete', icon: 'Map', isUnlocked: visitedCount >= 5, progress: visitedCount, target: 5 },
      { id: 'glacier', title: 'Gletscher-König', description: 'Skifahren auf über 3000m', icon: 'Mountain', isUnlocked: hasGlacier }
    ];

    return allAwards.sort((a, b) => {
      const aTarget = typeof a.target === 'number' ? a.target : 999;
      const bTarget = typeof b.target === 'number' ? b.target : 999;
      if (a.id === 'hopper' || a.id === 'glacier') return 1;
      if (b.id === 'hopper' || b.id === 'glacier') return -1;
      return aTarget - bTarget;
    });
  }, [state.skiDays, state.settings.resorts]);

  useEffect(() => {
    localStorage.setItem('snowcard_tracker_state_v3', JSON.stringify(state));
  }, [state]);

  const activePrice = useMemo(() => state.settings.snowcardTiers[state.settings.activeTier], [state.settings.snowcardTiers, state.settings.activeTier]);
  const totalSpent = useMemo(() => state.skiDays.reduce((sum, day) => sum + day.priceAtTime, 0), [state.skiDays]);
  const avgCostPerDay = useMemo(() => state.skiDays.length > 0 ? (activePrice / state.skiDays.length) : 0, [activePrice, state.skiDays.length]);
  
  const breakEvenStatus = useMemo(() => {
    const diff = activePrice - totalSpent;
    const isProfitable = diff <= 0;
    
    let cumulative = 0;
    let breakEvenIndex = -1;
    const sortedDays = [...state.skiDays].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sortedDays.forEach((day, index) => {
      cumulative += day.priceAtTime;
      if (cumulative >= activePrice && breakEvenIndex === -1) {
        breakEvenIndex = index;
      }
    });

    const freeDaysCount = breakEvenIndex !== -1 ? (state.skiDays.length - 1 - breakEvenIndex) : 0;
    
    // Progress calculation for the bar
    // If not profitable: baseProgress is blue part.
    // If profitable: we show green part (up to activePrice) and turquoise part (rest).
    const baseProgress = isProfitable ? 100 : (totalSpent / activePrice) * 100;
    const profitRatio = isProfitable ? ((totalSpent - activePrice) / totalSpent) * 100 : 0;
    const baseRatio = isProfitable ? (activePrice / totalSpent) * 100 : baseProgress;

    return { 
      diff: Math.abs(diff), 
      isProfitable, 
      daysCount: state.skiDays.length, 
      savings: isProfitable ? Math.abs(totalSpent - activePrice) : 0,
      totalValue: totalSpent,
      freeDaysCount: Math.max(0, freeDaysCount),
      baseProgress,
      baseRatio,
      profitRatio
    };
  }, [totalSpent, activePrice, state.skiDays]);

  const resortUsageData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.skiDays.forEach(day => { counts[day.resortId] = (counts[day.resortId] || 0) + 1; });
    return Object.entries(counts).map(([id, count]) => ({
      name: state.settings.resorts.find(r => r.id === id)?.name.split('/')[0].trim() || 'Unbekannt',
      count
    })).sort((a, b) => b.count - a.count);
  }, [state.skiDays, state.settings.resorts]);

  const monthlyUsageData = useMemo(() => {
    const counts: Record<string, number> = {};
    const monthOrder = ['10', '11', '12', '01', '02', '03', '04', '05'];
    state.skiDays.forEach(day => {
      const month = day.date.split('-')[1];
      counts[month] = (counts[month] || 0) + 1;
    });
    return monthOrder.map(m => ({
      name: new Date(2024, parseInt(m) - 1, 1).toLocaleDateString('de-DE', { month: 'short' }).toUpperCase(),
      count: counts[m] || 0
    }));
  }, [state.skiDays]);

  const addSkiDay = () => {
    const resort = state.settings.resorts.find(r => r.id === selectedResortId);
    if (!resort) return;
    const newDay: SkiDay = { id: crypto.randomUUID(), date: newDayDate, resortId: selectedResortId, priceAtTime: resort.dailyPrice };
    setState(prev => ({ ...prev, skiDays: [...prev.skiDays, newDay] }));
    setIsAddingDay(false);
  };

  const deleteSkiDay = (id: string) => setState(prev => ({ ...prev, skiDays: prev.skiDays.filter(d => d.id !== id) }));
  
  const archiveCurrentSeason = () => {
    if (state.skiDays.length === 0) return;
    if (!confirm(`Möchtest du die Saison archivieren?`)) return;
    const archiveEntry: ArchivedSeason = { seasonLabel: currentSeasonLabel, days: state.skiDays, snowcardPrice: activePrice, totalValue: totalSpent, profit: Math.max(0, totalSpent - activePrice) };
    setState(prev => ({ ...prev, archivedSeasons: [archiveEntry, ...prev.archivedSeasons], skiDays: [] }));
    setActiveTab('history');
  };

  const addResort = () => {
    if (!newResortName.trim()) return;
    const newResort: Resort = { id: crypto.randomUUID(), name: newResortName, dailyPrice: newResortPrice };
    setState(prev => ({ ...prev, settings: { ...prev.settings, resorts: [...prev.settings.resorts, newResort] } }));
    setNewResortName('');
    setIsAddingResort(false);
  };

  const updateSnowcardTierPrice = (tier: SnowcardTierKey, price: number) => setState(prev => ({ ...prev, settings: { ...prev.settings, snowcardTiers: { ...prev.settings.snowcardTiers, [tier]: price } } }));
  const setActiveTier = (tier: SnowcardTierKey) => setState(prev => ({ ...prev, settings: { ...prev.settings, activeTier: tier } }));
  const updateResortPrice = (id: string, price: number) => setState(prev => ({ ...prev, settings: { ...prev.settings, resorts: prev.settings.resorts.map(r => r.id === id ? { ...r, dailyPrice: price } : r) } }));
  const deleteResort = (id: string) => { if (confirm('Wirklich löschen?')) setState(prev => ({ ...prev, settings: { ...prev.settings, resorts: prev.settings.resorts.filter(r => r.id !== id) } })); };

  const autoFetchPrices = async () => {
    setIsUpdatingPrices(true);
    const updatedResorts = [...state.settings.resorts];
    for (let i = 0; i < updatedResorts.length; i++) {
      const price = await fetchLatestResortPrice(updatedResorts[i].name);
      if (price) updatedResorts[i].dailyPrice = price;
    }
    setState(prev => ({ ...prev, settings: { ...prev.settings, resorts: updatedResorts } }));
    setIsUpdatingPrices(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-gray-900 pb-32 max-w-lg mx-auto shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-blue-50/50 to-transparent -z-10" />

      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-end">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-xl shadow-blue-100 rotate-3 transition-transform hover:rotate-0">
            <CloudSnow size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-blue-900 leading-none">Flo's Tracker</h1>
            <p className="text-blue-500/60 font-black text-[10px] uppercase tracking-widest mt-1">Snowcard Tirol</p>
          </div>
        </div>
        <button onClick={() => setIsAddingDay(true)} className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl active:scale-95 flex items-center gap-2 font-black transition-all">
          <Plus size={20} />
          <span>Skitag</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'dashboard' && (
          <>
            {/* Top Grid: Skitage & Ersparnis */}
            <div className="grid grid-cols-2 gap-4">
              <StatsCard 
                title="Skitage" 
                value={breakEvenStatus.daysCount} 
                icon={<Calendar size={18} />}
                colorClass="text-blue-600"
                valueClass="text-6xl"
                className="row-span-1"
              />
              
              <StatsCard 
                title={breakEvenStatus.isProfitable ? "Ersparnis" : "Status"} 
                value={breakEvenStatus.isProfitable ? `${breakEvenStatus.savings.toFixed(0)}€` : `${breakEvenStatus.diff.toFixed(0)}€`} 
                subtitle={breakEvenStatus.isProfitable ? "Purer Profit 🚀" : "bis Break-Even"}
                icon={breakEvenStatus.isProfitable ? <TrendingUp size={18} /> : <Target size={18} />}
                colorClass={breakEvenStatus.isProfitable ? "text-emerald-600" : "text-blue-400"}
                valueClass="text-3xl"
              >
                <div className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase text-gray-400">
                    <span>{breakEvenStatus.isProfitable ? 'Profit-Zone' : 'Fortschritt'}</span>
                    <span>{breakEvenStatus.isProfitable ? `+${(breakEvenStatus.savings / activePrice * 100).toFixed(0)}%` : `${breakEvenStatus.baseProgress.toFixed(0)}%`}</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex relative">
                    {!breakEvenStatus.isProfitable ? (
                      <div 
                        className="h-full bg-blue-500 transition-all duration-1000" 
                        style={{ width: `${breakEvenStatus.baseProgress}%` }}
                      />
                    ) : (
                      <>
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-1000" 
                          style={{ width: `${breakEvenStatus.baseRatio}%` }}
                        />
                        <div 
                          className="h-full bg-cyan-400 transition-all duration-1000" 
                          style={{ width: `${breakEvenStatus.profitRatio}%` }}
                        />
                      </>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase pt-1">
                    <div className="flex items-center gap-1"><Euro size={8}/> {breakEvenStatus.totalValue.toFixed(0)}</div>
                    <div className="flex items-center gap-1">Tier: {activePrice}€</div>
                  </div>
                </div>
              </StatsCard>
            </div>

            {/* Second Row Grid: Kosten/Tag & Gratis-Tage */}
            <div className="grid grid-cols-2 gap-4">
              <StatsCard 
                title="Ø Kosten / Tag" 
                value={`${avgCostPerDay.toFixed(1)}€`} 
                subtitle="pro Skitag"
                icon={<TrendingDown size={18} />}
                colorClass="text-indigo-600"
                valueClass="text-3xl"
              />
              
              <StatsCard 
                title="Gratis-Tage" 
                value={breakEvenStatus.freeDaysCount} 
                subtitle="Abgerechnet 🎉"
                icon={<Gift size={18} />}
                colorClass={breakEvenStatus.freeDaysCount > 0 ? "text-orange-500" : "text-gray-300"}
                valueClass="text-4xl"
                className={breakEvenStatus.freeDaysCount > 0 ? "bg-orange-50/20 border-orange-100" : ""}
              />
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart3 size={14} /> Amortisation
              </h3>
              <BreakEvenChart skiDays={state.skiDays} tiers={state.settings.snowcardTiers} activeTier={state.settings.activeTier} />
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <LayoutDashboard size={14} /> Häufigste Gebiete
              </h3>
              <ResortUsageChart data={resortUsageData} />
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar size={14} /> Monats-Aktivität
              </h3>
              <MonthlyUsageChart data={monthlyUsageData} />
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2 flex items-center gap-2">
                <MapIcon size={14} /> Mein Tirol
              </h3>
              <div className="rounded-[2.5rem] overflow-hidden shadow-inner border border-blue-100">
                <TirolMap resorts={state.settings.resorts} skiDays={state.skiDays} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">Erfolge</h3>
              <AwardsGrid awards={awards} />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => setShowRecap(true)} className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all active:scale-95">
                <Share2 size={16} /> Saison Rückblick
              </button>
              <button onClick={archiveCurrentSeason} className="w-full py-5 rounded-[2rem] border-2 border-dashed border-gray-200 text-gray-400 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-white hover:text-blue-500">
                <Archive size={16} /> Saison archivieren
              </button>
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
             <div className="px-2">
                <h2 className="text-2xl font-black text-blue-900">Logbuch</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Saison {currentSeasonLabel}</p>
             </div>
             <div className="space-y-3">
               {[...state.skiDays].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(day => {
                 const resort = state.settings.resorts.find(r => r.id === day.resortId);
                 return (
                   <div key={day.id} className="bg-white p-4 rounded-[2rem] flex justify-between items-center shadow-sm transition-all hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-600 text-white w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black">
                          <span className="text-[9px] opacity-60 uppercase">{new Date(day.date).toLocaleDateString('de-DE', { month: 'short' })}</span>
                          <span className="text-lg">{day.date.split('-')[2]}</span>
                        </div>
                        <div className="font-black text-gray-800 text-sm">{resort?.name || 'Unbekannt'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-blue-600 text-lg">{day.priceAtTime.toFixed(0)}€</span>
                        <button onClick={() => deleteSkiDay(day.id)} className="text-gray-200 hover:text-red-500 p-2 transition-colors"><Trash2 size={18} /></button>
                      </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {activeTab === 'resorts' && (
          <div className="space-y-6">
            <div className="px-2 flex justify-between items-center">
              <h2 className="text-2xl font-black text-blue-900">Skigebiete</h2>
              <div className="flex gap-2">
                <button onClick={autoFetchPrices} disabled={isUpdatingPrices} className="p-2.5 text-blue-600 bg-blue-50 rounded-2xl transition-all">
                  <RefreshCw size={22} className={isUpdatingPrices ? 'animate-spin' : ''} />
                </button>
                <button onClick={() => setIsAddingResort(true)} className="p-2.5 text-blue-600 bg-blue-50 rounded-2xl transition-all"><PlusCircle size={22} /></button>
              </div>
            </div>
            <div className="grid gap-3">
              {sortedResorts.map(resort => (
                <div key={resort.id} className="bg-white p-5 rounded-[2rem] flex justify-between items-center shadow-sm group border border-transparent hover:border-blue-100">
                  <div className="font-black text-gray-800 text-sm leading-tight max-w-[180px]">{resort.name}</div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input type="number" step="0.5" value={resort.dailyPrice} onChange={(e) => updateResortPrice(resort.id, Number(e.target.value))} className="w-20 text-right font-black text-blue-600 bg-blue-50/50 rounded-xl p-2 outline-none focus:ring-2 focus:ring-blue-200" />
                      <span className="absolute right-1 bottom-1 text-[8px] font-black text-blue-300">€</span>
                    </div>
                    <button onClick={() => deleteResort(resort.id)} className="text-gray-200 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-blue-900 px-2">Snowcard Tarife</h2>
            <div className="grid grid-cols-1 gap-4">
              {(['normal', 'vorverkauf', 'ermassigt'] as SnowcardTierKey[]).map((tier) => (
                <div key={tier} className={`p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer ${state.settings.activeTier === tier ? 'bg-white border-blue-500 shadow-2xl' : 'bg-white border-transparent opacity-60'}`} onClick={() => setActiveTier(tier)}>
                   <div className="flex justify-between items-center mb-6">
                      <div className="font-black text-gray-800 text-lg capitalize">{tier}</div>
                      {state.settings.activeTier === tier && <Check className="text-blue-600" size={24} />}
                   </div>
                   <div className="relative">
                     <input type="number" value={state.settings.snowcardTiers[tier]} onClick={(e) => e.stopPropagation()} onChange={(e) => updateSnowcardTierPrice(tier, Number(e.target.value))} className="w-full text-4xl font-black border-none bg-blue-50/50 p-6 rounded-[1.5rem] text-blue-600" />
                     <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-200">€</span>
                   </div>
                </div>
              ))}
            </div>
            <div className="pt-8">
              <button onClick={() => { if(confirm('Alle lokalen Daten löschen?')) { localStorage.clear(); window.location.reload(); }}} className="w-full text-red-400 font-black p-5 border-2 border-dashed border-red-100 rounded-[2rem] hover:bg-red-50 transition-all">App Werksreset</button>
            </div>
          </div>
        )}
      </main>

      {/* Recap Modal */}
      {showRecap && (
        <SeasonRecap 
          days={state.skiDays} 
          resorts={state.settings.resorts} 
          seasonLabel={currentSeasonLabel} 
          savings={breakEvenStatus.isProfitable ? breakEvenStatus.savings : 0} 
          freeDays={breakEvenStatus.freeDaysCount}
          totalValue={breakEvenStatus.totalValue}
          onClose={() => setShowRecap(false)}
        />
      )}

      {/* Add Day Modal */}
      {isAddingDay && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-md flex items-end justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 space-y-8 shadow-2xl relative mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-blue-900">Neuer Tag</h3>
              <button onClick={() => setIsAddingDay(false)} className="bg-gray-100 p-3 rounded-2xl text-gray-400 hover:text-gray-600 transition-all"><Plus size={24} className="rotate-45" /></button>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Datum</label>
                  <input type="date" value={newDayDate} onChange={(e) => setNewDayDate(e.target.value)} className="w-full p-6 bg-blue-50/50 rounded-[2rem] font-black text-xl text-blue-900 outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Skigebiet</label>
                  <select value={selectedResortId} onChange={(e) => setSelectedResortId(e.target.value)} className="w-full p-6 bg-blue-50/50 rounded-[2rem] font-black text-xl text-blue-900 appearance-none outline-none focus:ring-4 focus:ring-blue-100 transition-all">
                      {sortedResorts.map(r => (
                        <option key={r.id} value={r.id}>{r.name} • {r.dailyPrice.toFixed(0)}€</option>
                      ))}
                  </select>
                </div>
            </div>
            <button onClick={addSkiDay} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl flex items-center justify-center gap-3 transition-all active:scale-95">SPEICHERN <Check size={24} /></button>
          </div>
        </div>
      )}

      {/* Add Resort Modal */}
      {isAddingResort && (
        <div className="fixed inset-0 bg-blue-950/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-black text-blue-900">Neues Gebiet</h3>
            <input type="text" placeholder="Name..." value={newResortName} onChange={(e) => setNewResortName(e.target.value)} className="w-full p-5 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all" />
            <div className="space-y-2">
               <label className="text-[10px] font-black text-gray-400 uppercase ml-4">Preis</label>
               <input type="number" step="0.5" value={newResortPrice} onChange={(e) => setNewResortPrice(Number(e.target.value))} className="w-full p-5 bg-gray-50 rounded-2xl font-black text-blue-600 text-3xl outline-none" />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsAddingResort(false)} className="flex-1 bg-gray-50 text-gray-400 py-5 rounded-[1.5rem] font-black transition-all active:scale-95">Abbruch</button>
              <button onClick={addResort} className="flex-1 bg-blue-600 text-white py-5 rounded-[1.5rem] font-black transition-all active:scale-95 shadow-xl shadow-blue-100">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <nav className="fixed bottom-6 left-6 right-6 max-w-lg mx-auto bg-white/95 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] px-8 py-5 flex justify-between items-center z-40 shadow-2xl">
        {[
          { id: 'dashboard', icon: LayoutDashboard, label: 'Status' },
          { id: 'history', icon: History, label: 'Logs' },
          { id: 'resorts', icon: Search, label: 'Gebiete' },
          { id: 'settings', icon: Settings, label: 'Optionen' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 3 : 2} />
            <span className="text-[9px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;