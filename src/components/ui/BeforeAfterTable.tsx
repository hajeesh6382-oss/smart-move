// SMARTMOVE Before vs Simulated After Comparison Table & Visualizer

import React from 'react';
import { MetricComparison } from '../../lib/ai/simulationEngine';
import { SourceBadge } from './SourceBadge';
import { ArrowDownRight, ArrowUpRight, Minus, CheckCircle, TrendingDown } from 'lucide-react';

interface BeforeAfterTableProps {
  metrics: { [key: string]: MetricComparison };
  overallImprovementPct?: number;
  className?: string;
}

export const BeforeAfterTable: React.FC<BeforeAfterTableProps> = ({
  metrics,
  overallImprovementPct = 42,
  className = '',
}) => {
  return (
    <div className={`glass-panel p-5 lg:p-6 rounded-2xl border border-slate-800 relative overflow-hidden ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-emerald-400" /> Coordinated Optimization Metrics
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-white font-display mt-0.5">
            CURRENT BASELINE vs SIMULATED AFTER
          </h3>
        </div>

        {overallImprovementPct > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300 font-medium">Net Efficiency Gain:</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">+{overallImprovementPct}%</span>
          </div>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs lg:text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
              <th className="pb-3 pl-2">Key Mobility Metric</th>
              <th className="pb-3 px-4 text-rose-400">Current (Unmanaged)</th>
              <th className="pb-3 px-4 text-emerald-400">Simulated AI Optimized</th>
              <th className="pb-3 px-4">Improvement</th>
              <th className="pb-3 pr-2 hidden md:table-cell">AI Intervention Factor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {Object.values(metrics).map((m, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 pl-2 text-white font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {m.name}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-rose-300">
                  {m.before} {m.unit}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                  {m.after} {m.unit}
                </td>
                <td className="py-3.5 px-4">
                  {m.status === 'improved' ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md text-xs border border-emerald-500/20">
                      <ArrowDownRight className="w-3.5 h-3.5" /> -{m.improvementPct}%
                    </span>
                  ) : m.status === 'worsened' ? (
                    <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md text-xs border border-rose-500/20">
                      <ArrowUpRight className="w-3.5 h-3.5" /> +{m.improvementPct}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md text-xs">
                      <Minus className="w-3.5 h-3.5" /> 0%
                    </span>
                  )}
                </td>
                <td className="py-3.5 pr-2 text-slate-400 text-xs hidden md:table-cell">
                  {m.explanation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
