// SMARTMOVE Place Report Panel (Section 7)
// Displays comprehensive mobility report for any selected Indian place with honest provenance and grounded Gemini insights

import React, { useState } from 'react';
import { PlaceReportData } from '../../lib/place/placeService';
import { SourceBadge } from '../ui/SourceBadge';
import {
  MapPin,
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Wind,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PlaceReportPanelProps {
  report: PlaceReportData | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTo?: () => void;
}

export const PlaceReportPanel: React.FC<PlaceReportPanelProps> = ({
  report,
  isOpen,
  onClose,
  onNavigateTo,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hotspots' | 'provenance'>('overview');

  if (!isOpen || !report) return null;

  const isHeavy = report.overall_status === 'HEAVY_CONGESTION';
  const isModerate = report.overall_status === 'MODERATE_FLOW';

  return (
    <div className="absolute top-20 right-4 z-40 w-96 max-h-[85vh] glass-panel-glow bg-slate-950/98 border border-slate-700/80 rounded-3xl p-5 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-slate-800">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black font-display text-white truncate">
              {report.place.name.split(',')[0]}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">
              {report.place.district}, {report.place.state}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status & Coverage Chip */}
      <div className="my-3 flex items-center justify-between gap-2">
        <div
          className={`px-3 py-1 rounded-xl text-xs font-bold uppercase font-mono border flex items-center gap-1.5 ${
            isHeavy
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : isModerate
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
          {report.overall_status.replace('_', ' ')}
        </div>

        <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
          Coverage: <span className="text-cyan-400 font-bold">{report.coverage.level}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 mb-3 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('hotspots')}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'hotspots' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Hotspots
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('provenance')}
          className={`py-1.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'provenance' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sources
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {activeTab === 'overview' && (
          <>
            {/* Grounded Gemini Summary */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/30 space-y-1.5">
              <div className="text-[10px] font-mono uppercase font-bold text-cyan-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Gemini Mobility Summary
              </div>
              <p className="text-slate-200 text-xs leading-relaxed font-medium">
                {report.ai_summary}
              </p>
            </div>

            {/* Congestion & Predictions */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Current Congestion</span>
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  {report.traffic.current_congestion}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-center">
                <div>
                  <span className="text-slate-500 block text-[9px]">+15 min</span>
                  <span className="text-white font-bold">{report.traffic.predictions.plus_15m}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">+30 min</span>
                  <span className="text-white font-bold">{report.traffic.predictions.plus_30m}%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px]">+60 min</span>
                  <span className="text-white font-bold">{report.traffic.predictions.plus_60m}%</span>
                </div>
              </div>
            </div>

            {/* AI Recommendation Card */}
            {report.recommendations[0] && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-mono uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Action Recommendation
                </div>
                <div className="text-white font-bold">{report.recommendations[0].recommendation}</div>
                <div className="text-slate-300 text-[11px]">{report.recommendations[0].expected_impact}</div>
              </div>
            )}
          </>
        )}

        {activeTab === 'hotspots' && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Ranked Traffic Corridors & Bottlenecks
            </div>
            {report.traffic.hotspots.map((h, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white truncate max-w-[70%]">{h.road_name}</span>
                  <span className="font-mono text-cyan-300 font-bold">{h.congestion_pct}%</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Speed: {h.speed_kmh} km/h</span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {h.data_source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'provenance' && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400">
              Data Sources & Honest Provenance Contract
            </div>
            <div className="divide-y divide-slate-800/80">
              {report.coverage.providers.map((p, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{p.data_source}</div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigate CTA */}
      {onNavigateTo && (
        <button
          type="button"
          onClick={onNavigateTo}
          className="mt-4 w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" /> Plan Route to {report.place.name.split(',')[0]}
        </button>
      )}
    </div>
  );
};
