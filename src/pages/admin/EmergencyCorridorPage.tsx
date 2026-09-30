// SMARTMOVE Emergency Green Corridor Operations Page (Admin)

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore } from '../../lib/supabase/mockStore';
import { StatCard } from '../../components/ui/StatCard';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Siren, ShieldAlert, Sparkles, CheckCircle2, Navigation } from 'lucide-react';

export const EmergencyCorridorPage: React.FC = () => {
  const { data: emergencyData } = useRealtimeTable('emergency_incidents');
  const { data: simState } = useRealtimeTable('simulation_state');
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

  const isEmergencyActive = simState[0]?.emergency_vehicle_active;

  const toggleEmergency = () => {
    cityStore.updateSimulationState({
      emergency_vehicle_active: !isEmergencyActive,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-rose-400">
              Simulated Green Wave Corridor
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Emergency Preemption Command
          </h2>
          <p className="text-xs text-slate-400">
            Coordinates simulated signal preemption to guarantee golden-hour medical transit times.
          </p>
        </div>

        <button
          onClick={toggleEmergency}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
            isEmergencyActive
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <Siren className="w-4 h-4" />
          {isEmergencyActive ? 'Simulated Corridor Active (Deactivate)' : 'Activate Green Corridor'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Baseline Unmanaged ETA"
          value={`${incident.current_eta_normal} min`}
          subtitle="Trapped in peak queues"
          icon={<Navigation className="w-4 h-4 text-rose-400" />}
        />
        <StatCard
          title="AI Green Corridor ETA"
          value={`${incident.current_eta_ai} min`}
          subtitle="Adaptive signal clearance"
          icon={<Siren className="w-4 h-4 text-emerald-400" />}
        />
        <StatCard
          title="Time Saved (Golden Hour)"
          value={`-${incident.time_saved_min} min`}
          subtitle="43% Transit Time Reduction"
          icon={<Sparkles className="w-4 h-4 text-cyan-400" />}
          source="ESTIMATED VALUE"
        />
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white font-display">Active Unit Telematics</h3>
          <span className="text-xs font-mono text-cyan-300 font-bold">{incident.vehicle_type}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Preempted Corridors:
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
              <ShieldAlert className="w-4 h-4" /> Avoidance Nodes:
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
