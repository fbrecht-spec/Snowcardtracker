import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'snowcard_theme';
const BG = { light: '#F2F2F7', dark: '#000000' };
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

const readPref = (): ThemePref => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};

interface ThemeContextValue {
  pref: ThemePref;
  resolved: 'light' | 'dark';
  setPref: (pref: ThemePref) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Erscheinungsbild: Automatisch (folgt dem iPhone), Hell oder Dunkel (Neon).
 * Die Wahl liegt nur auf diesem Gerät; index.html setzt sie schon vor dem ersten Rendern.
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pref, setPrefState] = useState<ThemePref>(readPref);
  const [systemDark, setSystemDark] = useState(() => media().matches);

  useEffect(() => {
    const m = media();
    const onChange = () => setSystemDark(m.matches);
    m.addEventListener('change', onChange);
    return () => m.removeEventListener('change', onChange);
  }, []);

  const resolved = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;

  useEffect(() => {
    const root = document.documentElement;
    if (pref === 'system') delete root.dataset.theme;
    else root.dataset.theme = pref;
    // Farbe der Browser-/Statusleiste an das gewählte Theme anpassen
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => m.setAttribute('content', BG[resolved]));
    try {
      if (pref === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, pref);
    } catch { /* nur Komfort */ }
  }, [pref, resolved]);

  const value: ThemeContextValue = {
    pref,
    resolved,
    setPref: setPrefState,
    toggle: () => setPrefState(resolved === 'dark' ? 'light' : 'dark'),
  };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme außerhalb von ThemeProvider');
  return ctx;
};
