// SMARTMOVE Emergency Green Corridor Simulation Page

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Siren, PhoneCall, ShieldAlert, CheckCircle2, ArrowRight, Sparkles, Navigation } from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  const { data: emergencyData } = useRealtimeTable('emergency_incidents');
  const incident = emergencyData[0] || {
    vehicle_type: 'Ambulance 108 (Cardiac Critical)',
    start_location: 'Tech Park Health Post',
    destination: 'City Multi-Specialty Hospital',
    current_eta_normal: 14,
    current_eta_ai: 8,
    time_saved_min: 6,
    corridors: ['Hospital Express Way', 'Junction D Bypass', 'Green Priority Avenue'],
    junctions_to_avoid: ['Junction A (Congested)', 'Market Cross (Bottleneck)'],
  };

  return (
    <div className="space-y-6">
      {/* Non-Negotiable 112 Emergency Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-rose-950/60 border border-rose-500/50 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-500 text-white font-bold animate-pulse">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              Real Emergency? Dial 112 Immediately
            </h3>
            <p className="text-xs text-rose-200 mt-0.5 leading-relaxed">
              SMARTMOVE is a predictive simulation platform and does not dispatch physical emergency units or directly operate municipal signals.
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg"
        >
          Call 112 (Emergency)
        </a>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Simulation Green Wave Preemption
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Emergency Green Corridor Simulation
          </h2>
          <p className="text-xs text-slate-400">
            Simulated adaptive traffic signal preemption to clear emergency hospital transit paths.
          </p>
        </div>
      </div>

      {/* Corridor Time Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Unmanaged Normal Transit"
          value={`${incident.current_eta_normal} min`}
          subtitle="Arterial peak delay included"
          icon={<Navigation className="w-4 h-4 text-rose-400" />}
          badge={<StatusBadge status="severe" />}
        />
        <StatCard
          title="AI Green Corridor ETA"
          value={`${incident.current_eta_ai} min`}
          subtitle="Adaptive green preemption"
          icon={<Siren className="w-4 h-4 text-emerald-400" />}
          badge={<StatusBadge status="available" />}
        />
        <StatCard
          title="Simulated Time Saved"
          value={`-${incident.time_saved_min} min`}
          subtitle="Critical golden-hour improvement"
          icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
          source="ESTIMATED VALUE"
        />
      </div>

      {/* Active Incident Details */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold">Simulated Unit:</span>
            <h3 className="text-lg font-bold text-white font-display">{incident.vehicle_type}</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
            🟢 Green Wave Coordinated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Cleared Priority Corridors:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              {incident.corridors.map((c: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Junctions to Pre-empt / Avoid:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
              {incident.junctions_to_avoid.map((j: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  {j}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
