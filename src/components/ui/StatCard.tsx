// SMARTMOVE StatCard Component

import React, { ReactNode } from 'react';
import { SourceBadge, SourceType } from './SourceBadge';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  source?: SourceType | string;
  badge?: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  trend,
  source = 'SIMULATED DATA',
  badge,
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel p-5 rounded-xl transition-all duration-200 hover:border-slate-700 relative overflow-hidden ${
        onClick ? 'cursor-pointer hover:bg-slate-900/60' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {icon && <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">{icon}</div>}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{title}</h3>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {badge ? badge : source ? <SourceBadge source={source} /> : null}
      </div>

      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-2xl lg:text-3xl font-bold font-display text-white tracking-tight">{value}</span>
        {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
      </div>

      {trend && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-slate-400">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
