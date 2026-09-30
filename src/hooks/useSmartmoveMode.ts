// SMARTMOVE Global Mode Hook (LIVE vs DEMO)
// Manages the application-wide operating mode, persisted in localStorage.

import { useState, useEffect } from 'react';

export type SmartmoveMode = 'live' | 'demo';

const MODE_STORAGE_KEY = 'smartmove_operating_mode';

export function getInitialMode(): SmartmoveMode {
  const envMode = import.meta.env.VITE_SMARTMOVE_MODE as string;
  if (envMode === 'demo') return 'demo';
  
  const saved = localStorage.getItem(MODE_STORAGE_KEY);
  if (saved === 'live' || saved === 'demo') {
    return saved;
  }
  return 'live'; // Default to LIVE mode
}

export function useSmartmoveMode() {
  const [mode, setModeState] = useState<SmartmoveMode>(getInitialMode);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === MODE_STORAGE_KEY && (e.newValue === 'live' || e.newValue === 'demo')) {
        setModeState(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const setMode = (newMode: SmartmoveMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
    window.dispatchEvent(new CustomEvent('smartmove_mode_change', { detail: newMode }));
  };

  const toggleMode = () => {
    setMode(mode === 'live' ? 'demo' : 'live');
  };

  return {
    mode,
    isLive: mode === 'live',
    isDemo: mode === 'demo',
    setMode,
    toggleMode,
  };
}
