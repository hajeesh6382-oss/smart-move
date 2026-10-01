import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { LeafletCityMap } from '../../components/map/LeafletCityMap';
import {
  Coins,
  Activity,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  DEFAULT_ZONES,
  RoadPricingLiveRecord,
  RoadPricingZone,
  RoadPricingPrediction,
  TrafficLiveRecord,
  getRoadPricingTestMode,
} from '../../services/dynamicPricingService';

export const DynamicRoadPricingPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: rawZones } = useRealtimeTable('road_pricing_zones');
  const { data: rawLive } = useRealtimeTable('road_pricing_live');
  const { data: rawPredictions } = useRealtimeTable('road_pricing_predictions');
  const { data: rawTraffic } = useRealtimeTable('traffic_live');

  const [isTestMode, setIsTestMode] = useState<boolean>(getRoadPricingTestMode());
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone_central_arterial');

  // Listen for mode changes or pricing updates
  useEffect(() => {
    const handleModeChange = (e: any) => {
      setIsTestMode(!!e.detail?.isTestMode);
    };
    window.addEventListener('smartmove_mode_changed', handleModeChange);
    return () => window.removeEventListener('smartmove_mode_changed', handleModeChange);
  }, []);

  const zones: RoadPricingZone[] = (rawZones && rawZones.length > 0) ? rawZones : DEFAULT_ZONES;
  const liveRecords: RoadPricingLiveRecord[] = (rawLive && rawLive.length > 0) ? rawLive : [];
  const predictions: RoadPricingPrediction[] = (rawPredictions && rawPredictions.length > 0) ? rawPredictions : [];
  const trafficRecords: TrafficLiveRecord[] = (rawTraffic && rawTraffic.length > 0) ? rawTraffic : [];

  // Selected Zone Details
  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[0];
  const selectedLive = liveRecords.find((r) => r.zone_id === selectedZoneId) || {
    congestion_percentage: 64,
    current_charge: 10,
    previous_charge: 5,
    pricing_reason: 'Moderate corridor flow. Standard congestion recommendation.',
    source: isTestMode ? 'TEST DATA' : 'LIVE TRAFFIC API',
    updated_at: new Date().toISOString(),
  };

  const selectedTraffic = trafficRecords.find((t) => t.road_id === selectedZoneId);
  const zonePredictions = predictions.filter((p) => p.zone_id === selectedZoneId);

  // Aggregated Stats
  const avgCongestion = liveRecords.length > 0
    ? Math.round(liveRecords.reduce((acc, r) => acc + r.congestion_percentage, 0) / liveRecords.length)
    : selectedLive.congestion_percentage;

  const maxCharge = liveRecords.length > 0
    ? Math.max(...liveRecords.map((r) => r.current_charge))
    : selectedLive.current_charge;

  const activeZonesCount = zones.filter((z) => z.status === 'active').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-[#07131e] relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-black font-display text-white tracking-tight flex items-center gap-3">
                  Dynamic Road Pricing (ERP)
                  {isTestMode ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                      🔴 TEST MODE
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      🟢 LIVE MODE
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 font-sans">
                  AI-powered congestion pricing recommendation inspired by modern Electronic Road Pricing.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/routes"
              className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              Plan Toll-Free Route <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Disclaimer Notice */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            <strong>Public Information:</strong> SMARTMOVE calculates and displays congestion pricing recommendations for traffic demand smoothing. No financial accounts or actual bank debits are triggered.
          </span>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Current Congestion */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-bold text-[10px]">Avg Congestion</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {avgCongestion}%
          </div>
          <div className="text-[11px] text-slate-400">
            Across {activeZonesCount} monitored corridors
          </div>
        </div>

        {/* Active Zones */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-bold text-[10px]">Monitored Zones</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white mt-1">
            {activeZonesCount}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">
            100% telemetry online
          </div>
        </div>

        {/* Recommended Charge */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-bold text-[10px]">Peak Congestion Charge</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mt-1">
            ₹{maxCharge}
          </div>
          <div className="text-[11px] text-slate-400">
            Range: ₹0 – ₹30 tier
          </div>
        </div>

        {/* AI Prediction (30 min) */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-bold text-[10px]">AI 30-Min Forecast</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black font-mono text-purple-300 mt-1">
            {zonePredictions.find((p) => p.prediction_horizon === 30)?.predicted_congestion ?? Math.min(100, avgCongestion + 8)}%
          </div>
          <div className="text-[11px] text-purple-400 font-mono">
            Confidence: {zonePredictions.find((p) => p.prediction_horizon === 30)?.confidence ?? 84}%
          </div>
        </div>

        {/* Data Provenance */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-mono uppercase font-bold text-[10px]">Data Provenance</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xs font-black font-mono text-cyan-300 mt-1">
            {selectedLive.source}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Updated {new Date(selectedLive.updated_at).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* AI Mobility Brain Insight Panel */}
      <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-[#041525] shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs uppercase font-mono font-bold text-cyan-300 tracking-wider">
            SMARTMOVE AI Mobility Brain • Congestion Pricing Reasoning
          </span>
        </div>

        <div className="mt-3.5 space-y-2">
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
            <strong className="text-white font-bold">{selectedZone.zone_name}: </strong>
            {selectedLive.pricing_reason}
            {' '}AI predicts traffic demand to peak at{' '}
            <strong className="text-purple-300 font-mono">
              {zonePredictions.find((p) => p.prediction_horizon === 30)?.predicted_congestion ?? 82}%
            </strong>{' '}
            over the next 30 minutes. To maintain corridor fluid velocity (&gt; 35 km/h), dynamic congestion pricing recommends ₹{selectedLive.current_charge}. Commuters using transit or bypass routes travel at ₹0.
          </div>
        </div>
      </div>

      {/* Zone Selector and Detailed Monitor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Monitored Corridors Cards */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              Active Road Pricing Zones ({zones.length})
            </h3>
            <span className="text-xs font-mono text-slate-400">Click to inspect</span>
          </div>

          <div className="space-y-3">
            {zones.map((zone) => {
              const live = liveRecords.find((r) => r.zone_id === zone.id);
              const cong = live?.congestion_percentage ?? 50;
              const charge = live?.current_charge ?? 10;
              const isSelected = selectedZoneId === zone.id;
              const isSuspended = live?.is_emergency_suspended;

              let tierColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
              if (isSuspended) tierColor = 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
              else if (cong > 85) tierColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
              else if (cong > 70) tierColor = 'text-orange-400 bg-orange-500/10 border-orange-500/30';
              else if (cong > 50) tierColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-950/20 border-amber-500/50 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/40'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${tierColor}`}>
                          {isSuspended ? '🚑 EMERGENCY SUSPENDED' : cong > 85 ? '🔴 SEVERE' : cong > 70 ? '🟠 VERY HIGH' : cong > 50 ? '🟡 HIGH' : '🟢 LOW'}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <h4 className="text-sm font-bold text-white font-display mt-1">{zone.zone_name}</h4>
                      <div className="text-xs text-slate-400 font-sans mt-0.5">{zone.road_name}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-amber-300">
                        {isSuspended ? '₹0' : `₹${charge}`}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Congestion: <strong className="text-white">{cong}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Horizon Prediction Row */}
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Sparkles className="w-3 h-3 text-purple-400" /> AI Forecast:
                    </span>
                    <span className="text-slate-300">15m: <strong className="text-white">{Math.min(100, cong + 4)}%</strong></span>
                    <span className="text-slate-300">30m: <strong className="text-purple-300">{Math.min(100, cong + 8)}%</strong></span>
                    <span className="text-slate-300">45m: <strong className="text-white">{Math.min(100, cong + 10)}%</strong></span>
                    <span className="text-slate-300">60m: <strong className="text-white">{Math.max(20, cong + 3)}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Interactive Map with Pricing Polygons */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Live Pricing Heatmap & Gantry Overlays
            </h3>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
              Live Map Synchronized
            </span>
          </div>

          <div className="glass-panel p-2 rounded-3xl border border-slate-800 h-[480px] overflow-hidden shadow-2xl relative">
            <LeafletCityMap
              initialZoom={13}
              initialCenter={{ lat: 11.6643, lng: 78.1460 }}
              intermediateLocations={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
