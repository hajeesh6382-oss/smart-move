// SMARTMOVE Predictive Parking & EV Guidance Page
// FEATURE 1: IoT-Free AI Predictive Parking Intelligence
// Features: Manual parking telemetry, 4-horizon AI forecasts (15m, 30m, 45m, 60m), Google Map parking markers, and instant GPS navigation.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore, ParkingLiveRecord } from '../../lib/supabase/mockStore';
import { predictionEngine, MultiHorizonParkingPrediction } from '../../services/predictionEngine';
import { useLiveWeather } from '../../hooks/useLiveWeather';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { ConfidenceMeter } from '../../components/ui/ConfidenceMeter';
import { SmartCityMap } from '../../components/map/SmartCityMap';
import { LastUpdatedIndicator } from '../../components/ui/LastUpdatedIndicator';
import {
  SquareParking,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Navigation,
  Clock,
  AlertTriangle,
  SlidersHorizontal,
  MapPin,
  TrendingDown,
  Layers,
  Thermometer,
} from 'lucide-react';

export const PredictiveParkingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: parkingLiveRaw } = useRealtimeTable('parking_live');
  const { data: parkingLocations } = useRealtimeTable('parking_locations');
  const { data: trafficData } = useRealtimeTable('traffic_data');
  const { weather } = useLiveWeather();

  const parkingLiveList: ParkingLiveRecord[] =
    parkingLiveRaw && parkingLiveRaw.length > 0 ? parkingLiveRaw : cityStore.state.parking_live;

  const [selectedHubId, setSelectedHubId] = useState<string>('pk_metro');

  const handleNavigate = (name: string, lat: number, lng: number) => {
    console.log('[SMARTMOVE Navigation] Initiating navigation to:', name, lat, lng);
    navigate(`/app/routes?dest=${encodeURIComponent(name)}&destLat=${lat}&destLng=${lng}&autoStart=true`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              IoT-Free Parking Intelligence
            </span>
            <SourceBadge source="MANUAL DATA" />
            <SourceBadge source="ai_prediction" provider="SMARTMOVE Deterministic Model" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            AI Predictive Parking & EV Hubs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Grounded capacity governance combining verified manual updates, historical baselines, and 60-minute time-series forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/parking-control')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Admin Occupancy Control
          </button>
        </div>
      </div>

      {/* Recommended Hub Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5 max-w-2xl">
          <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Recommended Parking Facility
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white font-display mt-0.5">
              Metro Park & Ride Hub (155 Open Bays + Ultra-Fast EV)
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Diverting from congested downtown lots saves ~12 minutes of cruising search time and avoids 95 liters of queue idling emissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleNavigate('Metro Park & Ride Hub', 12.9640, 77.6180)}
          className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Navigation className="w-4 h-4 fill-slate-950" />
          Navigate to Metro Hub
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Parking Map with Status Coded Markers */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-display">
              Regional Parking Locations & Real-Time Availability Map
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> &gt;30% Open
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> 10-30% Limited
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> &lt;10% Nearly Full
            </span>
          </div>
        </div>

        <div className="h-[360px] rounded-2xl overflow-hidden border border-slate-800">
          <SmartCityMap
            trafficData={trafficData}
            parkingLocations={parkingLocations}
            fullHeight={true}
            className="w-full h-full min-h-[360px]"
          />
        </div>
      </div>

      {/* Parking Facility Cards with 4-Horizon AI Forecasts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {parkingLiveList.map((lot) => {
          const occupancyPct = lot.occupancy_percentage;
          const isHighAvail = lot.available_spaces > 40;
          const isLowAvail = lot.available_spaces <= 15;

          // Deterministic 4-horizon AI forecast calculation
          const prediction: MultiHorizonParkingPrediction = predictionEngine.predictMultiHorizonParking(
            lot.parking_id || lot.id,
            lot.parking_name,
            occupancyPct,
            lot.total_capacity,
            {
              isRaining: weather?.condition.toLowerCase().includes('rain'),
              expectedDemand: lot.expected_demand,
              eventNote: lot.event_note,
            }
          );

          return (
            <div
              key={lot.id}
              className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xl ${
                isHighAvail
                  ? 'glass-panel-glow border-cyan-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-[#051829]'
                  : 'glass-panel border-slate-800 bg-slate-900/70'
              }`}
            >
              {/* Card Top Title & Provenance */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white font-display">{lot.parking_name}</h3>
                    {lot.has_ev && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 font-bold">
                        <Zap className="w-3 h-3" /> EV Fast
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                    <span>₹{lot.hourly_rate}/hr</span>
                    <span>•</span>
                    <span>GPS: {lot.latitude}, {lot.longitude}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider ${
                      lot.status === 'nearly_full'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : lot.status === 'filling_fast'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {lot.status === 'nearly_full'
                      ? '🔴 NEARLY FULL'
                      : lot.status === 'filling_fast'
                      ? '🟡 FILLING FAST'
                      : '🟢 AVAILABLE'}
                  </span>
                  <SourceBadge source="MANUAL DATA" />
                </div>
              </div>

              {/* Current Occupancy Metrics Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 grid grid-cols-3 gap-2 text-center font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Total Capacity</span>
                  <span className="text-lg font-black text-slate-200">{lot.total_capacity}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Occupied</span>
                  <span className="text-lg font-black text-cyan-300">{lot.occupied_spaces}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">Available</span>
                  <span className={`text-lg font-black ${isLowAvail ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lot.available_spaces}
                  </span>
                </div>
              </div>

              {/* Occupancy Percentage Bar */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-slate-400">Current Facility Occupancy:</span>
                  <span className="text-white font-bold">{occupancyPct}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      occupancyPct > 90 ? 'bg-rose-500' : occupancyPct > 70 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              {/* AI Forecast Section: 15m, 30m, 45m, 60m */}
              <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI Predictive Forecast
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Confidence {prediction.overallConfidencePct}%
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {prediction.forecasts.map((f) => (
                    <div
                      key={f.minutes}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800/80"
                    >
                      <span className="text-[10px] font-mono text-slate-400 uppercase block">
                        +{f.minutes}m
                      </span>
                      <span className="text-base font-black font-mono text-cyan-300 block my-0.5">
                        {f.availableSpaces}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold uppercase px-1 py-0.5 rounded block ${
                          f.status === 'FULL'
                            ? 'bg-rose-500/20 text-rose-300'
                            : f.status === 'LIMITED'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Demand Warning & Recommendation */}
                <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{prediction.demandAlert}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {prediction.aiRecommendation}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer with Navigate Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <LastUpdatedIndicator timestamp={lot.updated_at} />

                <button
                  type="button"
                  onClick={() => handleNavigate(lot.parking_name, lot.latitude, lot.longitude)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
                >
                  <Navigation className="w-3.5 h-3.5 fill-slate-950" />
                  Navigate to Hub
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
