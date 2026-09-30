// SMARTMOVE Real Google Map Engine Component
// Integrates Google Maps JavaScript API, Places Autocomplete, DirectionsService, TrafficLayer, and SMARTMOVE AI Overlays
// Enhanced with reactive directions rendering, user location tracking marker, and map recentering.

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loadGoogleMapsScript, isGoogleMapsLoaded } from '../../lib/map/googleMapsLoader';
import {
  DEFAULT_CITY,
  DEFAULT_LATITUDE,
  DEFAULT_LONGITUDE,
  SALEM_LOCATIONS,
  GOOGLE_MAPS_DARK_STYLE,
} from '../../config/map-config';
import { SmartMapProps, MapLayersState, MapStyleType, TimeOffset, PlaceResult, MultiObjectiveRoute } from './types';
import { PlaceSearchBar } from '../place/PlaceSearchBar';
import { PlaceReportPanel } from '../place/PlaceReportPanel';
import { fetchPlaceReport, PlaceReportData } from '../../lib/place/placeService';
import { MapControls } from './MapControls';
import { MapLayerControl } from './MapLayerControl';
import { MapPopups } from './MapPopups';
import { MapTimeScrubber } from './MapTimeScrubber';
import { DirectionsBottomSheet } from './DirectionsBottomSheet';
import { AIMapInsight } from './AIMapInsight';
import { DataFreshness } from '../ui/DataFreshness';
import { predictCongestionAt } from '../../lib/ai/formulas';
import { AlertCircle, Key, RefreshCw, ArrowRight } from 'lucide-react';

export const GoogleMapView: React.FC<SmartMapProps> = ({
  initialCenter = { lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE },
  initialZoom = 13,
  trafficData = [],
  busRoutes = [],
  parkingLocations = [],
  emergencyActive = false,
  selectedRoute,
  className = '',
  fullHeight = true,
  originName: propOrigin,
  destinationName: propDest,
  directionsResult,
  activeRouteIndex = 0,
  travelMode = 'DRIVE',
  userLocation,
  isNavigating = false,
  onPlaceSelect,
  onRouteSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const googleTrafficLayerRef = useRef<google.maps.TrafficLayer | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const userLocationMarkerRef = useRef<google.maps.Marker | null>(null);
  const destinationMarkerRef = useRef<google.maps.Marker | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);
  const circlesRef = useRef<google.maps.Circle[]>([]);

  // API Key State (Prioritize .env key)
  const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [apiKey, setApiKey] = useState<string>(() => {
    return envKey || localStorage.getItem('smartmove_google_maps_api_key') || '';
  });

  useEffect(() => {
    if (envKey && envKey !== apiKey) {
      setApiKey(envKey);
      localStorage.setItem('smartmove_google_maps_api_key', envKey);
    }
  }, [envKey]);

  const [inputKey, setInputKey] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState<boolean>(false);

  // Map state controls
  const [mapStyle, setMapStyle] = useState<MapStyleType>('default');
  const [timeOffset, setTimeOffset] = useState<TimeOffset>(0);
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(false);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [busGlidePhase, setBusGlidePhase] = useState<number>(0);

  // Place search report drawer state
  const [isPlaceReportOpen, setIsPlaceReportOpen] = useState(false);
  const [placeReport, setPlaceReport] = useState<PlaceReportData | null>(null);
  const [currentCityName, setCurrentCityName] = useState('Salem Region');

  // Layers
  const [layers, setLayers] = useState<MapLayersState>({
    googleTraffic: true,
    simulatedCongestion: false,
    buses: true,
    parking: true,
    ev: true,
    pedestrian: true,
    emergency: !!emergencyActive,
  });

  // Directions & Routing State
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [originName, setOriginName] = useState(propOrigin || 'Sona College of Technology & Tech Campus');
  const [destName, setDestName] = useState(propDest || 'Govt Mohan Kumaramangalam Medical College Hospital');
  const [routes, setRoutes] = useState<MultiObjectiveRoute[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<'fastest' | 'eco' | 'balanced'>('fastest');
  const [activeRouteObj, setActiveRouteObj] = useState<MultiObjectiveRoute | null>(null);

  // Memoize stable coordinates so object identity doesn't re-trigger map creation
  const centerLat = initialCenter?.lat ?? DEFAULT_LATITUDE;
  const centerLng = initialCenter?.lng ?? DEFAULT_LONGITUDE;

  // 1. Initialize Google Map Instance
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;
    
    // If map instance is already initialized, simply recenter and return
    if (mapInstanceRef.current) {
      setLoading(false);
      setMapReady(true);
      return;
    }

    setLoading(true);
    setMapError(null);

    try {
      if (!apiKey || apiKey.trim() === '') {
        setLoading(false);
        setMapError('VITE_GOOGLE_MAPS_API_KEY is not configured in .env file.');
        return;
      }

      await loadGoogleMapsScript(apiKey);
      console.log('[SMARTMOVE Google Maps] API Script loaded successfully');

      if (!mapContainerRef.current) return;

      const mapOptions: google.maps.MapOptions = {
        center: { lat: centerLat, lng: centerLng },
        zoom: initialZoom,
        styles: GOOGLE_MAPS_DARK_STYLE,
        disableDefaultUI: true,
        zoomControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: true,
      };

      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      mapInstanceRef.current = map;

      // Trigger resize after rendering to ensure map tiles immediately fill container
      setTimeout(() => {
        if (mapInstanceRef.current && (window as any).google?.maps?.event) {
          google.maps.event.trigger(mapInstanceRef.current, 'resize');
          mapInstanceRef.current.setCenter({ lat: centerLat, lng: centerLng });
        }
      }, 100);

      // Initialize Google Live Traffic Layer
      try {
        const trafficLayer = new google.maps.TrafficLayer();
        trafficLayer.setMap(map);
        googleTrafficLayerRef.current = trafficLayer;
      } catch (tErr) {
        console.warn('TrafficLayer note:', tErr);
      }

      // Initialize DirectionsRenderer for Route Polyline Visualization
      try {
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: false,
          polylineOptions: {
            strokeColor: '#38bdf8',
            strokeWeight: 6,
            strokeOpacity: 0.9,
          },
        });
        directionsRendererRef.current = directionsRenderer;
      } catch (dErr) {
        console.warn('DirectionsRenderer note:', dErr);
      }

      setMapReady(true);
      setLoading(false);
    } catch (err: any) {
      console.error('[SMARTMOVE Google Maps]', err.message);
      setMapError(err.message || 'Google Maps failed to load');
      setLoading(false);
    }
  }, [apiKey, centerLat, centerLng, initialZoom]);

  useEffect(() => {
    initMap();
  }, [initMap]);

  // Reactive Directions Renderer update when directionsResult or activeRouteIndex prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps || !directionsRendererRef.current) return;
    try {
      if (directionsResult) {
        if (directionsRendererRef.current.getMap() !== mapInstanceRef.current) {
          directionsRendererRef.current.setMap(mapInstanceRef.current);
        }
        directionsRendererRef.current.setDirections(directionsResult);
        if (typeof activeRouteIndex === 'number') {
          directionsRendererRef.current.setRouteIndex(
            Math.min(activeRouteIndex, (directionsResult.routes?.length || 1) - 1)
          );
        }
      } else {
        directionsRendererRef.current.set('directions', null);
      }
    } catch (err) {
      console.warn('[SMARTMOVE Google Maps] directionsResult update note:', err);
    }
  }, [directionsResult, activeRouteIndex]);

  // Reactive User GPS Location Marker update
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const map = mapInstanceRef.current;

    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      const pos = { lat: userLocation.lat, lng: userLocation.lng };

      if (!userLocationMarkerRef.current) {
        userLocationMarkerRef.current = new google.maps.Marker({
          position: pos,
          map,
          title: 'Your Live Location',
          label: {
            text: '📍 YOU',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 'bold',
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#0284c7',
            fillOpacity: 1,
            strokeColor: '#38bdf8',
            strokeWeight: 3,
          },
          zIndex: 1000,
        });
      } else {
        userLocationMarkerRef.current.setPosition(pos);
        if (!userLocationMarkerRef.current.getMap()) {
          userLocationMarkerRef.current.setMap(map);
        }
      }

      if (isNavigating) {
        map.panTo(pos);
      }
    } else if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.setMap(null);
    }
  }, [userLocation, isNavigating]);

  // Map Recenter custom event handler
  useEffect(() => {
    const handleRecenter = (e: any) => {
      if (mapInstanceRef.current && e.detail && typeof e.detail.lat === 'number') {
        mapInstanceRef.current.panTo({ lat: e.detail.lat, lng: e.detail.lng });
        mapInstanceRef.current.setZoom(16);
      }
    };
    window.addEventListener('recenter_map', handleRecenter);
    return () => window.removeEventListener('recenter_map', handleRecenter);
  }, []);

  // Map Style Effect (Default, Satellite, Terrain)
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const map = mapInstanceRef.current;
    if (mapStyle === 'satellite') {
      map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    } else if (mapStyle === 'terrain') {
      map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    } else {
      map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
      map.setOptions({ styles: GOOGLE_MAPS_DARK_STYLE });
    }
  }, [mapStyle]);

  // Google Traffic Layer toggle effect
  useEffect(() => {
    if (!googleTrafficLayerRef.current || !mapInstanceRef.current) return;
    if (layers.googleTraffic) {
      googleTrafficLayerRef.current.setMap(mapInstanceRef.current);
    } else {
      googleTrafficLayerRef.current.setMap(null);
    }
  }, [layers.googleTraffic]);

  // Step 11: Render Custom Markers & Overlays on Google Map
  useEffect(() => {
    if (!mapInstanceRef.current || !(window as any).google?.maps) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    const loc = SALEM_LOCATIONS;

    try {
      // Metro Park & Ride Hub Destination Marker (🅿️ Metro Hub)
      const metroHubMarker = new google.maps.Marker({
        position: { lat: 12.9640, lng: 77.6180 },
        map,
        title: 'Metro Park & Ride Hub',
        label: {
          text: '🅿️ Metro Hub',
          color: '#ffffff',
          fontSize: '11px',
          fontWeight: 'bold',
        },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#059669',
          fillOpacity: 1,
          strokeColor: '#34d399',
          strokeWeight: 3,
        },
        zIndex: 900,
      });

      metroHubMarker.addListener('click', () => {
        setSelectedEntity({
          type: 'Smart Parking & EV Hub',
          title: 'Metro Park & Ride Hub',
          available: '155 open bays + 8 ultra-fast 120kW EV chargers',
          hourlyRate: '₹20/hr',
          status: 'AMPLE SPOTS',
          source: 'sensor',
        });
      });

      markersRef.current.push(metroHubMarker);

      // Junction Markers
      const junctions = [loc.junctionA, loc.junctionB, loc.junctionC, loc.junctionD];
      junctions.forEach((j) => {
        const cong = predictCongestionAt(j.congestion, timeOffset);
        const iconColor = cong > 75 ? '#f43f5e' : cong > 50 ? '#f59e0b' : '#10b981';

        const marker = new google.maps.Marker({
          position: { lat: j.lat, lng: j.lng },
          map,
          title: j.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: iconColor,
            fillOpacity: 1,
            strokeColor: '#030712',
            strokeWeight: 3,
          },
        });

        marker.addListener('click', () => {
          setSelectedEntity({
            type: 'Smart Traffic Junction',
            title: j.name,
            congestion: `${cong}% (Current: ${j.congestion}%)`,
            speed: `${j.speedKmh} km/h avg`,
            signalSplit: `Adaptive Split: N-35s / S-35s / E-25s / W-25s`,
            prediction15m: `${predictCongestionAt(j.congestion, 15)}%`,
            source: 'simulated',
          });
        });

        markersRef.current.push(marker);
      });
    } catch (err) {
      console.warn('Marker render error:', err);
    }
  }, [mapReady, layers, busGlidePhase, timeOffset]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      localStorage.setItem('smartmove_google_maps_api_key', inputKey.trim());
      setApiKey(inputKey.trim());
      setIsConfigModalOpen(false);
      window.location.reload();
    }
  };

  return (
    <div
      style={{ minHeight: '600px', height: '100%', width: '100%' }}
      className={`relative rounded-3xl overflow-hidden border border-slate-800 bg-[#050914] flex flex-col flex-1 w-full h-full min-h-[600px] ${className}`}
    >
      {/* Top Floating Action & Place Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="pointer-events-auto w-full sm:w-auto">
          <PlaceSearchBar
            onSelectPlace={async (place) => {
              setCurrentCityName(place.name.split(',')[0]);
              if (mapInstanceRef.current) {
                mapInstanceRef.current.panTo({ lat: place.lat, lng: place.lng });
                mapInstanceRef.current.setZoom(14);
              }
              const rep = await fetchPlaceReport(place);
              setPlaceReport(rep);
              setIsPlaceReportOpen(true);
              if (onPlaceSelect) {
                onPlaceSelect({
                  id: place.place_id || 'pl_' + Date.now(),
                  name: place.name,
                  address: `${place.district}, ${place.state}`,
                  lat: place.lat,
                  lng: place.lng,
                  category: 'landmark',
                });
              }
            }}
            onOpenDirections={() => {
              setIsDirectionsOpen(true);
            }}
            onToggleLayers={() => setShowLayerPanel(!showLayerPanel)}
          />
        </div>

        {/* Top Right Status Badges */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-xs font-mono text-slate-200 flex items-center gap-2 shadow-2xl backdrop-blur-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white">Google Maps Platform</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-300 font-bold">{currentCityName}</span>
          </div>

          <DataFreshness />
        </div>
      </div>

      {/* Place Report Intelligence Drawer */}
      <PlaceReportPanel
        report={placeReport}
        isOpen={isPlaceReportOpen}
        onClose={() => setIsPlaceReportOpen(false)}
        onNavigateTo={() => {
          if (placeReport) {
            setDestName(placeReport.place.name);
            setIsDirectionsOpen(true);
            setIsPlaceReportOpen(false);
          }
        }}
      />

      {/* Floating Map Controls */}
      <MapControls
        map={mapInstanceRef.current}
        mapStyle={mapStyle}
        onChangeMapStyle={setMapStyle}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />

      {/* Floating Predictive Time Scrubber */}
      <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
        <MapTimeScrubber activeOffset={timeOffset} onChangeOffset={setTimeOffset} />
      </div>

      {/* Map Layer Panel Toggle */}
      <MapLayerControl
        isOpen={showLayerPanel}
        onClose={() => setShowLayerPanel(false)}
        layers={layers}
        onToggleLayer={(k) => setLayers((prev) => ({ ...prev, [k]: !prev[k] }))}
      />

      {/* Multi-Objective Directions Bottom Sheet */}
      <DirectionsBottomSheet
        originName={originName}
        destinationName={destName}
        travelMode="DRIVE"
        routes={routes}
        selectedRouteId={selectedRouteId}
        isOpen={isDirectionsOpen}
        onClose={() => {
          setIsDirectionsOpen(false);
          if (directionsRendererRef.current) {
            directionsRendererRef.current.set('directions', null);
          }
        }}
        onSwapPoints={() => {
          const temp = originName;
          setOriginName(destName);
          setDestName(temp);
        }}
        onChangeTravelMode={() => {}}
        onSelectRoute={(id) => setSelectedRouteId(id)}
        onStartNavigation={() => {
          alert(`Navigation engaged to ${destName}.`);
        }}
      />

      {/* Interactive Entity Information Popup Card */}
      {selectedEntity && (
        <MapPopups
          entity={selectedEntity}
          onClose={() => setSelectedEntity(null)}
          onStartRoute={(dest) => {
            setDestName(dest);
            setIsDirectionsOpen(true);
          }}
        />
      )}

      {/* Native Google Maps Container */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '600px' }}
        className="w-full h-full min-h-[600px] flex-1 relative bg-[#090d16]"
      />

      {/* Loading Overlay */}
      {loading && !mapReady && !mapError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050914]/80 backdrop-blur-sm pointer-events-none animate-in fade-in duration-300">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping" />
            <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-500 animate-spin" />
            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <span className="text-sm font-bold font-display text-white tracking-wide">
            Loading SMARTMOVE GIS Map
          </span>
          <span className="text-xs text-cyan-400/80 font-mono mt-1">
            Streaming Google Maps platform tiles & traffic vectors...
          </span>
        </div>
      )}

      {/* Map Error Panel */}
      {mapError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-xl w-11/12 p-4 rounded-3xl bg-slate-950/98 border border-amber-500/50 text-xs shadow-2xl backdrop-blur-2xl animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm font-display flex items-center gap-1.5">
                  Google Maps API Activation Required
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-xs">
                {mapError}
              </p>
              <div className="pt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => initMap()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reload Map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('smartmove_map_provider', 'leaflet');
                    window.location.reload();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Switch to Free OpenStreetMap
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Key className="w-3.5 h-3.5" /> Enter New API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Maps API Key Config Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold font-display text-base">
                <Key className="w-5 h-5" />
                Configure Google Cloud API Key
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Paste your Google Maps Platform API key from Google Cloud Console. The key will be saved securely in your browser session.
            </p>
            <form onSubmit={handleSaveApiKey} className="space-y-3">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-xs font-bold text-slate-950 shadow-md cursor-pointer"
                >
                  Save & Apply Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
