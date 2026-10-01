import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Coins,
  MapPin,
  Lock,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Crosshair,
  Sliders,
  X,
  Plus,
} from 'lucide-react';
import { RoadPricingZone, ZonePricingOverride } from '../../services/dynamicPricingService';

interface AdminRoadPricingMapProps {
  zones: RoadPricingZone[];
  overrides: Record<string, ZonePricingOverride>;
  liveRecords: Array<{ zone_id: string; current_charge: number; congestion_percentage: number }>;
  onFixPrice: (zone: RoadPricingZone, price: number) => void;
  onResetDynamic: (zone: RoadPricingZone) => void;
  onCreatePlaceAtCoords?: (lat: number, lng: number) => void;
}

export const AdminRoadPricingMap: React.FC<AdminRoadPricingMapProps> = ({
  zones,
  overrides,
  liveRecords,
  onFixPrice,
  onResetDynamic,
  onCreatePlaceAtCoords,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [selectedZone, setSelectedZone] = useState<RoadPricingZone | null>(zones[0] || null);
  const [fixedPriceInput, setFixedPriceInput] = useState<number>(25);
  const [notice, setNotice] = useState<string | null>(null);
  const [mapCenterMode, setMapCenterMode] = useState<string>('all');

  // Sync selectedZone price input when zone selection changes
  useEffect(() => {
    if (selectedZone) {
      const override = overrides[selectedZone.id];
      const live = liveRecords.find((r) => r.zone_id === selectedZone.id);
      const current = override?.pricingMode === 'fixed' ? override.fixedRate : live?.current_charge ?? 20;
      setFixedPriceInput(current);
    }
  }, [selectedZone, overrides, liveRecords]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if ((mapContainerRef.current as any)._leaflet_id) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Default center around Theni / Tamil Nadu network
      const map = L.map(mapContainerRef.current, {
        center: [10.01, 77.48],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // Dark styled tile layer
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
        className: 'brightness-90 contrast-125 saturate-50 hue-rotate-190 invert',
      }).addTo(map);

      L.control.zoom({ position: 'topright' }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;

      // Handle map click to drop new gantry
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (onCreatePlaceAtCoords) {
          onCreatePlaceAtCoords(e.latlng.lat, e.latlng.lng);
        }
      });
    } catch (err) {
      console.warn('Leaflet initialization in ERP Map:', err);
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

  // Render Zone Polygons and Gantry Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    zones.forEach((zone) => {
      const override = overrides[zone.id];
      const isFixed = override && override.pricingMode === 'fixed';
      const live = liveRecords.find((r) => r.zone_id === zone.id);
      const charge = isFixed ? override.fixedRate : live?.current_charge ?? 15;
      const congestion = live?.congestion_percentage ?? 45;

      const isSelected = selectedZone?.id === zone.id;

      // Calculate centroid
      const lats = zone.geometry.map((g) => g.lat);
      const lngs = zone.geometry.map((g) => g.lng);
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
      const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

      // Draw Zone Polygon
      const polygonCoords = zone.geometry.map((g) => [g.lat, g.lng] as [number, number]);
      const polygon = L.polygon(polygonCoords, {
        color: isFixed ? '#f59e0b' : '#06b6d4',
        weight: isSelected ? 3 : 2,
        opacity: 0.9,
        fillColor: isFixed ? '#d97706' : '#0284c7',
        fillOpacity: isSelected ? 0.35 : 0.18,
      });

      polygon.on('click', () => {
        setSelectedZone(zone);
        map.setView([centerLat, centerLng], Math.max(map.getZoom(), 13), { animate: true });
      });
      polygon.addTo(layer);

      // Create Custom HTML Marker with Price Tag
      const markerHtml = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 9999px;
          background: ${isFixed ? '#78350f' : '#0f172a'};
          border: 2px solid ${isFixed ? '#fbbf24' : '#38bdf8'};
          color: white;
          font-family: ui-monospace, monospace;
          font-size: 11px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          cursor: pointer;
          transform: translate(-50%, -50%);
          white-space: nowrap;
        ">
          <span style="
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 9999px;
            background: ${isFixed ? '#f59e0b' : '#10b981'};
          "></span>
          <span>₹${charge}</span>
          <span style="
            font-size: 9px;
            opacity: 0.85;
            padding: 1px 4px;
            background: rgba(255,255,255,0.15);
            border-radius: 4px;
          ">${isFixed ? 'FIXED' : 'AI'}</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-erp-gantry-marker',
        html: markerHtml,
        iconSize: [80, 26],
      });

      const marker = L.marker([centerLat, centerLng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedZone(zone);
        map.setView([centerLat, centerLng], Math.max(map.getZoom(), 13), { animate: true });
      });
      marker.addTo(layer);
    });
  }, [zones, overrides, liveRecords, selectedZone]);

  const handleApplyFix = () => {
    if (!selectedZone) return;
    onFixPrice(selectedZone, fixedPriceInput);
    setNotice(`✅ Enforced ₹${fixedPriceInput} on ${selectedZone.zone_name}!`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleApplyDynamic = () => {
    if (!selectedZone) return;
    onResetDynamic(selectedZone);
    setNotice(`🔄 Reset ${selectedZone.zone_name} to AI Dynamic Pricing.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const flyToZone = (zone: RoadPricingZone) => {
    setSelectedZone(zone);
    if (!mapInstanceRef.current) return;
    const lats = zone.geometry.map((g) => g.lat);
    const lngs = zone.geometry.map((g) => g.lng);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    mapInstanceRef.current.setView([centerLat, centerLng], 14, { animate: true });
  };

  const selectedOverride = selectedZone ? overrides[selectedZone.id] : null;
  const isSelectedFixed = selectedOverride?.pricingMode === 'fixed';
  const selectedLive = selectedZone ? liveRecords.find((r) => r.zone_id === selectedZone.id) : null;
  const activeCharge = isSelectedFixed ? selectedOverride.fixedRate : selectedLive?.current_charge ?? 20;

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white font-mono uppercase tracking-wider text-[11px]">
            ERP Geographical Toll Gantries & Live Price Map
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/30">
            {zones.length} Gantries Monitored
          </span>
        </div>

        {/* Quick Corridor Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-mono mr-1">Select Corridor:</span>
          {zones.slice(0, 4).map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => flyToZone(z)}
              className={`px-2.5 py-1 rounded-xl font-mono text-[11px] font-bold transition-all cursor-pointer ${
                selectedZone?.id === z.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {z.zone_name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map + Interactive On-Map Pricing Controller */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-slate-950">
        {/* Leaflet Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Top-Left Status Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1 max-w-xs pointer-events-none shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono font-bold text-white uppercase text-[10px]">
              Click Any Gantry to Fix Price
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans">
            Toll rates are broadcast in real-time to citizen route planners and navigation HUDs.
          </p>
        </div>

        {/* Floating Active Gantry Price Fixer Card */}
        {selectedZone && (
          <div className="absolute bottom-4 right-4 z-10 w-[340px] bg-slate-950/95 backdrop-blur-xl p-5 rounded-3xl border-2 border-amber-500/50 shadow-2xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-bold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Selected Toll Gantry</span>
                </div>
                <h4 className="font-bold text-sm text-white font-display mt-0.5">
                  {selectedZone.zone_name}
                </h4>
                <div className="text-[11px] text-slate-400 font-mono truncate max-w-[220px]">
                  {selectedZone.road_name}
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                  isSelectedFixed
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                }`}
              >
                {isSelectedFixed ? 'Fixed Rate' : 'AI Dynamic'}
              </span>
            </div>

            {/* Current Telemetry */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Live Toll</div>
                <div className="text-lg font-black text-amber-400">₹{activeCharge}</div>
              </div>
              <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px]">Congestion</div>
                <div className="text-lg font-black text-white">
                  {selectedLive?.congestion_percentage ?? 48}%
                </div>
              </div>
            </div>

            {/* Price Fix Input Form */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase font-bold text-slate-300">
                Set Price on Map (Statutory Enforce):
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-xs font-mono">₹</span>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={fixedPriceInput}
                    onChange={(e) => setFixedPriceInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleApplyFix}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                  title="Fix and enforce this price on the map"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Fix Price</span>
                </button>
              </div>
            </div>

            {/* Reset / AI Toggle Action */}
            <div className="pt-1 flex items-center justify-between text-xs">
              {isSelectedFixed ? (
                <button
                  type="button"
                  onClick={handleApplyDynamic}
                  className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revert to AI Dynamic Toll</span>
                </button>
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Currently calculated by AI peak-flow model
                </span>
              )}
            </div>

            {/* Dynamic Notice Banner */}
            {notice && (
              <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{notice}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
