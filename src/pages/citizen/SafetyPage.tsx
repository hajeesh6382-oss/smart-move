// SMARTMOVE Pedestrian Safety & Vulnerable Road User (VRU) Risk Intelligence Page
// Features transparent multi-variable conflict risk scoring, ML confidence meters, and dynamic provenance badges.

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { ConfidenceMeter } from '../../components/ui/ConfidenceMeter';
import { ShieldAlert, ShieldCheck, Footprints, Sparkles, Calculator } from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const { data: pedestrianZones } = useRealtimeTable('pedestrian_zones');

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Vulnerable Road User Safety Intelligence
            </span>
            <SourceBadge source="ai_prediction" provider="SMARTMOVE Pedestrian Risk Engine" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Pedestrian Safety & Crossing Risk Map
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time conflict scoring combining vehicle turning speeds, pedestrian density surges, and crosswalk visibility.
          </p>
        </div>
      </div>

      {/* Safety Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Protected Crosswalks"
          value="4 Zones"
          subtitle="Pelican signals & skywalks active"
          icon={<Footprints className="w-4 h-4 text-cyan-400" />}
          source="estimated"
        />
        <StatCard
          title="Corridor Risk Index"
          value="78 / 100"
          subtitle="Higher risk near College Gate"
          icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
          badge={<StatusBadge status="Higher" />}
          source="ai_prediction"
        />
        <StatCard
          title="Safe Crossing Compliance"
          value="89%"
          subtitle="Adherence to grade-separated walks"
          icon={<ShieldCheck className="w-4 h-4 text-emerald-400" />}
          source="estimated"
        />
      </div>

      {/* Risk Model Formula Transparency Box */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              Transparent Risk Formula <SourceBadge source="ai_prediction" />
            </div>
            <p className="text-slate-300 text-[11px] mt-0.5">
              Score = 0.45 × (VehSpeed/Max) + 0.35 × (PedDensity/Max) + 0.20 × (Veh × Ped Interaction Penalty)
            </p>
          </div>
        </div>
        <ConfidenceMeter value={88} label="Model Accuracy" />
      </div>

      {/* Pedestrian Zones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pedestrianZones.map((zone: any) => (
          <div key={zone.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white font-display">{zone.name}</h3>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Pedestrian Density: {zone.pedestrian_count} people/hr • Vehicle Flow: {zone.vehicle_density}%
                </div>
              </div>
              <StatusBadge status={zone.risk_level} />
            </div>

            {/* Risk Gauge Bar */}
            <div className="py-2 border-y border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  Conflict Risk Score <SourceBadge source="ai_prediction" />
                </span>
                <span className={zone.risk_score > 65 ? 'text-rose-400 font-bold' : zone.risk_score > 35 ? 'text-amber-400' : 'text-emerald-400'}>
                  {zone.risk_score} / 100
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${zone.risk_score > 65 ? 'bg-rose-500' : zone.risk_score > 35 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${zone.risk_score}%` }}
                />
              </div>
            </div>

            {/* AI Safe Advice */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Recommended Safe Crossing: <strong className="text-white">{zone.safer_crossing}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
