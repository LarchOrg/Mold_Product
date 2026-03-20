import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export const ACCENT_PRESETS = [
  { name: 'Blue',    value: '#4f8fff', glow: 'rgba(79,143,255,0.12)',  glow2: 'rgba(79,143,255,0.22)' },
  { name: 'Indigo',  value: '#6366f1', glow: 'rgba(99,102,241,0.12)',  glow2: 'rgba(99,102,241,0.22)' },
  { name: 'Violet',  value: '#8b5cf6', glow: 'rgba(139,92,246,0.12)',  glow2: 'rgba(139,92,246,0.22)' },
  { name: 'Emerald', value: '#10b981', glow: 'rgba(16,185,129,0.12)',  glow2: 'rgba(16,185,129,0.22)' },
  { name: 'Cyan',    value: '#06b6d4', glow: 'rgba(6,182,212,0.12)',   glow2: 'rgba(6,182,212,0.22)' },
  { name: 'Amber',   value: '#f59e0b', glow: 'rgba(245,158,11,0.12)',  glow2: 'rgba(245,158,11,0.22)' },
  { name: 'Rose',    value: '#f43f5e', glow: 'rgba(244,63,94,0.12)',   glow2: 'rgba(244,63,94,0.22)' },
];

function hexDarken(hex, amount = 20) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('erp-theme') || 'dark'
  );
  const [accent, setAccentRaw] = useState(
    () => localStorage.getItem('erp-accent') || '#4f8fff'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('erp-theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const preset = ACCENT_PRESETS.find(p => p.value === accent) || ACCENT_PRESETS[0];
    root.style.setProperty('--accent',  accent);
    root.style.setProperty('--accent2', hexDarken(accent, 18));
    root.style.setProperty('--accent3', hexDarken(accent, 36));
    root.style.setProperty('--accent-glow',  preset.glow);
    root.style.setProperty('--accent-glow2', preset.glow2);
    root.style.setProperty('--sidebar-active-bg', preset.glow);
    localStorage.setItem('erp-accent', accent);
  }, [accent]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  const setAccent = (val) => setAccentRaw(val);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
