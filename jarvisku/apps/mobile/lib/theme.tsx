import { createContext, useContext, ReactNode } from 'react';

/**
 * Dark-first theme tokens. `colors` are the single source of truth for the UI.
 * NativeWind maps these to the same palette via tailwind.config.js.
 */
export const colors = {
  primary: '#4F46E5',
  accent: '#06B6D4',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  bg: '#0F172A',
  card: '#1E293B',
  border: '#334155',
  text: '#FFFFFF',
  textSecondary: '#94A3B8',
};

type ThemeMode = 'dark' | 'light' | 'system';
const ThemeContext = createContext<{ mode: ThemeMode; setMode: (m: ThemeMode) => void }>({
  mode: 'dark',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // MVP: dark only. `mode` reserved for future light/system support.
  const mode: ThemeMode = 'dark';
  return (
    <ThemeContext.Provider value={{ mode, setMode: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
