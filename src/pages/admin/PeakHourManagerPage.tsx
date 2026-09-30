// SMARTMOVE AI Peak-Hour Manager Page
// Compares Current vs 15-Minute Predictive Forecaster across traffic, transit, parking, and pedestrian conflict

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Clock, TrendingUp, Sparkles, Activity, Bus, SquareParking, ShieldAlert, ArrowRight } from 'lucide-react';

export const PeakHourManagerPage: React.FC = () => {
  const { data: trafficPreds } = useRealtimeTable('traffic_predictions');
  const { data: busPreds } = useRealtimeTable('bus_predictions');
  const { data: parkingPreds } = useRealtimeTable('parking_predictions');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Predictive 15-Minute Horizon
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            AI Peak-Hour Congestion Manager
          </h2>
          <p className="text-xs text-slate-400">
            Autonomous multi-system predictive forecasting comparing current baseline metrics vs 15-minute horizon projections.
          </p>
        </div>
      </div>

      {/* 4 Multi-Modal 15-Min Projections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Road Traffic Projection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Corridor Congestion</h3>
                <span className="text-xs text-slate-400">College Road (Tech Corridor)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">91% Confidence</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 font-mono">
            <div>
              <span className="text-xs text-slate-400 block">Current Congestion</span>
              <span className="text-2xl font-black text-rose-300">84%</span>
            </div>
            <div>
              <span className="text-xs text-cyan-400 block">15-Min Prediction</span>
              <span className="text-2xl font-black text-rose-400">92%</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Surge Rationale:
            </div>
            <p>
              NIT 2,200 student dismissal (17:00) overlaps with Apex Tech Park exit wave (17:15) exceeding 1,400 vph capacity.
            </p>
          </div>
        </div>

        {/* 2. Transit Occupancy Projection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Public Transit Occupancy</h3>
                <span className="text-xs text-slate-400">Bus Route 102 (Campus ⇄ Central)</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">92% Confidence</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 font-mono">
            <div>
              <span className="text-xs text-slate-400 block">Current Occupancy</span>
              <span className="text-2xl font-black text-amber-300">94%</span>
            </div>
            <div>
              <span className="text-xs text-cyan-400 block">15-Min Prediction</span>
              <span className="text-2xl font-black text-rose-400">98% (Overloaded)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Transit Action:
            </div>
            <p>
              Activate 2 standby high-capacity electric buses from North Depot to clear passenger curb queues.
            </p>
          </div>
        </div>

        {/* 3. Parking Availability Projection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40">
                <SquareParking className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Campus Parking Availability</h3>
                <span className="text-xs text-slate-400">Campus Tech Multi-Level</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">94% Confidence</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 font-mono">
            <div>
              <span className="text-xs text-slate-400 block">Current Available</span>
              <span className="text-2xl font-black text-amber-300">14 spots</span>
            </div>
            <div>
              <span className="text-xs text-cyan-400 block">15-Min Prediction</span>
              <span className="text-2xl font-black text-rose-400">2 spots (Full)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Parking Diversion Recommendation:
            </div>
            <p>
              Redirect incoming vehicles to Metro Park & Ride (155 open bays) to reduce commercial cruising traffic.
            </p>
          </div>
        </div>

        {/* 4. Pedestrian Crosswalk Risk Projection */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Pedestrian Hazard Index</h3>
                <span className="text-xs text-slate-400">Gate 2 Crosswalk</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">89% Confidence</span>
          </div>

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 font-mono">
            <div>
              <span className="text-xs text-slate-400 block">Current Score</span>
              <span className="text-2xl font-black text-rose-300">78 / 100</span>
            </div>
            <div>
              <span className="text-xs text-cyan-400 block">15-Min Prediction</span>
              <span className="text-2xl font-black text-rose-400">84 / 100</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-cyan-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> VRU Safety Precaution:
            </div>
            <p>
              Display overhead skywalk guidance banners and activate pedestrian-priority pelican cycle at Market Cross.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
