// SMARTMOVE Admin Command Center Dashboard
// Unified smart-city command center monitoring traffic, buses, parking, signals, emissions, and active AI interventions
// Real Google Maps integration, live incident dispatcher, and multi-agency telemetry

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { LiveBadge } from '../../components/ui/LiveBadge';
import { SmartCityMap } from '../../components/map/SmartCityMap';
import { AddIncidentModal } from '../../components/ui/AddIncidentModal';
import { aiMobilityBrain } from '../../lib/ai/mobilityBrain';
import {
  Layers,
  Activity,
  Bus,
  SquareParking,
  AlertTriangle,
  Siren,
  Sparkles,
  SlidersHorizontal,
  Clock,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  PlusCircle,
  Check,
  Zap,
  RotateCcw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);

  const { data: trafficData } = useRealtimeTable('traffic_data');
  const { data: busRoutes } = useRealtimeTable('bus_routes');
  const { data: parkingLots } = useRealtimeTable('parking_locations');
  const { data: aiRecs } = useRealtimeTable('ai_recommendations');
  const { data: simState } = useRealtimeTable('simulation_state');
  const { data: emissions } = useRealtimeTable('emission_data');
  const { data: activeIncidents } = useRealtimeTable('active_incidents');

  const state = simState[0] || { traffic_volume: 68, sim_clock: '17:15', emergency_vehicle_active: false };
  const em = emissions[0] || { co2_kg_hr: 540.2, fuel_wasted_liters_hr: 215.8 };

  const handleTriggerScenario = (type: 'accident' | 'peak' | 'emergency' | 'flood' | 'reset') => {
    if (type === 'accident') {
      aiMobilityBrain.processLiveIncident({
        title: 'Major Multi-Vehicle Accident',
        location_name: 'Five Roads Junction, Salem',
        type: 'accident',
        severity: 'critical',
        description: '2 of 3 arterial lanes blocked. Severe queue buildup propagating toward Tech Corridor.',
        duration_min: 45,
      });
    } else if (type === 'peak') {
      aiMobilityBrain.processLiveIncident({
        title: 'NIT & Sona Tech Simultaneous Dispersal',
        location_name: 'Sona Tech Campus Gate',
        type: 'peak_surge',
        severity: 'high',
        description: '7,100 students dismissing simultaneously. Bus 102 queue exceeds 140 passengers.',
        duration_min: 30,
      });
    } else if (type === 'emergency') {
      aiMobilityBrain.processLiveIncident({
        title: 'Ambulance 108 Emergency Green Wave Corridor',
        location_name: 'Govt Medical College Hospital Road',
        type: 'emergency_corridor',
        severity: 'high',
        description: 'Cardiac emergency transit. AI preemption clearing North/South approaches along Five Roads.',
        duration_min: 15,
      });
    } else if (type === 'flood') {
      aiMobilityBrain.processLiveIncident({
        title: 'Monsoon Waterlogging & Road Blockade',
        location_name: 'Salem Central Market Bazaar',
        type: 'weather_storm',
        severity: 'high',
        description: '1.5 ft water accumulation blocking light vehicles. Complete diversion active.',
        duration_min: 60,
      });
    } else if (type === 'reset') {
      activeIncidents?.forEach((i: any) => aiMobilityBrain.resolveIncident(i.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-purple-400">
              City Operations Center
            </span>
            <LiveBadge />
            <SourceBadge source="REAL GOOGLE MAPS" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Urban Mobility Command Center
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-agency operations dispatching AI interventions and dynamically adapting city flow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsAddIncidentOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-rose-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Live Incident
          </button>

          <button
            onClick={() => navigate('/admin/what-if')}
            className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> What-If Simulator
          </button>

          <button
            onClick={() => navigate('/demo')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            🎬 12-Step Demo
          </button>
        </div>
      </div>

      {/* One-Click Scenario Dispatch Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Zap className="w-4 h-4 text-cyan-400" />
          </span>
          <div>
            <div className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Live Incident Dispatcher
            </div>
            <div className="text-[11px] text-slate-400">Inject real-time incidents to test AI network reactivity</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleTriggerScenario('accident')}
            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            🚨 Major Accident
          </button>
          <button
            onClick={() => handleTriggerScenario('peak')}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            🎓 College Dispersal
          </button>
          <button
            onClick={() => handleTriggerScenario('emergency')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            🚑 Ambulance Corridor
          </button>
          <button
            onClick={() => handleTriggerScenario('flood')}
            className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all cursor-pointer"
          >
            🌧️ Road Closure
          </button>
          <button
            onClick={() => handleTriggerScenario('reset')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset Flow
          </button>
        </div>
      </div>

      {/* 6 City Status Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Corridor Congestion"
          value={`${trafficData[0]?.congestion_pct || 84}%`}
          unit="Peak Index"
          subtitle="College Road Bottleneck"
          icon={<Activity className="w-4 h-4 text-rose-400" />}
          badge={<StatusBadge status={trafficData[0]?.congestion_pct > 75 ? 'severe' : 'moderate'} />}
          onClick={() => navigate('/admin/peak-manager')}
        />

        <StatCard
          title="Bus Capacity Overload"
          value={`${busRoutes[0]?.current_occupancy_pct || 94}%`}
          unit="Route 102"
          subtitle={`+${busRoutes[0]?.delay_min || 8}m Delay`}
          icon={<Bus className="w-4 h-4 text-amber-400" />}
          badge={<StatusBadge status={busRoutes[0]?.current_occupancy_pct > 88 ? 'overloaded' : 'low'} />}
          onClick={() => navigate('/app/buses')}
        />

        <StatCard
          title="Campus Parking"
          value={`${parkingLots[0]?.available_spots || 14} Spots`}
          unit="Available"
          subtitle="Metro Hub has 155 open"
          icon={<SquareParking className="w-4 h-4 text-rose-400" />}
          badge={<StatusBadge status={parkingLots[0]?.available_spots < 15 ? 'filling_fast' : 'ample_spots'} />}
          onClick={() => navigate('/app/parking')}
        />

        <StatCard
          title="Active Incidents"
          value={activeIncidents?.filter((i: any) => i.status === 'active').length || 0}
          unit="Live Alerts"
          subtitle="Network Telemetry"
          icon={<ShieldAlert className="w-4 h-4 text-rose-400" />}
          badge={<StatusBadge status="severe" />}
          onClick={() => setIsAddIncidentOpen(true)}
        />

        <StatCard
          title="Emergency Link"
          value={state.emergency_vehicle_active ? 'Active' : 'Standby'}
          unit="Preemption"
          subtitle="Junction D Signal Wave"
          icon={<Siren className="w-4 h-4 text-emerald-400" />}
          badge={<StatusBadge status={state.emergency_vehicle_active ? 'available' : 'low'} />}
          onClick={() => navigate('/admin/emergency')}
        />

        <StatCard
          title="Estimated CO₂"
          value={em.co2_kg_hr}
          unit="kg / hr"
          subtitle="Stop-and-go Idling"
          icon={<TrendingDown className="w-4 h-4 text-purple-400" />}
          source="ESTIMATED VALUE"
          onClick={() => navigate('/app/sustainability')}
        />
      </div>

      {/* Live OpenStreetMap GIS & Interventions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <SmartCityMap
            trafficData={trafficData}
            busRoutes={busRoutes}
            parkingLocations={parkingLots}
            emergencyActive={state.emergency_vehicle_active}
            fullHeight={true}
            className="w-full h-full min-h-[500px]"
          />
        </div>

        {/* AI Recommendations Stream & Active Incidents */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Live AI Interventions
              </span>
              <SourceBadge source="REAL GOOGLE MAPS" />
            </div>

            <div className="mt-4 space-y-3">
              {aiRecs.slice(0, 3).map((rec: any) => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white line-clamp-1">{rec.title}</span>
                    <span className="text-emerald-400 font-mono font-bold text-[11px] shrink-0">{rec.confidence}% Conf</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-2">{rec.recommendation}</p>
                </div>
              ))}
            </div>

            {/* Active Incidents List */}
            {activeIncidents && activeIncidents.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="text-[11px] font-mono uppercase font-bold text-slate-400 mb-2">
                  Active Incidents ({activeIncidents.length})
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeIncidents.map((inc: any) => (
                    <div
                      key={inc.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-white truncate">{inc.title}</div>
                        <div className="text-[10px] text-slate-400 truncate">{inc.location_name}</div>
                      </div>
                      <button
                        onClick={() => aiMobilityBrain.resolveIncident(inc.id)}
                        className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold hover:bg-emerald-500/30 shrink-0 cursor-pointer flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/admin/recommendations')}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            View All AI Recommendations <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Add Incident Modal */}
      <AddIncidentModal
        isOpen={isAddIncidentOpen}
        onClose={() => setIsAddIncidentOpen(false)}
      />
    </div>
  );
};
