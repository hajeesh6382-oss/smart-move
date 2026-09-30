// SMARTMOVE 2D Connection & Data Mode Hook
// Guarantees that simulated data is NEVER displayed with a green "LIVE" badge

import { useState, useEffect } from 'react';
import { isRealSupabaseConfigured } from '../lib/supabase/client';
import { providerManager, SourceMode } from '../lib/providers/dataProviderManager';

export type ConnectionState = 'live' | 'reconnecting' | 'offline';
export type DataMode = 'simulated' | 'hybrid' | 'live_api';

export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [reconnecting, setReconnecting] = useState(false);
  const [sourceMode, setSourceMode] = useState<SourceMode>(providerManager.getSourceMode());

  useEffect(() => {
    const handleOnline = () => {
      setReconnecting(true);
      setTimeout(() => {
        setIsOnline(true);
        setReconnecting(false);
      }, 600);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Connection dimension
  let connectionState: ConnectionState = 'live';
  if (!isOnline) {
    connectionState = 'offline';
  } else if (reconnecting) {
    connectionState = 'reconnecting';
  }

  // Data mode dimension
  let dataMode: DataMode = 'simulated';
  if (sourceMode === 'live_only') {
    dataMode = 'live_api';
  } else if (sourceMode === 'hybrid') {
    dataMode = 'hybrid';
  } else {
    dataMode = 'simulated';
  }

  return {
    connectionState,
    dataMode,
    isOnline,
    // Formatted 2D display labels
    connectionBadge: {
      text: connectionState === 'live' ? '🟢 LIVE' : connectionState === 'reconnecting' ? '🟠 Reconnecting…' : '🔴 Offline',
      style: connectionState === 'live' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : connectionState === 'reconnecting' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' : 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    },
    dataModeBadge: {
      text: dataMode === 'live_api' ? '🟢 LIVE API DATA' : dataMode === 'hybrid' ? '🔵 HYBRID DATA' : '🟠 SIMULATED LIVE',
      style: dataMode === 'live_api' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : dataMode === 'hybrid' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    },
  };
}
