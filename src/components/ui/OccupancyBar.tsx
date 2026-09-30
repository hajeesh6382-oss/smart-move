// SMARTMOVE OccupancyBar Component
// Visualizes passenger occupancy with threshold colors and estimated provenance label

import React from 'react';

interface OccupancyBarProps {
  occupancyPct: number;
  isOverloaded?: boolean;
  className?: string;
  showProvenance?: boolean;
}

export const OccupancyBar: React.FC<OccupancyBarProps> = ({
  occupancyPct,
  isOverloaded = occupancyPct > 88,
  className = '',
  showProvenance = true,
}) => {
  let barColor = 'bg-cyan-500';
  if (occupancyPct > 88) {
    barColor = 'bg-rose-500';
  } else if (occupancyPct > 65) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-300">
          Occupancy: <strong className={isOverloaded ? 'text-rose-400 font-bold' : 'text-white'}>{occupancyPct}%</strong>
          {isOverloaded && <span className="ml-1.5 text-[10px] text-rose-400 font-mono font-bold uppercase">(Overload)</span>}
        </span>
        {showProvenance && (
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            ESTIMATED CROWDING
          </span>
        )}
      </div>

      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, Math.max(5, occupancyPct))}%` }}
        />
      </div>
    </div>
  );
};
