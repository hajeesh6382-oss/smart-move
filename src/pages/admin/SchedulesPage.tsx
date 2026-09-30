// SMARTMOVE College + Office Schedule Intelligence Page
// Ingests departure times, builds the Peak Demand Curve, and provides Staggered Departure AI optimization

import React, { useState } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore } from '../../lib/supabase/mockStore';
import { calculatePeakDemandCurve, PeakWindow } from '../../lib/ai/formulas';
import { generateStaggeredPlan, StaggeredOptimizationPlan } from '../../lib/ai/staggeredOptimizer';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Calendar, Plus, Trash2, Clock, Sparkles, TrendingDown, Users, CheckCircle2, ArrowRight } from 'lucide-react';

export const SchedulesPage: React.FC = () => {
  const { data: schedules } = useRealtimeTable('mobility_schedules');
  const [newEntity, setNewEntity] = useState({
    entity_name: '',
    entity_type: 'college',
    departure_time: '17:00',
    expected_people: 1500,
    zone: 'Tech Corridor',
  });

  const peakWindows: PeakWindow[] = calculatePeakDemandCurve(schedules);
  const staggeredPlan: StaggeredOptimizationPlan = generateStaggeredPlan(schedules);

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.entity_name) return;
    cityStore.addSchedule(newEntity);
    setNewEntity({
      entity_name: '',
      entity_type: 'college',
      departure_time: '17:00',
      expected_people: 1500,
      zone: 'Tech Corridor',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Shift & Class Dispersal Ingestion
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            College & Office Schedule Intelligence
          </h2>
          <p className="text-xs text-slate-400">
            Ingests scheduled dismissal windows to construct proactive surge curves and optimize staggered departure slots.
          </p>
        </div>
      </div>

      {/* Peak Demand Curve Visualization */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Peak Mobility Demand Forecast (15-Min Intervals)
          </span>
          <span className="text-xs text-rose-400 font-mono font-bold">
            🔴 Peak Window: 17:00 - 17:30 (Severe Demand)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {peakWindows.map((win, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                win.severity === 'Severe'
                  ? 'bg-rose-950/30 border-rose-500/50 text-rose-200 shadow-lg shadow-rose-950/40'
                  : win.severity === 'High'
                  ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <div className="text-[11px] font-mono font-bold mb-1">{win.timeWindow}</div>
                <div className="text-lg font-black font-mono">{win.totalPeople}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Commuters</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] font-bold uppercase">
                {win.severity} Demand
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Staggered Departure Comparison */}
      <div className="glass-panel-glow p-6 rounded-3xl border border-cyan-500/30 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="text-xs font-mono uppercase font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Staggered Departure Recommendation Plan
            </div>
            <h3 className="text-base lg:text-lg font-bold text-white font-display mt-0.5">
              Current Baseline vs AI-Suggested Staggered Dismissals
            </h3>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 font-mono text-xs text-emerald-300">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>Demand Spike Flattened by <strong className="text-white">42%</strong></span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs lg:text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                <th className="pb-3 pl-2">Institution / Corporate Entity</th>
                <th className="pb-3 px-4">Type</th>
                <th className="pb-3 px-4">Current Dismissal</th>
                <th className="pb-3 px-4 text-emerald-400">AI-Suggested Slot</th>
                <th className="pb-3 px-4">Shift Delta</th>
                <th className="pb-3 pr-2 hidden md:table-cell">Load-Balancing Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium font-mono">
              {staggeredPlan.entities.map((ent) => (
                <tr key={ent.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 pl-2 text-white font-semibold flex items-center gap-2 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {ent.name}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[11px] text-slate-400 font-sans">
                    {ent.type}
                  </td>
                  <td className="py-3.5 px-4 text-rose-300 font-bold">
                    {ent.currentDeparture}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300 font-black">
                    {ent.suggestedDeparture}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-xs font-bold">
                      {ent.shiftDeltaMin > 0 ? `+${ent.shiftDeltaMin} min` : `${ent.shiftDeltaMin} min`}
                    </span>
                  </td>
                  <td className="py-3.5 pr-2 text-slate-300 text-xs font-sans hidden md:table-cell">
                    {ent.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-800">
          ℹ️ {staggeredPlan.disclaimer}
        </div>
      </div>

      {/* Add Entity Form & Schedules Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleAddSchedule} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-cyan-400" /> Ingest New Schedule
          </h3>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Entity Name</label>
            <input
              type="text"
              value={newEntity.entity_name}
              onChange={(e) => setNewEntity({ ...newEntity, entity_name: e.target.value })}
              placeholder="e.g. KV Central School"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Type</label>
              <select
                value={newEntity.entity_type}
                onChange={(e) => setNewEntity({ ...newEntity, entity_type: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="college">College</option>
                <option value="office">Office</option>
                <option value="school">School</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Departure Time</label>
              <input
                type="time"
                value={newEntity.departure_time}
                onChange={(e) => setNewEntity({ ...newEntity, departure_time: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Expected Commuters</label>
            <input
              type="number"
              value={newEntity.expected_people}
              onChange={(e) => setNewEntity({ ...newEntity, expected_people: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            Add to Mobility Schedule
          </button>
        </form>

        {/* Existing Schedules Table */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Institutional Schedules ({schedules.length})
            </h3>
          </div>

          <div className="space-y-2">
            {schedules.map((sch: any) => (
              <div
                key={sch.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-white text-xs">{sch.entity_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {sch.entity_type.toUpperCase()} • Departure: {sch.departure_time} • {sch.expected_people} people
                  </div>
                </div>

                <button
                  onClick={() => cityStore.deleteSchedule(sch.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Remove Schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
