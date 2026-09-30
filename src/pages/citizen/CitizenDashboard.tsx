// SMARTMOVE Citizen Dashboard
// Features personalized greeting, quick search, live cards, AI Mobility Insight card, Live GIS Map, and Connected Effects
// Extended with real weather telemetry, air quality stream, and global LIVE/DEMO mode toggle.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { useLiveWeather } from '../../hooks/useLiveWeather';
import { useAirQuality } from '../../hooks/useAirQuality';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { ModeToggle } from '../../components/ui/ModeToggle';
import { LastUpdatedIndicator } from '../../components/ui/LastUpdatedIndicator';
import { InsightCard } from '../../components/ui/InsightCard';
import { SmartCityMap } from '../../components/map/SmartCityMap';
import { ConnectedEffectsDiagram } from '../../components/ui/ConnectedEffectsDiagram';
import {
  Search,
  Navigation,
  Bus,
  SquareParking,
  Leaf,
  Bell,
  Sparkles,
  ArrowRight,
  Thermometer,
  Activity,
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [destinationSearch, setDestinationSearch] = useState('');

  // Real-time table streams & live weather/air quality
  const { data: trafficData } = useRealtimeTable('traffic_data');
  const { data: busRoutes } = useRealtimeTable('bus_routes');
  const { data: parkingLots } = useRealtimeTable('parking_locations');
  const { data: aiRecs } = useRealtimeTable('ai_recommendations');
  const { data: simState } = useRealtimeTable('simulation_state');
  const { data: alerts } = useRealtimeTable('alerts');
  const { data: activeIncidents } = useRealtimeTable('active_incidents');
  const { weather } = useLiveWeather();
  const { airQuality } = useAirQuality();

  const activeRec = aiRecs[0] || {
    id: 'rec_01',
    category: 'transit',
    title: 'Deploy 2 Standby Feeder Buses to College Gate',
    problem: 'Simultaneous departure of NIT and City College causing 94% overload on Bus Route 102.',
    prediction: 'Bus 102 queue will exceed 140 passengers with 15+ min wait times.',
    recommendation: 'Activate 2 standby high-capacity electric buses from North Depot between 17:00 and 17:40.',
    estimated_impact: '-38% passenger wait time, -22% road vehicular surge.',
    why_reasons: ['NIT 2,200 students dismiss at 17:00', 'Bus 102 currently at 94% capacity', 'Direct correlation to College Road 84% congestion'],
    confidence: 93,
    connected_effects: ['Traffic Surge', 'Bus Overload', 'Pedestrian Risk at Gate', 'Emissions Spike'],
  };

  const collegeTraffic = trafficData.find((t: any) => t.id === 'tf_college') || trafficData[0] || { congestion_pct: 84, avg_speed_kmh: 14 };
  const bus102 = busRoutes.find((b: any) => b.route_number === '102') || busRoutes[0] || { current_eta_min: 6, current_occupancy_pct: 94, delay_min: 8 };
  const campusParking = parkingLots.find((p: any) => p.id === 'pk_campus') || parkingLots[0] || { available_spots: 14 };
  const latestAlert = alerts[0] || { title: 'College Road Peak Congestion', message: 'Heavy vehicle volume detected.' };
  const activeCritical = activeIncidents?.find((i: any) => i.status === 'active');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (destinationSearch.trim()) {
      navigate(`/app/routes?dest=${encodeURIComponent(destinationSearch.trim())}`);
    } else {
      navigate('/app/routes');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle Section */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-[#06182c] shadow-2xl">
        <div className="relative z-10 max-w-4xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-wider font-mono font-bold text-cyan-400">
                Personalized Mobility Feed
              </span>
              <LastUpdatedIndicator timestamp={weather?.timestamp} />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-white tracking-tight">
              {t('dashboard.greeting', 'Welcome back')}, {user?.full_name?.split(' ')[0] || 'Citizen'}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {activeCritical
                ? `Real-time disruption: ${activeCritical.title} reported at ${activeCritical.location_name}. AI rerouting active.`
                : 'Evening peak surge is active across Tech Corridor. Coordinated transit and green wave signals are in progress.'}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={destinationSearch}
                  onChange={(e) => setDestinationSearch(e.target.value)}
                  placeholder="Where are you traveling in the city? (e.g. City Hospital, Metro Hub)"
                  className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-cyan-400 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none shadow-xl transition-all font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex-shrink-0"
              >
                Plan Route
              </button>
            </form>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
            <ModeToggle />
            {weather && (
              <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-right text-xs">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono">
                  <Thermometer className="w-3.5 h-3.5" /> {weather.temperatureC}°C {weather.condition}
                </div>
                {airQuality && (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono mt-0.5 justify-end">
                    <Activity className="w-3 h-3" /> AQI: {airQuality.aqiCategory} ({airQuality.aqi}/5)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5 Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Corridor Traffic"
          value={`${collegeTraffic.congestion_pct}%`}
          unit="Jam Index"
          subtitle={`Avg Speed ${collegeTraffic.avg_speed_kmh} km/h`}
          icon={<Navigation className="w-4 h-4" />}
          badge={<StatusBadge status={collegeTraffic.congestion_pct > 75 ? 'severe' : 'moderate'} />}
          onClick={() => navigate('/app/map')}
        />

        <StatCard
          title="Next Bus 102"
          value={`${bus102.current_eta_min}m`}
          unit="ETA"
          subtitle={`${bus102.current_occupancy_pct}% Full (${bus102.delay_min}m delay)`}
          icon={<Bus className="w-4 h-4" />}
          badge={<StatusBadge status={bus102.current_occupancy_pct > 88 ? 'overloaded' : 'low'} />}
          onClick={() => navigate('/app/buses')}
        />

        <StatCard
          title="Campus Parking"
          value={campusParking.available_spots}
          unit="Spots Left"
          subtitle="Metro Hub has 155 open"
          icon={<SquareParking className="w-4 h-4" />}
          badge={<StatusBadge status={campusParking.available_spots < 20 ? 'moderate' : 'available'} />}
          onClick={() => navigate('/app/parking')}
        />

        <StatCard
          title="Eco Green Route"
          value="-28%"
          unit="CO₂ Cut"
          subtitle="Via Ring Bypass"
          icon={<Leaf className="w-4 h-4 text-emerald-400" />}
          source="ai_prediction"
          onClick={() => navigate('/app/routes')}
        />

        <StatCard
          title="Active Alerts"
          value={`${alerts.filter((a: any) => !a.read).length} Unread`}
          subtitle={latestAlert.title}
          icon={<Bell className="w-4 h-4 text-amber-400" />}
          badge={<StatusBadge status={activeCritical ? 'severe' : 'moderate'} />}
          onClick={() => navigate('/app/alerts')}
        />
      </div>

      {/* Hero AI Mobility Insight Card */}
      <InsightCard
        insight={activeRec}
        onSimulate={() => navigate('/admin/what-if')}
      />

      {/* Live OpenStreetMap GIS & Commuter Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[460px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <SmartCityMap
            trafficData={trafficData}
            busRoutes={busRoutes}
            parkingLocations={parkingLots}
            emergencyActive={simState[0]?.emergency_vehicle_active}
            fullHeight={true}
            className="w-full h-full min-h-[460px]"
          />
        </div>

        {/* Quick Travel Advisory & Coordinated Highlights */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Commuter Advisory
              </span>
              <SourceBadge source="live_api" provider="OpenStreetMap & OpenWeather" />
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-white mb-1">🚇 Avoid Five Roads Bottleneck</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Traffic is bottlenecked around Gate 2. Switch to Ring Bypass or board Bus 210 Eco Shuttle for 14 min faster travel.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-white mb-1">⚡ Free Fast EV Charging at Metro</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  5 ultra-fast 120kW DC charging bays open at Metro Hub Park & Ride with zero queue time.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="text-xs font-bold text-white mb-1">🚶 High Pedestrian Crosswalk Risk</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Elevated footfall at Market Cross. Drivers advised to maintain 25 km/h and respect zebra priority.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/app/routes')}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-cyan-500/20"
          >
            Open Multi-Objective Route Planner <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connected Multi-Modal Network Effects Visualizer */}
      <ConnectedEffectsDiagram />
    </div>
  );
};
