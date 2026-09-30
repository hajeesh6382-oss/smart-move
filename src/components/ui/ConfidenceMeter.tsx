// SMARTMOVE Confidence Meter
// Visual bar showing AI prediction confidence (0-100%).
// "Confidence unavailable" when value is null/undefined.

import React from 'react';
import { Sparkles } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence?: number | null | undefined;
  value?: number | null | undefined;
  label?: string;
  className?: string;
  compact?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  value,
  label = 'AI Confidence',
  className = '',
  compact = false,
}) => {
  const effectiveConfidence = confidence !== undefined ? confidence : value;
  if (effectiveConfidence === null || effectiveConfidence === undefined) {
    return (
      <div className={`text-[10px] font-mono text-slate-500 flex items-center gap-1 ${className}`}>
        <Sparkles className="w-3 h-3 text-slate-600" />
        Confidence unavailable
      </div>
    );
  }

  const pct = Math.max(0, Math.min(100, Math.round(effectiveConfidence)));
  const colorClass =
    pct >= 85
      ? 'bg-emerald-500 text-emerald-400'
      : pct >= 65
      ? 'bg-cyan-500 text-cyan-400'
      : pct >= 45
      ? 'bg-amber-500 text-amber-400'
      : 'bg-rose-500 text-rose-400';

  const textColor =
    pct >= 85
      ? 'text-emerald-400'
      : pct >= 65
      ? 'text-cyan-400'
      : pct >= 45
      ? 'text-amber-400'
      : 'text-rose-400';

  if (compact) {
    return (
      <span className={`text-[10px] font-mono ${textColor} flex items-center gap-1 ${className}`}>
        <Sparkles className="w-3 h-3" />
        {pct}%
      </span>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          {label}
        </span>
        <span className={`font-bold ${textColor}`}>{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
