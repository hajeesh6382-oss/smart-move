// SMARTMOVE AI Route Insight Card Component
// Adds AI analysis on top of Google Route calculation

import React from 'react';
import { MultiObjectiveRoute } from './types';
import { SourceBadge } from '../ui/SourceBadge';
import { Sparkles, Leaf, Fuel, AlertTriangle, Clock, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AIMapInsightProps {
  route: MultiObjectiveRoute;
}

export const AIMapInsight: React.FC<AIMapInsightProps> = ({ route }) => {
  if (!route) return null;

  return (
    <div className="glass-panel-glow p-4 rounded-3xl border border-cyan-500/30 shadow-2xl bg-slate-950/95 backdrop-blur-2xl text-left space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
          <Sparkles className="w-3.5 h-3.5" /> SMARTMOVE ROUTE INSIGHT
        </div>
        <SourceBadge source="ESTIMATED VALUE" interactive={false} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white font-display">{route.name}</h4>
          <span className="text-xs font-mono font-bold text-cyan-300">{route.etaMin} min ({route.distanceKm} km)</span>
        </div>
        <p className="text-[11px] text-slate-300 mt-1 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
          {route.whyExplanation}
        </p>
      </div>

      {/* AI Telemetry Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[9px] block">CONGESTION RISK</span>
          <span className={`font-bold ${route.congestionPct > 65 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {route.congestionPct}% {route.congestionPct > 65 ? 'Heavy' : 'Smooth'}
          </span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[9px] block">ESTIMATED CO₂</span>
          <span className="font-bold text-emerald-400">{route.co2Grams} g</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[9px] block">ESTIMATED FUEL</span>
          <span className="font-bold text-cyan-300">{route.fuelLiters} L</span>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
          <span className="text-slate-500 text-[9px] block">FUEL SAVED</span>
          <span className="font-bold text-emerald-400">+{route.fuelSavedPct}%</span>
        </div>
      </div>
    </div>
  );
};
