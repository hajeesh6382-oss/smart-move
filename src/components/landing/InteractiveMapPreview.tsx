import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Navigation,
  Car,
  Zap,
  Bus,
  Coins,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Maximize2,
  RefreshCw,
  Gauge,
  Clock,
  Layers,
} from 'lucide-react';

interface RouteOption {
  id: string;
  name: string;
  traffic: 'Low' | 'Moderate' | 'Heavy';
  trafficColor: string;
  time: string;
  distance: string;
  cost: string;
  co2Saved: string;
  coordinates: [number, number][];
  mode: string;
}

const SAMPLE_ROUTES: RouteOption[] = [
  {
    id: 'ai-recommended',
    name: 'AI Recommended Route',
    traffic: 'Low',
    trafficColor: '#10b981',
    time: '18 min',
    distance: '7.2 km',
    cost: '₹42',
    co2Saved: '32% less CO₂',
    coordinates: [
      [12.9716, 77.5946],
      [12.9752, 77.6012],
      [12.9810, 77.6150],
      [12.9890, 77.6320],
      [12.9980, 77.6490],
      [13.0080, 77.6650],
    ],
    mode: 'Smart Connected Corridor',
  },
  {
    id: 'fastest',
    name: 'Fastest Express Highway',
    traffic: 'Moderate',
    trafficColor: '#f59e0b',
    time: '20 min',
    distance: '8.4 km',
    cost: '₹58',
    co2Saved: '14% less CO₂',
    coordinates: [
      [12.9716, 77.5946],
      [12.9650, 77.6100],
      [12.9720, 77.6350],
      [12.9850, 77.6520],
      [13.0080, 77.6650],
    ],
    mode: 'Elevated Toll Bypass',
  },
  {
    id: 'eco',
    name: 'Eco-Friendly Multi-Modal',
    traffic: 'Low',
    trafficColor: '#10b981',
    time: '24 min',
    distance: '6.8 km',
    cost: '₹28',
    co2Saved: '54% less CO₂',
    coordinates: [
      [12.9716, 77.5946],
      [12.9780, 77.6080],
      [12.9850, 77.6200],
      [12.9950, 77.6400],
      [13.0080, 77.6650],
    ],
    mode: 'Metro Line 2 + Electric Feeder',
  },
];

export const InteractiveMapPreview: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedRouteId, setSelectedRouteId] = useState<string>('ai-recommended');
  const [activeFilter, setActiveFilter] = useState<'all' | 'traffic' | 'ev' | 'transit' | 'pricing'>('all');
  const [isDrawing, setIsDrawing] = useState(false);

  const activeRoute = SAMPLE_ROUTES.find((r) => r.id === selectedRouteId) || SAMPLE_ROUTES[0];

  // Initialize Leaflet Map safely
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      // Clean up previous instance or leaflet id if re-mounting
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [12.988, 77.63],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Darker / Cyber Styled OpenStreetMap Tiles with attribution
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
        className: 'brightness-90 contrast-125 saturate-50 hue-rotate-190 invert',
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    } catch (err) {
      console.warn('Leaflet map initialization skipped or caught:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (_) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Route Polyline & Markers on selection
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    let drawInterval: any = null;
    let moveVehicle: any = null;

    try {
      setIsDrawing(true);
      markersLayerRef.current.clearLayers();

      if (polylineRef.current) {
        map.removeLayer(polylineRef.current);
      }
      if (vehicleMarkerRef.current) {
        map.removeLayer(vehicleMarkerRef.current);
      }

    const coords = activeRoute.coordinates;

    // Start Marker (Point A)
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white shadow-lg shadow-emerald-500/50 flex items-center justify-center text-slate-950 font-black text-xs">
            A
          </div>
          <span class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 border border-emerald-500/40 text-[9px] font-mono text-emerald-300 font-bold whitespace-nowrap">
            ORIGIN
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Destination Marker (Point B)
    const endIcon = L.divIcon({
      className: 'custom-end-marker',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-lg shadow-rose-500/50 flex items-center justify-center text-white font-black text-xs animate-bounce">
            B
          </div>
          <span class="absolute -bottom-5 px-1.5 py-0.5 rounded bg-slate-900/90 border border-rose-500/40 text-[9px] font-mono text-rose-300 font-bold whitespace-nowrap">
            DESTINATION
          </span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker(coords[0], { icon: startIcon }).addTo(markersLayerRef.current);
    L.marker(coords[coords.length - 1], { icon: endIcon }).addTo(markersLayerRef.current);

    // City Facility POIs (EV, Transit, ERP, Parking)
    if (activeFilter === 'all' || activeFilter === 'ev') {
      const evIcon = L.divIcon({
        html: `<div class="p-1 rounded-full bg-cyan-500 text-slate-950 shadow-md font-bold text-[10px]">⚡</div>`,
        iconSize: [22, 22],
      });
      L.marker([12.982, 77.618], { icon: evIcon })
        .bindPopup('<b>Fast EV Supercharger Hub</b><br/>8/10 Bays Available')
        .addTo(markersLayerRef.current);
    }

    if (activeFilter === 'all' || activeFilter === 'pricing') {
      const tollIcon = L.divIcon({
        html: `<div class="px-1.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-[9px] shadow-md border border-amber-300">₹12 ERP</div>`,
        iconSize: [48, 20],
      });
      L.marker([12.989, 77.635], { icon: tollIcon })
        .bindPopup('<b>Smart Road Pricing Gantry 04</b><br/>Free-flow speed: 48 km/h')
        .addTo(markersLayerRef.current);
    }

    if (activeFilter === 'all' || activeFilter === 'transit') {
      const busIcon = L.divIcon({
        html: `<div class="p-1 rounded-full bg-purple-500 text-white shadow-md font-bold text-[10px]">🚌</div>`,
        iconSize: [22, 22],
      });
      L.marker([12.977, 77.605], { icon: busIcon })
        .bindPopup('<b>Electric Rapid Bus Stop</b><br/>Next arrival: 2 mins')
        .addTo(markersLayerRef.current);
    }

    // Animate Route Drawing
    let currentIndex = 1;
    const initialLine = L.polyline([coords[0], coords[1]], {
      color: activeRoute.trafficColor,
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    polylineRef.current = initialLine;

    const drawInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex <= coords.length) {
        initialLine.setLatLngs(coords.slice(0, currentIndex));
      } else {
        clearInterval(drawInterval);
        setIsDrawing(false);
      }
    }, 140);

    // Fit map bounds smoothly
    map.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 14 });

    // Moving Vehicle Marker along route
    const vehicleIcon = L.divIcon({
      html: `
        <div class="w-6 h-6 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-400/80 flex items-center justify-center text-slate-950 text-[10px]">
          🚗
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const vehicleMarker = L.marker(coords[0], { icon: vehicleIcon }).addTo(map);
    vehicleMarkerRef.current = vehicleMarker;

    let step = 0;
    moveVehicle = setInterval(() => {
      step = (step + 1) % coords.length;
      vehicleMarker.setLatLng(coords[step]);
    }, 2200);
    } catch (err) {
      console.warn('Leaflet route drawing update caught:', err);
    }

    return () => {
      if (drawInterval) clearInterval(drawInterval);
      if (moveVehicle) clearInterval(moveVehicle);
    };
  }, [selectedRouteId, activeFilter]);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-cyan-500/30 bg-slate-950/80 shadow-2xl shadow-cyan-950/40">
      {/* Top Map Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black font-display text-white tracking-tight">
                Live Interactive Mobility GIS
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                SIMULATED LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Multi-lane arterial traffic flow, EV points, dynamic ERP gantries & rapid transit
            </p>
          </div>
        </div>

        {/* Layer Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Layers' },
            { id: 'traffic', label: 'Traffic Flows' },
            { id: 'ev', label: '⚡ EV Chargers' },
            { id: 'transit', label: '🚌 Buses' },
            { id: 'pricing', label: '💰 Road Pricing' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Box & Floating Overlay Cards */}
      <div className="relative w-full h-[480px] lg:h-[560px] bg-slate-950">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Telemetry HUD Cards (Prompt Section 6) */}
        <div className="absolute top-4 left-4 z-[400] flex flex-wrap gap-2.5 max-w-sm pointer-events-none">
          <div className="glass-panel p-3 rounded-2xl border border-cyan-500/30 text-xs shadow-xl pointer-events-auto">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Traffic
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 font-black text-sm text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {activeRoute.traffic}
            </div>
          </div>

          <div className="glass-panel p-3 rounded-2xl border border-cyan-500/30 text-xs shadow-xl pointer-events-auto">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Travel Time
            </span>
            <div className="flex items-center gap-1 mt-0.5 font-black text-sm text-white">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {activeRoute.time}
            </div>
          </div>

          <div className="glass-panel p-3 rounded-2xl border border-cyan-500/30 text-xs shadow-xl pointer-events-auto">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Distance
            </span>
            <div className="flex items-center gap-1 mt-0.5 font-black text-sm text-white">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {activeRoute.distance}
            </div>
          </div>

          <div className="glass-panel p-3 rounded-2xl border border-cyan-500/30 text-xs shadow-xl pointer-events-auto">
            <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
              Estimated Cost
            </span>
            <div className="flex items-center gap-1 mt-0.5 font-black text-sm text-cyan-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              {activeRoute.cost}
            </div>
          </div>
        </div>

        {/* Live Route Selector Panel Floating at Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-[400] grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_ROUTES.map((route) => {
            const isSelected = route.id === selectedRouteId;
            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3.5 rounded-2xl backdrop-blur-xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'bg-slate-900/95 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? 'text-cyan-300' : 'text-white'
                    }`}
                  >
                    {route.name}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                    style={{
                      backgroundColor: `${route.trafficColor}20`,
                      color: route.trafficColor,
                      border: `1px solid ${route.trafficColor}40`,
                    }}
                  >
                    {route.traffic}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-white mb-1">
                  <span>{route.time}</span>
                  <span className="text-slate-600">•</span>
                  <span>{route.distance}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-cyan-400">{route.cost}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold">
                  <span>🌱 {route.co2Saved}</span>
                  <span className="text-slate-500 text-[10px]">{route.mode}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Map Bottom Footer Bar with Direct Launch Button */}
      <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Low Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Moderate Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Heavy Congestion</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/map')}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Launch Fullscreen GIS Navigation</span>
        </button>
      </div>
    </div>
  );
};
