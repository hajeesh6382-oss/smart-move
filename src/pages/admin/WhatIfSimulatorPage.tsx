// SMARTMOVE What-If Mobility Simulator Page
// Interactive real-time scenario simulation engine with sliders, toggles, and live before vs after table

import React, { useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore } from '../../lib/supabase/mockStore';
import { simulateScenario, SimulationControls } from '../../lib/ai/simulationEngine';
import { BeforeAfterTable } from '../../components/ui/BeforeAfterTable';
import { SourceBadge } from '../../components/ui/SourceBadge';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  TrafficCone,
  Bus,
  Calendar,
  SquareParking,
  Siren,
  TrendingDown,
  CheckCircle2,
} from 'lucide-react';

export const WhatIfSimulatorPage: React.FC = () => {
  const { data: simState } = useRealtimeTable('simulation_state');
  const liveState = simState[0] || {
    traffic_volume: 68,
    signal_optimization: false,
    extra_buses: 0,
    staggered_departure: false,
    parking_guidance: false,
    emergency_vehicle_active: false,
  };

  const [controls, setControls] = useState<SimulationControls>({
    trafficVolume: liveState.traffic_volume,
    signalOptimization: liveState.signal_optimization,
    extraBuses: liveState.extra_buses,
    staggeredDeparture: liveState.staggered_departure,
    parkingGuidance: liveState.parking_guidance,
    emergencyVehicleActive: liveState.emergency_vehicle_active,
  });

  const simResult = simulateScenario(controls);

  const handleApplyToCity = () => {
    cityStore.updateSimulationState({
      traffic_volume: controls.trafficVolume,
      signal_optimization: controls.signalOptimization,
      extra_buses: controls.extraBuses,
      staggered_departure: controls.staggeredDeparture,
      parking_guidance: controls.parkingGuidance,
      emergency_vehicle_active: controls.emergencyVehicleActive,
    });
  };

  const handleReset = () => {
    const defaults: SimulationControls = {
      trafficVolume: 68,
      signalOptimization: false,
      extraBuses: 0,
      staggeredDeparture: false,
      parkingGuidance: false,
      emergencyVehicleActive: false,
    };
    setControls(defaults);
    cityStore.updateSimulationState({
      traffic_volume: 68,
      signal_optimization: false,
      extra_buses: 0,
      staggered_departure: false,
      parking_guidance: false,
      emergency_vehicle_active: false,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Multi-Agency Scenario Modeler
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            What-If Mobility Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Simulate the synchronized systemic outcome of signal adjustments, transit injection, and peak staggering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          <button
            onClick={handleApplyToCity}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> Broadcast Live to City
          </button>
        </div>
      </div>

      {/* Simulator Controls Sandbox */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" /> Coordinated Scenario Interventions
          </span>
          <span className="text-xs text-emerald-400 font-mono font-bold">
            Simulated Efficiency Gain: +{simResult.overallImprovementPct}%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Traffic Volume Slider */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white">City Traffic Volume</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{controls.trafficVolume}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={controls.trafficVolume}
              onChange={(e) => {
                const val = Number(e.target.value);
                setControls((prev) => ({ ...prev, trafficVolume: val }));
                cityStore.updateSimulationState({ traffic_volume: val });
              }}
              className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>20% (Light)</span>
              <span>65% (Normal Peak)</span>
              <span>100% (Severe)</span>
            </div>
          </div>

          {/* 2. Extra Standby Buses */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-cyan-400" /> Extra Transit Shuttles
              </span>
              <span className="font-mono font-bold text-cyan-400 text-sm">+{controls.extraBuses} Buses</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={controls.extraBuses}
              onChange={(e) => {
                const val = Number(e.target.value);
                setControls((prev) => ({ ...prev, extraBuses: val }));
                cityStore.updateSimulationState({ extra_buses: val });
              }}
              className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 (Baseline)</span>
              <span>+2 (Recommended)</span>
              <span>+4 (Max)</span>
            </div>
          </div>

          {/* 3. Adaptive Signal Green Wave Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <TrafficCone className="w-4 h-4 text-amber-400" /> Adaptive Signal Wave
              </div>
              <div className="text-[11px] text-slate-400">Dynamically allocates East/West green splits</div>
            </div>
            <input
              type="checkbox"
              checked={controls.signalOptimization}
              onChange={(e) => {
                const val = e.target.checked;
                setControls((prev) => ({ ...prev, signalOptimization: val }));
                cityStore.updateSimulationState({ signal_optimization: val });
              }}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* 4. Staggered Departures Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-400" /> Staggered Departures
              </div>
              <div className="text-[11px] text-slate-400">Shifts college & tech park exits by 25 min</div>
            </div>
            <input
              type="checkbox"
              checked={controls.staggeredDeparture}
              onChange={(e) => {
                const val = e.target.checked;
                setControls((prev) => ({ ...prev, staggeredDeparture: val }));
                cityStore.updateSimulationState({ staggered_departure: val });
              }}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* 5. Dynamic Parking Guidance Toggle */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <SquareParking className="w-4 h-4 text-blue-400" /> Parking Guidance Diversion
              </div>
              <div className="text-[11px] text-slate-400">Routes cruisers to Metro Park & Ride Hub</div>
            </div>
            <input
              type="checkbox"
              checked={controls.parkingGuidance}
              onChange={(e) => {
                const val = e.target.checked;
                setControls((prev) => ({ ...prev, parkingGuidance: val }));
                cityStore.updateSimulationState({ parking_guidance: val });
              }}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </div>

          {/* 6. Emergency Green Corridor Override */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-rose-400" /> Emergency Preemption
              </div>
              <div className="text-[11px] text-slate-400">Ambulance 108 Priority Wave Active</div>
            </div>
            <input
              type="checkbox"
              checked={controls.emergencyVehicleActive}
              onChange={(e) => {
                const val = e.target.checked;
                setControls((prev) => ({ ...prev, emergencyVehicleActive: val }));
                cityStore.updateSimulationState({ emergency_vehicle_active: val });
              }}
              className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Simulated Before vs After Comparison */}
      <BeforeAfterTable
        metrics={simResult.metrics}
        overallImprovementPct={simResult.overallImprovementPct}
      />
    </div>
  );
};
