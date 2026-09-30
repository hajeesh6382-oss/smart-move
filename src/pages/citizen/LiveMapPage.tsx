// SMARTMOVE Google-Maps-Style Fullscreen Live City Map Page
// Features interactive floating search, 60m predictive time scrubber, gliding transit, and layer provenance controls

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { SmartCityMap } from '../../components/map/SmartCityMap';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { LiveBadge } from '../../components/ui/LiveBadge';
import { ErrorBoundary } from '../../components/ui/ErrorBoundary';
import { DEFAULT_CITY } from '../../config/map-config';

export const LiveMapPage: React.FC = () => {
  const { data: trafficData } = useRealtimeTable('traffic_data');
  const { data: busRoutes } = useRealtimeTable('bus_routes');
  const { data: parkingLots } = useRealtimeTable('parking_locations');
  const { data: simState } = useRealtimeTable('simulation_state');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Live Geographic Information System
            </span>
            <LiveBadge />
            <SourceBadge source="OPENSTREETMAP GIS" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            {DEFAULT_CITY.split(',')[0]} Urban Mobility Real-Time Map
          </h2>
          <p className="text-xs text-slate-400">
            Search places, compare multi-objective routes, scrub future congestion (+15m/+30m/+60m), and track live transit.
          </p>
        </div>
      </div>

      <div className="w-full min-h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
        <ErrorBoundary
          fallbackTitle="Live OpenStreetMap View"
          fallbackMessage="OpenStreetMap view is initializing."
        >
          <SmartCityMap
            trafficData={trafficData || []}
            busRoutes={busRoutes || []}
            parkingLocations={parkingLots || []}
            emergencyActive={!!simState?.[0]?.emergency_vehicle_active}
            fullHeight={true}
            className="w-full h-full min-h-[620px]"
          />
        </ErrorBoundary>
      </div>
    </div>
  );
};
