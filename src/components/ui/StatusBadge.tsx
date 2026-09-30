// SMARTMOVE Status Badge Component
// Follows Accessibility rules: Status is NEVER indicated by color alone (always icon + text)

import React from 'react';
import { AlertTriangle, CheckCircle, Flame, Info, ShieldAlert } from 'lucide-react';

interface StatusBadgeProps {
  status: 'low' | 'moderate' | 'heavy' | 'severe' | 'overloaded' | 'available' | 'Lower' | 'Moderate' | 'Higher' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = status.toLowerCase();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  if (norm === 'severe' || norm === 'higher' || norm === 'critical' || norm === 'overloaded') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 ${padding}`}>
        <Flame className="w-3.5 h-3.5 text-rose-400" />
        {status}
      </span>
    );
  }

  if (norm === 'heavy' || norm === 'moderate' || norm === 'warning' || norm === 'filling_fast') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 ${padding}`}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        {status}
      </span>
    );
  }

  if (norm === 'low' || norm === 'lower' || norm === 'available' || norm === 'ample_spots' || norm === 'success') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 ${padding}`}>
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700 ${padding}`}>
      <Info className="w-3.5 h-3.5 text-slate-400" />
      {status}
    </span>
  );
};
