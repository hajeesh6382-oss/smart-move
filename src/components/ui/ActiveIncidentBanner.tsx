// SMARTMOVE Active Incident Banner
// Prominently displays live high/critical incidents at the top of the app with direct rerouting CTA

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { aiMobilityBrain } from '../../lib/ai/mobilityBrain';
import { AlertTriangle, ArrowRight, ShieldCheck, Zap, Sparkles, Check } from 'lucide-react';

export const ActiveIncidentBanner: React.FC = () => {
  const { data: incidents } = useRealtimeTable('active_incidents');
  const navigate = useNavigate();

  const activeCritical = incidents?.find((i: any) => i.status === 'active' && (i.severity === 'critical' || i.severity === 'high'));

  if (!activeCritical) return null;

  const handleResolve = (e: React.MouseEvent) => {
    e.stopPropagation();
    aiMobilityBrain.resolveIncident(activeCritical.id);
  };

  return (
    <div
      onClick={() => navigate('/app/routes')}
      className="mb-4 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/80 via-slate-950 to-amber-950/80 border border-rose-500/50 shadow-2xl flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-rose-400 transition-all animate-in fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
          <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-black px-2 py-0.5 rounded-full bg-rose-500 text-white">
              LIVE {activeCritical.severity} INCIDENT
            </span>
            <span className="text-xs text-rose-300 font-bold">{activeCritical.location_name}</span>
          </div>
          <p className="text-xs text-slate-200 mt-0.5 font-medium line-clamp-1">
            {activeCritical.title} — {activeCritical.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleResolve}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          title="Resolve incident & restore baseline flow"
        >
          <Check className="w-3.5 h-3.5" />
          Resolve
        </button>

        <div className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
          <span>AI Bypass Route Active</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
};
