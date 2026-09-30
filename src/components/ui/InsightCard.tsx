// SMARTMOVE AI Insight & Explainability Card
// Transparently details Problem, Prediction, Recommendation, Impact, "Why?" reasons, and Heuristic Confidence

import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, ArrowRight, HelpCircle, ShieldCheck, Share2 } from 'lucide-react';
import { SourceBadge } from './SourceBadge';

export interface InsightCardData {
  id: string;
  category: string;
  title: string;
  problem: string;
  prediction: string;
  recommendation: string;
  estimated_impact: string;
  why_reasons: string[];
  confidence: number;
  connected_effects: string[];
}

interface InsightCardProps {
  insight: InsightCardData;
  onSimulate?: () => void;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, onSimulate, className = '' }) => {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <div className={`glass-panel-glow rounded-2xl p-5 lg:p-6 relative overflow-hidden transition-all duration-300 border border-cyan-500/30 ${className}`}>
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-cyan-400">Mobility Intelligence Action</span>
              <SourceBadge source="SIMULATED DATA" />
            </div>
            <h3 className="text-base lg:text-lg font-bold text-white font-display mt-0.5">{insight.title}</h3>
          </div>
        </div>

        {/* Confidence Heuristic Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-400">AI Confidence:</span>
          <span className="font-bold text-emerald-400">{insight.confidence}%</span>
        </div>
      </div>

      {/* Grid: Problem & Prediction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Detected Bottleneck
          </div>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">{insight.problem}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            15-Min Prediction
          </div>
          <p className="text-xs lg:text-sm text-slate-300 leading-relaxed">{insight.prediction}</p>
        </div>
      </div>

      {/* Recommendation & Estimated Impact */}
      <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 mb-4">
        <div className="text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
          Coordinated Recommendation
        </div>
        <p className="text-sm lg:text-base text-white font-medium leading-relaxed">{insight.recommendation}</p>
        
        <div className="mt-3 pt-3 border-t border-cyan-900/50 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-cyan-200 font-semibold flex items-center gap-1">
            ⚡ Estimated Impact: <span className="text-emerald-400 font-bold ml-1">{insight.estimated_impact}</span>
          </span>
          {onSimulate && (
            <button
              onClick={onSimulate}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Simulate Solution <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Connected Effects Tags */}
      {insight.connected_effects?.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5 text-slate-500" /> Connected Ripple Effects:
          </span>
          {insight.connected_effects.map((effect, idx) => (
            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px]">
              {effect}
            </span>
          ))}
        </div>
      )}

      {/* "Why this recommendation?" Expander */}
      <div className="pt-2 border-t border-slate-800/80">
        <button
          onClick={() => setWhyOpen(!whyOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors py-1 cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" /> Why this recommendation? (Explainability & Data Inputs)
          </span>
          {whyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {whyOpen && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 space-y-2 animate-in fade-in duration-200">
            <div className="font-semibold text-slate-200 mb-1">Key Factors & Deterministic Model Inputs:</div>
            <ul className="list-disc pl-5 space-y-1 text-slate-300">
              {insight.why_reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-500 italic">
              ℹ️ Note: Confidence score ({insight.confidence}%) is a heuristic indicator based on simulated historical traffic volume, sensor variance, and queue density. It is not a scientifically calibrated or validated value.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
