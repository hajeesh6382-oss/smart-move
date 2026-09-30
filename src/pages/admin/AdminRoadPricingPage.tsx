import React, { useState, useEffect } from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import {
  Coins,
  Shield,
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  RefreshCw,
  Activity,
  Flame,
  Radio,
} from 'lucide-react';
import {
  DEFAULT_ZONES,
  RoadPricingLiveRecord,
  RoadPricingZone,
  RoadPricingPrediction,
  updateZoneCongestion,
  setRoadPricingTestMode,
  getRoadPricingTestMode,
  getPricingThresholds,
  updatePricingThresholds,
  PricingThresholdConfig,
} from '../../services/dynamicPricingService';

export const AdminRoadPricingPage: React.FC = () => {
  const { data: rawZones } = useRealtimeTable('road_pricing_zones');
  const { data: rawLive } = useRealtimeTable('road_pricing_live');
  const { data: rawPredictions } = useRealtimeTable('road_pricing_predictions');

  const [isTestMode, setIsTestMode] = useState<boolean>(getRoadPricingTestMode());
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_central_arterial');
  const [manualCongestion, setManualCongestion] = useState<number>(65);
  const [thresholds, setThresholds] = useState<PricingThresholdConfig>(getPricingThresholds());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  // Price change audit log in admin session
  const [auditLog, setAuditLog] = useState<Array<{
    timestamp: string;
    zoneName: string;
    prev: number;
    curr: number;
    cong: number;
    reason: string;
  }>>([
    {
      timestamp: new Date().toLocaleTimeString(),
      zoneName: 'Central City Arterial',
      prev: 5,
      curr: 10,
      cong: 64,
      reason: 'Traffic delay increased during peak rush window.',
    },
  ]);

  useEffect(() => {
    const handlePricingEvent = (e: any) => {
      if (e.detail) {
        setAuditLog((prev) => [
          {
            timestamp: new Date().toLocaleTimeString(),
            zoneName: e.detail.zoneName || 'Monitored Zone',
            prev: e.detail.previousCharge ?? 0,
            curr: e.detail.currentCharge ?? 0,
            cong: e.detail.congestionPercentage ?? 0,
            reason: e.detail.reason || 'Telemetry update',
          },
          ...prev.slice(0, 15),
        ]);
      }
    };
    window.addEventListener('smartmove_pricing_updated', handlePricingEvent);
    return () => window.removeEventListener('smartmove_pricing_updated', handlePricingEvent);
  }, []);

  const zones: RoadPricingZone[] = (rawZones && rawZones.length > 0) ? rawZones : DEFAULT_ZONES;
  const liveRecords: RoadPricingLiveRecord[] = (rawLive && rawLive.length > 0) ? rawLive : [];
  const predictions: RoadPricingPrediction[] = (rawPredictions && rawPredictions.length > 0) ? rawPredictions : [];

  const handleToggleTestMode = (enabled: boolean) => {
    setIsTestMode(enabled);
    setRoadPricingTestMode(enabled);
  };

  // Scenario 1: 5:00 PM
  const triggerScenario500PM = () => {
    setActiveScenario('5:00 PM');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      45,
      'TEST DATA',
      'Test Scenario 5:00 PM: Fluid evening traffic baseline.'
    );
  };

  // Scenario 2: 5:05 PM
  const triggerScenario505PM = () => {
    setActiveScenario('5:05 PM');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      67,
      'TEST DATA',
      'Test Scenario 5:05 PM: Moderate rush build-up. Speed dropped to 32 km/h.'
    );
  };

  // Scenario 3: 5:10 PM
  const triggerScenario510PM = () => {
    setActiveScenario('5:10 PM');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      82,
      'TEST DATA',
      'Test Scenario 5:10 PM: Severe congestion bottleneck detected. AI predicts 89% 30-min peak.'
    );
  };

  // Scenario 4: Emergency Override
  const triggerEmergencyOverride = () => {
    setActiveScenario('Emergency');
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      95,
      'TEST DATA',
      '🚑 EMERGENCY OVERRIDE: Corridor cleared for active ambulance dispatch. Toll suspended.'
    );
  };

  const handleApplyManualSlider = () => {
    if (!isTestMode) handleToggleTestMode(true);
    updateZoneCongestion(
      selectedZoneId,
      manualCongestion,
      'TEST DATA',
      `Manual test injection: Congestion set to ${manualCongestion}%.`
    );
  };

  const handleSaveThresholds = () => {
    updatePricingThresholds(thresholds);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const currentZoneLive = liveRecords.find((r) => r.zone_id === selectedZoneId);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Top Admin Header */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0d1624] relative shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-3">
                  Dynamic Road Pricing Command Center
                  {isTestMode ? (
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      🔴 TEST MODE ACTIVE
                    </span>
                  ) : (
                    <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      🟢 LIVE MODE ACTIVE
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 font-sans">
                  Deterministic pricing algorithms, threshold governance, real-time pipeline simulator, and audit streaming.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              onClick={() => handleToggleTestMode(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                !isTestMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🟢 LIVE MODE
            </button>
            <button
              type="button"
              onClick={() => handleToggleTestMode(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                isTestMode
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔴 TEST MODE
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Interactive Test Scenarios Runner */}
      <div className="glass-panel p-5 rounded-3xl border border-rose-500/30 bg-slate-950/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <Play className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-xs uppercase font-mono font-bold text-rose-300 tracking-wider">
              Real-Time Verification Test Scenarios (Prompt Spec Section 26)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Automates the 5:00 → 5:05 → 5:10 PM test sequence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Scenario 1: 5:00 PM */}
          <button
            type="button"
            onClick={triggerScenario500PM}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === '5:00 PM'
                ? 'bg-cyan-950/40 border-cyan-500/60 ring-1 ring-cyan-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-cyan-400 flex items-center justify-between">
              <span>Step 1 • 5:00 PM</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Traffic: 45%</div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-0.5">Calculated: ₹5</div>
            <div className="text-[11px] text-slate-400 mt-1">Moderate fluid evening baseline.</div>
          </button>

          {/* Scenario 2: 5:05 PM */}
          <button
            type="button"
            onClick={triggerScenario505PM}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === '5:05 PM'
                ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-amber-400 flex items-center justify-between">
              <span>Step 2 • 5:05 PM</span>
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Traffic: 67%</div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-0.5">Calculated: ₹10</div>
            <div className="text-[11px] text-slate-400 mt-1">Telemetry update triggers recalculation.</div>
          </button>

          {/* Scenario 3: 5:10 PM */}
          <button
            type="button"
            onClick={triggerScenario510PM}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === '5:10 PM'
                ? 'bg-purple-950/40 border-purple-500/60 ring-1 ring-purple-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-purple-400 flex items-center justify-between">
              <span>Step 3 • 5:10 PM</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Traffic: 82%</div>
            <div className="text-xs text-amber-300 font-mono font-bold mt-0.5">Calculated: ₹20 (Pred: 89%)</div>
            <div className="text-[11px] text-slate-400 mt-1">Surges to ₹20; Route Planner alerts users.</div>
          </button>

          {/* Scenario 4: Emergency Suspension */}
          <button
            type="button"
            onClick={triggerEmergencyOverride}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              activeScenario === 'Emergency'
                ? 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[10px] font-mono font-bold uppercase text-rose-400 flex items-center justify-between">
              <span>Emergency Mode</span>
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-white mt-1">Corridor Clearance</div>
            <div className="text-xs text-cyan-300 font-mono font-bold mt-0.5">Toll: ₹0 (Suspended)</div>
            <div className="text-[11px] text-slate-400 mt-1">Emergency vehicles priority corridor.</div>
          </button>
        </div>

        {/* Manual Traffic Injection Slider */}
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-mono font-bold uppercase text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Manual Congestion Injection for Monitored Zone:
            </span>
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-1 font-mono cursor-pointer"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.zone_name} ({z.road_name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <input
              type="range"
              min="0"
              max="100"
              value={manualCongestion}
              onChange={(e) => setManualCongestion(Number(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <span className="text-base font-mono font-bold text-cyan-300 w-12 text-right">
              {manualCongestion}%
            </span>
            <button
              type="button"
              onClick={handleApplyManualSlider}
              className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer transition-all"
            >
              Inject Update
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Threshold Governance & Price Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Threshold Configuration Form */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  Pricing Threshold & Rate Governance
                </h3>
              </div>
              <button
                type="button"
                onClick={handleSaveThresholds}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {saveStatus === 'saved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                {saveStatus === 'saved' ? 'Saved' : 'Save Rules'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Low Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.lowMax}
                  onChange={(e) => setThresholds({ ...thresholds, lowMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Low Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseLowRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseLowRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Moderate Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.moderateMax}
                  onChange={(e) => setThresholds({ ...thresholds, moderateMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Moderate Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseModerateRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseModerateRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">High Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.highMax}
                  onChange={(e) => setThresholds({ ...thresholds, highMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">High Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseHighRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseHighRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Very High Tier Max (%)</label>
                <input
                  type="number"
                  value={thresholds.veryHighMax}
                  onChange={(e) => setThresholds({ ...thresholds, veryHighMax: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Very High Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseVeryHighRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseVeryHighRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Severe Base Charge (₹)</label>
                <input
                  type="number"
                  value={thresholds.baseSevereRate}
                  onChange={(e) => setThresholds({ ...thresholds, baseSevereRate: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-slate-400">Peak Hour Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={thresholds.peakMultiplier}
                  onChange={(e) => setThresholds({ ...thresholds, peakMultiplier: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 font-mono text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Price Change Audit Stream */}
        <div className="lg:col-span-6 space-y-4">
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider">
                  Real-Time Price Audit Stream
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Live Event Subscriber
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {auditLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-white">{log.zoneName}</span>
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className="text-slate-400">Charge:</span>
                    <span className="line-through text-slate-500">₹{log.prev}</span>
                    <span className="text-amber-400 font-bold">→ ₹{log.curr}</span>
                    <span className="text-slate-500">• Congestion: {log.cong}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-sans leading-snug">
                    {log.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
