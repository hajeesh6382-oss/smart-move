// SMARTMOVE Mode Toggle Component
// LIVE / DEMO global switch displayed in the header/nav area.
// Clearly indicates which mode is active.

import React from 'react';
import { Radio, Cpu, ToggleLeft, ToggleRight } from 'lucide-react';
import { useSmartmoveMode } from '../../hooks/useSmartmoveMode';

interface ModeToggleProps {
  className?: string;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ className = '' }) => {
  const { mode, isLive, toggleMode } = useSmartmoveMode();

  return (
    <button
      type="button"
      onClick={toggleMode}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
        isLive
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
          : 'bg-purple-500/10 border-purple-500/40 text-purple-400 hover:bg-purple-500/20'
      } ${className}`}
      title={`Current mode: ${mode.toUpperCase()}. Click to switch.`}
    >
      {isLive ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Radio className="w-3.5 h-3.5" />
          LIVE MODE
        </>
      ) : (
        <>
          <Cpu className="w-3.5 h-3.5" />
          DEMO MODE
        </>
      )}
    </button>
  );
};
