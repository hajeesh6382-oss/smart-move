// SMARTMOVE Connected Effects Interactive Graph Diagram
// Visualizes "One Problem → Many Connected Effects" with live severities and interactive node routes

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { buildConnectedEffectsGraph, ConnectedEffectNode } from '../../lib/ai/connectedEffects';
import { SourceBadge } from './SourceBadge';
import { ArrowRight, AlertCircle, Share2, Activity, Zap } from 'lucide-react';

interface ConnectedEffectsDiagramProps {
  trafficVolume?: number;
  collegeCongestion?: number;
  busOccupancy?: number;
  parkingAvail?: number;
  pedRisk?: number;
  co2Kg?: number;
  highlightedNodeIds?: string[];
  className?: string;
}

export const ConnectedEffectsDiagram: React.FC<ConnectedEffectsDiagramProps> = ({
  trafficVolume = 68,
  collegeCongestion = 84,
  busOccupancy = 94,
  parkingAvail = 14,
  pedRisk = 78,
  co2Kg = 540,
  highlightedNodeIds = [],
  className = '',
}) => {
  const navigate = useNavigate();
  const nodes = buildConnectedEffectsGraph(
    trafficVolume,
    collegeCongestion,
    busOccupancy,
    parkingAvail,
    pedRisk,
    co2Kg
  );

  return (
    <div className={`glass-panel p-5 lg:p-6 rounded-2xl relative overflow-hidden border border-slate-800 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-bold text-cyan-400 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-cyan-400" /> Systemic Mobility Intelligence
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h3 className="text-lg lg:text-xl font-bold text-white font-display mt-0.5">
            One Problem → Many Connected Ripple Effects
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Urban mobility is a single interconnected organism. Uncoordinated peak dismissals cascade through transit, parking, signals, emissions, and pedestrian safety.
          </p>
        </div>
      </div>

      {/* Interactive Node Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {nodes.map((node) => {
          const isHighlighted = highlightedNodeIds.length === 0 || highlightedNodeIds.includes(node.id);
          const isCritical = node.severity === 'critical';
          const isHigh = node.severity === 'high';

          let borderTheme = 'border-slate-800 bg-slate-900/40 hover:border-slate-700';
          let badgeTheme = 'bg-slate-800 text-slate-300';
          let pulseColor = 'bg-slate-500';

          if (isCritical) {
            borderTheme = 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500/60 shadow-lg shadow-rose-950/30';
            badgeTheme = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
            pulseColor = 'bg-rose-400';
          } else if (isHigh) {
            borderTheme = 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500/60 shadow-lg shadow-amber-950/30';
            badgeTheme = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
            pulseColor = 'bg-amber-400';
          }

          return (
            <div
              key={node.id}
              onClick={() => navigate(node.linkPath)}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group ${borderTheme} ${
                isHighlighted ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold border ${badgeTheme} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${pulseColor} animate-pulse`} />
                    {node.category}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {node.name}
                </h4>

                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {node.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  {node.metricLabel}
                </span>
                <span className="text-xs font-mono font-bold text-white">
                  {node.metricValue}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
