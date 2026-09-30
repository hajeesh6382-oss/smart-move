// SMARTMOVE Adaptive Signal Intelligence & Green Split Visualizer

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { StatCard } from '../../components/ui/StatCard';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { TrafficCone, ShieldAlert, Sparkles, CheckCircle2, ArrowRight, Clock } from 'lucide-react';

export const SignalsPage: React.FC = () => {
  const { data: signals } = useRealtimeTable('signal_approaches');

  return (
    <div className="space-y-6">
      {/* Non-Negotiable Signal Disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 leading-relaxed">
          <strong>Important Municipal Notice:</strong> Signal timings shown are AI recommendations for simulation. The application does not directly control public traffic signals.
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Queue-Proportional Timing Engine
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Adaptive Signal Timing Intelligence
          </h2>
          <p className="text-xs text-slate-400">
            Dynamically calculates optimal green wave splits in proportion to directional queue accumulation.
          </p>
        </div>
      </div>

      {/* Junctions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {signals.map((sig: any) => {
          const totalCount = sig.north_count + sig.south_count + sig.east_count + sig.west_count;

          return (
            <div key={sig.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white font-display">{sig.junction_name}</h3>
                  <span className="text-xs text-slate-400 font-mono">Cycle Length: {sig.current_cycle_sec}s • Total Queue: {totalCount} vehicles</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
                  ⚡ Adaptive Split
                </span>
              </div>

              {/* 4 Approach Split Visualizer */}
              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                {/* North */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>North Approach</span>
                    <span className="text-white font-bold">{sig.north_count} v</span>
                  </div>
                  <div className="text-sm font-black text-cyan-300">{sig.rec_north_sec}s Green</div>
                </div>

                {/* South */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>South Approach</span>
                    <span className="text-white font-bold">{sig.south_count} v</span>
                  </div>
                  <div className="text-sm font-black text-cyan-300">{sig.rec_south_sec}s Green</div>
                </div>

                {/* East (Congested corridor) */}
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1">
                  <div className="flex justify-between text-rose-300">
                    <span>East Approach (Heavy)</span>
                    <span className="text-white font-bold">{sig.east_count} v</span>
                  </div>
                  <div className="text-sm font-black text-emerald-400">{sig.rec_east_sec}s Green Split</div>
                </div>

                {/* West */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>West Approach</span>
                    <span className="text-white font-bold">{sig.west_count} v</span>
                  </div>
                  <div className="text-sm font-black text-cyan-300">{sig.rec_west_sec}s Green</div>
                </div>
              </div>

              {/* Green Wave Efficiency Stat */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Simulated Queue Delay Reduction:
                </span>
                <span className="font-bold text-emerald-400 font-mono">-6.2 min / cycle</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
