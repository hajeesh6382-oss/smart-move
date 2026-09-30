// SMARTMOVE Admin Parking Occupancy Control Panel
// FEATURE 1: Manual IoT-Free Parking Management
// Allows authorized city administrators to record manual parking occupancies and trigger real-time AI predictions.

import React, { useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore, ParkingLiveRecord } from '../../lib/supabase/mockStore';
import { predictionEngine, MultiHorizonParkingPrediction } from '../../services/predictionEngine';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { LastUpdatedIndicator } from '../../components/ui/LastUpdatedIndicator';
import { ConfidenceMeter } from '../../components/ui/ConfidenceMeter';
import {
  SquareParking,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Calendar,
  Building,
  TrendingUp,
  MapPin,
  Clock,
} from 'lucide-react';

export const AdminParkingControlPage: React.FC = () => {
  const { data: parkingLiveRaw } = useRealtimeTable('parking_live');
  const parkingList: ParkingLiveRecord[] = parkingLiveRaw && parkingLiveRaw.length > 0
    ? parkingLiveRaw
    : cityStore.state.parking_live;

  const [selectedHubId, setSelectedHubId] = useState<string>(parkingList[0]?.parking_id || 'pk_metro');
  const currentHub = parkingList.find((p) => p.parking_id === selectedHubId || p.id === selectedHubId) || parkingList[0];

  const [totalCapacity, setTotalCapacity] = useState<number>(currentHub?.total_capacity || 350);
  const [occupiedSpaces, setOccupiedSpaces] = useState<number>(currentHub?.occupied_spaces || 195);
  const [operatingStatus, setOperatingStatus] = useState<string>(currentHub?.status || 'available');
  const [eventNote, setEventNote] = useState<string>(currentHub?.event_note || '');
  const [expectedDemand, setExpectedDemand] = useState<'Normal' | 'High Surge (+25%)' | 'Severe Surge (+50%)' | 'Low (-20%)'>(
    (currentHub?.expected_demand as any) || 'Normal'
  );

  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  // Sync form when hub changes
  const handleSelectHub = (hubId: string) => {
    setSelectedHubId(hubId);
    const target = parkingList.find((p) => p.parking_id === hubId || p.id === hubId);
    if (target) {
      setTotalCapacity(target.total_capacity);
      setOccupiedSpaces(target.occupied_spaces);
      setOperatingStatus(target.status);
      setEventNote(target.event_note || '');
      setExpectedDemand(target.expected_demand || 'Normal');
      setUpdateSuccessMsg(null);
    }
  };

  // Real-time calculated properties
  const safeTotal = Math.max(1, totalCapacity);
  const safeOccupied = Math.max(0, Math.min(safeTotal, occupiedSpaces));
  const calculatedAvailable = Math.max(0, safeTotal - safeOccupied);
  const calculatedOccupancyPct = Math.round((safeOccupied / safeTotal) * 1000) / 10;

  // Run deterministic prediction on current values
  const livePrediction: MultiHorizonParkingPrediction = predictionEngine.predictMultiHorizonParking(
    currentHub?.parking_id || 'pk_metro',
    currentHub?.parking_name || 'Selected Hub',
    calculatedOccupancyPct,
    safeTotal,
    {
      expectedDemand,
      eventNote: eventNote.trim() || undefined,
    }
  );

  // Handle Form Submit
  const handleUpdateOccupancy = (e: React.FormEvent) => {
    e.preventDefault();

    cityStore.updateParkingLive(selectedHubId, {
      total_capacity: safeTotal,
      occupied_spaces: safeOccupied,
      status: operatingStatus as any,
      event_note: eventNote.trim(),
      expected_demand: expectedDemand,
    });

    setUpdateSuccessMsg(
      `Successfully recorded manual occupancy: ${safeOccupied}/${safeTotal} occupied (${calculatedAvailable} spaces available). AI multi-horizon forecast updated.`
    );

    setTimeout(() => {
      setUpdateSuccessMsg(null);
    }, 6000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Municipal Facility Operations
            </span>
            <SourceBadge source="MANUAL DATA" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            IoT-Free AI Parking Occupancy Control
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Admin interface for manual parking verification, capacity governance, and AI time-series forecasting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> Authorized Admin Mode
          </div>
        </div>
      </div>

      {/* Hub Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {parkingList.map((hub) => {
          const isSelected = hub.parking_id === selectedHubId || hub.id === selectedHubId;
          return (
            <div
              key={hub.id}
              onClick={() => handleSelectHub(hub.parking_id || hub.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg ring-1 ring-cyan-500/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                  {hub.parking_id.replace('pk_', '').toUpperCase()}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    hub.available_spaces <= 10
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {hub.available_spaces} Open
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-2 line-clamp-1">{hub.parking_name}</h3>
              <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between text-[11px] font-mono text-slate-400">
                <span>Occupied: {hub.occupied_spaces}</span>
                <span>Total: {hub.total_capacity}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Admin Manual Update Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleUpdateOccupancy}
            className="glass-panel p-6 sm:p-7 rounded-3xl border border-slate-800 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SquareParking className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white font-display">
                  Update Occupancy: {currentHub?.parking_name}
                </h2>
              </div>
              <SourceBadge source="MANUAL DATA" />
            </div>

            {/* Success feedback notification */}
            {updateSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{updateSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Parking Facility Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Facility Name</label>
                <input
                  type="text"
                  disabled
                  value={currentHub?.parking_name || ''}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono"
                />
              </div>

              {/* Coordinates */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">GPS Location</label>
                <input
                  type="text"
                  disabled
                  value={`${currentHub?.latitude}, ${currentHub?.longitude}`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono"
                />
              </div>

              {/* Total Capacity */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Total Capacity (Spaces)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>

              {/* Currently Occupied */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Currently Occupied Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalCapacity}
                  value={occupiedSpaces}
                  onChange={(e) => setOccupiedSpaces(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Live Auto-Calculated Availability Stats */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block uppercase">Available</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{calculatedAvailable}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block uppercase">Occupied</span>
                <span className="text-2xl font-black font-mono text-cyan-300">{safeOccupied}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block uppercase">Occupancy %</span>
                <span className="text-2xl font-black font-mono text-white">{calculatedOccupancyPct}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Operating Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Operating Status</label>
                <select
                  value={operatingStatus}
                  onChange={(e) => setOperatingStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="available">🟢 Available & Open</option>
                  <option value="filling_fast">🟡 Filling Fast (High Traffic)</option>
                  <option value="nearly_full">🔴 Nearly Full (&lt; 10 Spots)</option>
                  <option value="closed">⛔ Closed for Maintenance</option>
                </select>
              </div>

              {/* Expected Demand Multiplier */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Expected Demand Factor
                </label>
                <select
                  value={expectedDemand}
                  onChange={(e) => setExpectedDemand(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  <option value="Normal">Normal Traffic Patterns</option>
                  <option value="High Surge (+25%)">High Surge (+25% Inflow)</option>
                  <option value="Severe Surge (+50%)">Severe Surge (+50% Inflow)</option>
                  <option value="Low (-20%)">Low Demand (-20% Off-Peak)</option>
                </select>
              </div>
            </div>

            {/* Optional Event / Disruption Context */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Optional Event Context (e.g. Festival, College Dismissal, Market Day)
              </label>
              <input
                type="text"
                value={eventNote}
                onChange={(e) => setEventNote(e.target.value)}
                placeholder="e.g. Annual College Convocation / Tech Park Dispersal at 17:00"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none placeholder-slate-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 fill-slate-950" />
              UPDATE PARKING OCCUPANCY IN SUPABASE
            </button>
          </form>
        </div>

        {/* Right: Live AI Multi-Horizon Prediction Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-display">
                  Live AI Multi-Horizon Forecast
                </h3>
              </div>
              <SourceBadge source="ai_prediction" provider="SMARTMOVE Deterministic Model" />
            </div>

            <div className="text-xs text-slate-300">
              Based on manual occupancy ({safeOccupied}/{safeTotal}), historical hourly curves, day of week, and nearby traffic.
            </div>

            {/* 4 Horizons Grid: 15m, 30m, 45m, 60m */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {livePrediction.forecasts.map((f) => (
                <div
                  key={f.minutes}
                  className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-center"
                >
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    +{f.minutes} Min
                  </span>
                  <div className="mt-1 text-lg font-black font-mono text-cyan-300">
                    {f.availableSpaces}
                  </div>
                  <span className="text-[10px] text-slate-400">spaces open</span>
                  <div
                    className={`mt-1.5 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                      f.status === 'FULL'
                        ? 'bg-rose-500/20 text-rose-300'
                        : f.status === 'LIMITED'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {f.status}
                  </div>
                </div>
              ))}
            </div>

            <ConfidenceMeter value={livePrediction.overallConfidencePct} label="Forecast Model Confidence" />

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> {livePrediction.demandAlert}
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {livePrediction.aiRecommendation}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
              Formula: {livePrediction.formulaDescription}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
