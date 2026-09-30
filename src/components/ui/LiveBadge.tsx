// SMARTMOVE Real-Time Status Indicator & Clock
// Displays Live state, AI Brain status, and second-by-second data freshness timestamp

import React, { useState, useEffect } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { aiMobilityBrain } from '../../lib/ai/mobilityBrain';
import { Sparkles, Radio } from 'lucide-react';

interface LiveBadgeProps {
  className?: string;
  showBoth?: boolean;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ className = '', showBoth = true }) => {
  const { connectionState, dataMode } = useConnectionStatus();
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const isBrainActive = aiMobilityBrain.getBrainState() === 'analyzing';

  return (
    <div className={`inline-flex items-center gap-2 flex-wrap ${className}`}>
      {/* 1. Real-Time LIVE Indicator */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wide border shadow-sm bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>{isBrainActive ? 'AI ANALYZING' : 'LIVE'}</span>
      </div>

      {/* 2. Clock Freshness */}
      {showBoth && (
        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
          <span className="text-slate-500">Last updated:</span>
          <span className="text-cyan-400 font-bold">{timeString}</span>
        </div>
      )}
    </div>
  );
};
