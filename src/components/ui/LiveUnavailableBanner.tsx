// SMARTMOVE Live Unavailable Banner
// Graceful fallback displayed when a real-time data source is not available.
// Shows category name, reason, and optional DEMO mode toggle.

import React from 'react';
import { WifiOff, AlertCircle, Radio } from 'lucide-react';

interface LiveUnavailableBannerProps {
  category?: string;
  categoryName?: string;
  reason?: string;
  onEnableDemo?: () => void;
  className?: string;
}

export const LiveUnavailableBanner: React.FC<LiveUnavailableBannerProps> = ({
  category,
  categoryName,
  reason,
  onEnableDemo,
  className = '',
}) => {
  const displayCategory = category || categoryName || 'Data';
  return (
    <div
      className={`p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 flex items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400">
          <WifiOff className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-mono uppercase font-bold text-slate-300 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Live {displayCategory} Feed Unavailable
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {reason ||
              `No authorized real-time ${displayCategory.toLowerCase()} data source is currently connected. Data shown is from the SMARTMOVE demonstration dataset.`}
          </p>
        </div>
      </div>

      {onEnableDemo && (
        <button
          type="button"
          onClick={onEnableDemo}
          className="shrink-0 px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Radio className="w-3.5 h-3.5" />
          Enable Demo Mode
        </button>
      )}
    </div>
  );
};
