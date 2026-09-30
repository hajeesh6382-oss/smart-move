// SMARTMOVE Dynamic Leaflet.js & OpenStreetMap Engine
// 100% Free & Open-Source GIS. Completely dynamic location handling:
// - Source Marker (Green Start 'A')
// - Destination Marker (Red Finish 'B')
// - Route Polyline (OSRM calculated path)
// - Intermediate Facilities (Parking, EV, Bus, Metro, Hospital, Traffic Incidents)
// - Automatic clearing of obsolete markers and automatic fitBounds().
// Zero hardcoded city coordinates.

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SmartMapProps, DynamicMapLocation, LocationType } from './types';
import { reverseGeocodeNominatim } from '../../services/nominatimService';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { MapPopups } from './MapPopups';
import { MapTimeScrubber } from './MapTimeScrubber';
import {
  Layers,
  MapPin,
  Car,
  Zap,
  Bus,
  Train,
  ShieldAlert,
  Hospital,
  AlertTriangle,
  RefreshCw,
  Coins,
} from 'lucide-react';

/**
 * Creates distinct SVG DivIcons for each location type
 */
function createLocationIcon(type: LocationType) {
  let bg = '#10b981';
  let innerHtml = 'A';
  let size = 32;

  switch (type) {
    case 'source':
      bg = '#10b981'; // Green
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white font-black text-xs">A</div>`;
      break;
    case 'destination':
      bg = '#ef4444'; // Red
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white font-black text-xs">B</div>`;
      break;
    case 'parking':
      bg = '#2563eb'; // Blue
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white font-black text-xs">P</div>`;
      size = 28;
      break;
    case 'bus_stop':
      bg = '#8b5cf6'; // Purple
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white text-[13px]">🚌</div>`;
      size = 28;
      break;
    case 'metro':
      bg = '#3b82f6'; // Indigo
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white text-[13px]">🚇</div>`;
      size = 28;
      break;
    case 'ev_charging':
      bg = '#06b6d4'; // Cyan
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white text-[13px]">⚡</div>`;
      size = 28;
      break;
    case 'hospital':
      bg = '#dc2626'; // Red
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-white font-black text-sm">✚</div>`;
      size = 28;
      break;
    case 'incident':
      bg = '#f59e0b'; // Amber
      innerHtml = `<div class="flex items-center justify-center w-full h-full text-slate-950 font-black text-xs">⚠️</div>`;
      size = 28;
      break;
    case 'waypoint':
    default:
      bg = '#64748b';
      innerHtml = `<div class="w-2.5 h-2.5 rounded-full bg-white"></div>`;
      size = 20;
      break;
  }

  const isEndpoint = type === 'source' || type === 'destination';

  return L.divIcon({
    className: 'custom-smartmove-marker',
    html: `
      <div class="relative flex items-center justify-center" style="width: ${size}px; height: ${size}px;">
        ${isEndpoint ? `<div class="absolute -inset-1.5 rounded-full animate-ping opacity-40" style="background-color: ${bg};"></div>` : ''}
        <div class="relative flex items-center justify-center rounded-full shadow-2xl border-2 border-white transition-transform hover:scale-125 cursor-pointer" style="background-color: ${bg}; width: ${size}px; height: ${size}px;">
          ${innerHtml}
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export const LeafletCityMap: React.FC<SmartMapProps> = ({
  initialCenter,
  initialZoom = 12,
  routes = [],
  activeRouteIndex = 0,
  className = '',
  originName,
  destinationName,
  sourcePoint,
  destinationPoint,
  intermediateLocations = [],
  selectedRequirement = 'all',
  userLocation,
  isNavigating = false,
  onMapClickCoordinate,
  onPlaceSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer Groups
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const intermediateLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const pricingLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const sourceMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const clickMarkerRef = useRef<L.Marker | null>(null);

  // Road Pricing Subscriptions & State
  const { data: pricingZones } = useRealtimeTable('road_pricing_zones');
  const { data: pricingLive } = useRealtimeTable('road_pricing_live');
  const [showPricingLayer, setShowPricingLayer] = useState(true);

  // State
  const [tileStyle, setTileStyle] = useState<'dark' | 'standard'>('dark');
  const [timeOffset, setTimeOffset] = useState<number>(0);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [clickedAddress, setClickedAddress] = useState<string | null>(null);

  // Center coordinate determination (fallback to South India region if unspecified)
  const defaultLat = initialCenter?.lat ?? (sourcePoint?.lat || 11.0);
  const defaultLng = initialCenter?.lng ?? (sourcePoint?.lng || 78.0);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false,
    });

    // Standard OpenStreetMap Tile Layer (100% Free, Zero API Keys, No CARTO)
    const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);
    baseTileLayerRef.current = tileLayer;

    // Zoom controls bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Initialize layer groups
    routeLayerGroupRef.current = L.layerGroup().addTo(map);
    intermediateLayerGroupRef.current = L.layerGroup().addTo(map);
    pricingLayerGroupRef.current = L.layerGroup().addTo(map);

    // Handle Map Click to select coordinate dynamically
    map.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const pinIcon = L.divIcon({
          html: `<div class="w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center shadow-lg text-[10px] text-slate-950 font-bold animate-bounce">📍</div>`,
          className: 'custom-pin-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        });
        clickMarkerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
      }

      const rev = await reverseGeocodeNominatim(lat, lng);
      if (rev) {
        setClickedAddress(rev.formattedAddress);
        if (onPlaceSelect) {
          onPlaceSelect({
            id: rev.placeId,
            name: rev.name,
            address: rev.formattedAddress,
            lat,
            lng,
            category: 'landmark',
          });
        }
      }
      if (onMapClickCoordinate) {
        onMapClickCoordinate({ lat, lng });
      }
    });

    mapInstanceRef.current = map;

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          map.invalidateSize();
        } catch (e) {
          // ignore if unmounted
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      try {
        map.remove();
      } catch (e) {}
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. DYNAMIC MAP UPDATE: SOURCE, DESTINATION, ROUTE & INTERMEDIATE PLACES
  // Whenever source, destination, routes, or intermediateLocations change:
  // - Clear previous markers and polylines completely
  // - Render new source marker (Green 'A')
  // - Render new destination marker (Red 'B')
  // - Render new route polyline
  // - Render relevant intermediate locations
  // - Fit map bounds to encompass all active elements
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // STEP A: CLEAR PREVIOUS MARKERS & ROUTES
    if (sourceMarkerRef.current) {
      sourceMarkerRef.current.remove();
      sourceMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      destMarkerRef.current.remove();
      destMarkerRef.current = null;
    }
    routeLayerGroupRef.current?.clearLayers();
    intermediateLayerGroupRef.current?.clearLayers();

    const bounds = L.latLngBounds([]);

    // Determine actual source & destination coordinates
    let startCoord: { lat: number; lng: number } | null = sourcePoint?.lat && sourcePoint?.lng ? sourcePoint : null;
    let endCoord: { lat: number; lng: number } | null = destinationPoint?.lat && destinationPoint?.lng ? destinationPoint : null;

    // STEP B: RENDER ROUTE POLYLINES
    if (routes && routes.length > 0) {
      routes.forEach((r: any, idx: number) => {
        const isSelected = idx === activeRouteIndex;
        const coords: [number, number][] = (r.pathCoordinates || []).map((pt: any) => [pt.lat, pt.lng]);

        if (coords.length > 0) {
          coords.forEach((c) => bounds.extend(c));

          if (!startCoord && coords.length >= 2) {
            startCoord = { lat: coords[0][0], lng: coords[0][1] };
          }
          if (!endCoord && coords.length >= 2) {
            endCoord = { lat: coords[coords.length - 1][0], lng: coords[coords.length - 1][1] };
          }

          // Polyline styling: Cyan for primary, Green for eco, Muted Slate for alternates
          const color = isSelected ? (r.id === 'eco' ? '#10b981' : '#06b6d4') : '#475569';
          const polyline = L.polyline(coords, {
            color,
            weight: isSelected ? 6 : 4,
            opacity: isSelected ? 0.95 : 0.45,
            lineJoin: 'round',
          });

          polyline.on('click', () => {
            setSelectedEntity({
              type: 'Calculated Route',
              title: r.name || `Route ${idx + 1}`,
              available: `${r.distanceKm} km | ${r.etaMin} min travel time`,
              status: r.badge || 'ACTIVE',
              source: 'OSRM + SMARTMOVE AI',
              why: r.whyExplanation,
            });
          });

          routeLayerGroupRef.current?.addLayer(polyline);
        }
      });
    }

    // STEP C: RENDER DYNAMIC SOURCE MARKER (Green 'A')
    if (startCoord && typeof startCoord.lat === 'number' && typeof startCoord.lng === 'number') {
      const srcIcon = createLocationIcon('source');
      const marker = L.marker([startCoord.lat, startCoord.lng], { icon: srcIcon }).addTo(map);
      marker.bindTooltip(`Source: ${originName || 'Starting Location'}`, {
        permanent: false,
        direction: 'top',
        className: 'smartmove-marker-tooltip',
      });
      marker.on('click', () => {
        setSelectedEntity({
          type: 'Route Starting Point',
          title: originName || 'Starting Point',
          available: `Lat: ${startCoord?.lat.toFixed(4)}, Lng: ${startCoord?.lng.toFixed(4)}`,
          status: 'ORIGIN',
          source: 'Nominatim Geocoding',
        });
      });
      sourceMarkerRef.current = marker;
      bounds.extend([startCoord.lat, startCoord.lng]);
    }

    // STEP D: RENDER DYNAMIC DESTINATION MARKER (Red 'B')
    if (endCoord && typeof endCoord.lat === 'number' && typeof endCoord.lng === 'number') {
      const dstIcon = createLocationIcon('destination');
      const marker = L.marker([endCoord.lat, endCoord.lng], { icon: dstIcon }).addTo(map);
      marker.bindTooltip(`Destination: ${destinationName || 'Target Location'}`, {
        permanent: false,
        direction: 'top',
        className: 'smartmove-marker-tooltip',
      });
      marker.on('click', () => {
        setSelectedEntity({
          type: 'Route Destination',
          title: destinationName || 'Destination',
          available: `Lat: ${endCoord?.lat.toFixed(4)}, Lng: ${endCoord?.lng.toFixed(4)}`,
          status: 'TARGET',
          source: 'Nominatim Geocoding',
        });
      });
      destMarkerRef.current = marker;
      bounds.extend([endCoord.lat, endCoord.lng]);
    }

    // STEP E: RENDER RELEVANT INTERMEDIATE LOCATIONS (Based on user request)
    if (Array.isArray(intermediateLocations) && intermediateLocations.length > 0) {
      intermediateLocations.forEach((loc) => {
        if (typeof loc.latitude !== 'number' || typeof loc.longitude !== 'number') return;

        const icon = createLocationIcon(loc.type);
        const marker = L.marker([loc.latitude, loc.longitude], { icon });

        marker.bindTooltip(`${loc.name}`, {
          permanent: false,
          direction: 'top',
          className: 'smartmove-marker-tooltip',
        });

        marker.on('click', () => {
          setSelectedEntity({
            type: loc.type.toUpperCase().replace('_', ' '),
            title: loc.name,
            available: loc.available || loc.details || 'Active Route Facility',
            hourlyRate: loc.hourlyRate,
            status: loc.status || 'OPERATIONAL',
            source: loc.source === 'overpass' ? 'OpenStreetMap Overpass API' : 'SMARTMOVE Corridor Telemetry',
          });
        });

        intermediateLayerGroupRef.current?.addLayer(marker);
        bounds.extend([loc.latitude, loc.longitude]);
      });
    }

    // STEP F: AUTOMATICALLY FIT BOUNDS (Source, Destination, Route, Facilities)
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.12), {
        maxZoom: 15,
        animate: true,
        duration: 0.8,
      });
    }
  }, [routes, activeRouteIndex, sourcePoint, destinationPoint, originName, destinationName, intermediateLocations]);

  // 3. Dynamic Road Pricing Overlay & Gantry Badges
  useEffect(() => {
    if (!pricingLayerGroupRef.current || !mapInstanceRef.current) return;
    const group = pricingLayerGroupRef.current;
    group.clearLayers();

    if (!showPricingLayer || !Array.isArray(pricingZones) || pricingZones.length === 0) return;

    pricingZones.forEach((zone: any) => {
      const live = pricingLive?.find((p: any) => p.zone_id === zone.id);
      const charge = live ? live.current_charge : 0;
      const cong = live ? live.congestion_percentage : 30;
      const isEmergency = live ? live.is_emergency_suspended : false;

      // Color mapping
      let color = '#10b981'; // green
      let fillColor = '#10b981';
      if (isEmergency) {
        color = '#06b6d4';
        fillColor = '#06b6d4';
      } else if (cong > 85) {
        color = '#7c3aed';
        fillColor = '#7c3aed';
      } else if (cong > 70) {
        color = '#ef4444';
        fillColor = '#ef4444';
      } else if (cong > 50) {
        color = '#f97316';
        fillColor = '#f97316';
      } else if (cong > 30) {
        color = '#eab308';
        fillColor = '#eab308';
      }

      if (Array.isArray(zone.geometry) && zone.geometry.length >= 3) {
        const polygonCoords: [number, number][] = zone.geometry.map((g: any) => [g.lat, g.lng]);
        const polygon = L.polygon(polygonCoords, {
          color,
          weight: 2,
          fillColor,
          fillOpacity: 0.18,
          dashArray: isEmergency ? '4, 4' : undefined,
        });

        // Center calculation
        let avgLat = 0;
        let avgLng = 0;
        polygonCoords.forEach(([la, ln]) => {
          avgLat += la;
          avgLng += ln;
        });
        avgLat /= polygonCoords.length;
        avgLng /= polygonCoords.length;

        const badgeHtml = isEmergency
          ? `<div class="px-2 py-0.5 rounded-full bg-cyan-600 text-white font-mono font-bold text-[10px] border border-white shadow-xl animate-pulse">🚑 SUSPENDED</div>`
          : `<div class="px-2 py-0.5 rounded-full font-mono font-black text-[11px] border border-white shadow-xl text-slate-950 flex items-center gap-1 cursor-pointer" style="background-color: ${color};">
              <span>ERP</span>
              <span>₹${charge}</span>
            </div>`;

        const gantryIcon = L.divIcon({
          className: 'pricing-gantry-badge',
          html: `<div class="flex items-center justify-center">${badgeHtml}</div>`,
          iconSize: [60, 24],
          iconAnchor: [30, 12],
        });

        const gantryMarker = L.marker([avgLat, avgLng], { icon: gantryIcon });

        const clickHandler = () => {
          setSelectedEntity({
            type: 'Dynamic Road Pricing Zone',
            title: zone.zone_name,
            available: isEmergency ? 'SUSPENDED FOR EMERGENCY PRIORITY' : `₹${charge} Current Dynamic Charge (${cong}% Congestion)`,
            status: isEmergency ? 'SUSPENDED' : cong > 70 ? 'HEAVY CONGESTION' : 'NORMAL FLOW',
            source: live?.source || 'LIVE TRAFFIC API',
            why: live?.pricing_reason || `Congestion is at ${cong}%. Charge evaluated dynamically.`,
          });
        };

        polygon.on('click', clickHandler);
        gantryMarker.on('click', clickHandler);

        group.addLayer(polygon);
        group.addLayer(gantryMarker);
      }
    });
  }, [pricingZones, pricingLive, showPricingLayer]);

  // 4. Update User GPS Location
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const pos: [number, number] = [userLocation.lat, userLocation.lng];

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.circleMarker(pos, {
          radius: 11,
          fillColor: '#0284c7',
          color: '#38bdf8',
          weight: 3,
          fillOpacity: 1,
        }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng(pos);
      }

      if (isNavigating) {
        map.panTo(pos);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation, isNavigating]);

  return (
    <div
      style={{ minHeight: '600px', height: '100%', width: '100%' }}
      className={`relative rounded-3xl overflow-hidden border border-slate-800 bg-[#050914] flex flex-col flex-1 w-full h-full min-h-[600px] ${className}`}
    >
      {/* Top Banner Status Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3.5 py-1.5 rounded-2xl bg-slate-950/95 border border-cyan-500/40 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-2xl backdrop-blur-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white">Dynamic OSM Navigation</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-400 font-bold">OSRM & Nominatim</span>
          </div>

          {clickedAddress && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-700 text-xs text-slate-300 shadow-xl backdrop-blur-xl">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate max-w-xs">{clickedAddress}</span>
            </div>
          )}
        </div>

        {/* Top-Right Theme & Layer Toggles */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowPricingLayer(!showPricingLayer)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xl backdrop-blur-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              showPricingLayer
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-slate-900/90 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle Dynamic Road Pricing (ERP) Zones Layer"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>{showPricingLayer ? 'ERP Zones ON' : 'ERP Zones OFF'}</span>
          </button>

          <button
            type="button"
            onClick={() => setTileStyle(tileStyle === 'dark' ? 'standard' : 'dark')}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 shadow-xl backdrop-blur-xl transition-all cursor-pointer"
            title="Toggle between Dark Theme and Standard OpenStreetMap Tiles"
          >
            {tileStyle === 'dark' ? '🌙 Dark' : '☀️ OSM'}
          </button>
        </div>
      </div>

      {/* Dynamic Marker Legend */}
      <div className="absolute top-16 left-4 z-[400] bg-slate-950/90 border border-slate-800/80 rounded-2xl px-3 py-2 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur-xl pointer-events-auto hidden sm:flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
          <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">A</span> Origin
        </span>
        <span className="flex items-center gap-1.5 text-rose-400 font-bold">
          <span className="w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px]">B</span> Destination
        </span>
        {showPricingLayer && (
          <span className="flex items-center gap-1 text-amber-400 font-bold border-l border-slate-700 pl-3">
            <Coins className="w-3 h-3 text-amber-400" /> Dynamic ERP
          </span>
        )}
        {intermediateLocations.length > 0 && (
          <span className="text-cyan-400 font-bold border-l border-slate-700 pl-3">
            {intermediateLocations.length} Facilities Active
          </span>
        )}
      </div>

      {/* Floating Predictive Time Scrubber */}
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-auto">
        <MapTimeScrubber activeOffset={timeOffset as any} onChangeOffset={setTimeOffset as any} />
      </div>

      {/* Interactive Entity Information Card Popup */}
      {selectedEntity && (
        <MapPopups
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onStartRoute={() => {}}
        />
      )}

      {/* Native Leaflet Map DOM Element (OpenStreetMap standard tiles) */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '600px' }}
        className={`w-full h-full min-h-[600px] flex-1 relative bg-[#090d16] ${
          tileStyle === 'dark' ? 'osm-dark-tiles' : ''
        }`}
      />

      {/* Bottom OpenStreetMap Attribution Banner */}
      <div className="absolute bottom-1 right-2 z-[400] text-[10px] font-mono text-slate-500 bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-slate-800 pointer-events-auto flex items-center gap-2">
        <span>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline hover:text-cyan-400">OpenStreetMap</a> contributors</span>
        <span>•</span>
        <span>Routing: OSRM</span>
        <span>•</span>
        <span>Search: Nominatim</span>
      </div>
    </div>
  );
};
