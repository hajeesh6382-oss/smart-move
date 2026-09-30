// SMARTMOVE Predictive Time Scrubber Component
// Dynamically adjusts future congestion and crowd predictions across Now, +15m, +30m, +60m horizons

import React from 'react';
import { TimeOffset } from './types';
import { Clock, Sparkles, FastForward } from 'lucide-react';
import { SourceBadge } from '../ui/SourceBadge';

interface MapTimeScrubberProps {
  activeOffset: TimeOffset;
  onChangeOffset: (offset: TimeOffset) => void;
  className?: string;
}

export const MapTimeScrubber: React.FC<MapTimeScrubberProps> = ({
  activeOffset,
  onChangeOffset,
  className = '',
}) => {
  const intervals: { offset: TimeOffset; label: string; sub: string }[] = [
    { offset: 0, label: 'Now', sub: 'Live Telemetry' },
    { offset: 15, label: '+15m', sub: 'Arrival Phase' },
    { offset: 30, label: '+30m', sub: 'Peak Surge' },
    { offset: 60, label: '+60m', sub: 'Recovery' },
  ];

  return (
    <div
      className={`glass-panel p-2 sm:p-2.5 rounded-2xl border border-slate-700/70 shadow-2xl bg-slate-950/90 backdrop-blur-xl flex items-center gap-2 ${className}`}
    >
      <div className="hidden sm:flex items-center gap-1.5 px-2 text-cyan-400 border-r border-slate-800">
        <Clock className="w-3.5 h-3.5" />
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
          Time Scrubber
        </span>
      </div>

      <div className="flex items-center gap-1">
        {intervals.map((item) => {
          const isSelected = activeOffset === item.offset;
          return (
            <button
              key={item.offset}
              type="button"
              onClick={() => onChangeOffset(item.offset)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex flex-col items-center ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[9px] font-normal leading-none ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                {item.sub}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:block pl-1">
        <SourceBadge source="ESTIMATED VALUE" interactive={false} />
      </div>
    </div>
  );
};
