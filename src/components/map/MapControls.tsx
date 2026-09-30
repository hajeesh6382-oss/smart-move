// SMARTMOVE Map Controls (Zoom, Map Style, Fullscreen, Key Config)

import React, { useState } from 'react';
import { MapStyleType } from './types';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_ZOOM } from '../../config/map-config';
import { Plus, Minus, Maximize2, Minimize2, Compass, Layers, Key, MapPin } from 'lucide-react';

interface MapControlsProps {
  map?: any;
  mapStyle?: MapStyleType;
  onChangeMapStyle?: (style: MapStyleType) => void;
  onOpenConfig?: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
  map,
  mapStyle,
  onChangeMapStyle,
  onOpenConfig,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    if (map) map.setZoom((map.getZoom() || DEFAULT_ZOOM) + 1);
  };

  const handleZoomOut = () => {
    if (map) map.setZoom((map.getZoom() || DEFAULT_ZOOM) - 1);
  };

  const handleResetCenter = () => {
    if (map) {
      map.panTo({ lat: DEFAULT_LATITUDE, lng: DEFAULT_LONGITUDE });
      map.setZoom(DEFAULT_ZOOM);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="absolute top-20 right-4 z-30 flex flex-col items-end gap-2 pointer-events-auto">
      {/* Map Type Switcher (Default, Satellite, Terrain) */}
      <div className="bg-slate-950/90 p-1 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col gap-1 text-[11px] font-mono">
        {(['default', 'satellite', 'terrain'] as MapStyleType[]).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => onChangeMapStyle(st)}
            className={`px-3 py-1 rounded-xl capitalize transition-all cursor-pointer ${
              mapStyle === st
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Action Buttons Stack (Zoom, Center, Fullscreen, Config) */}
      <div className="bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col gap-1.5 text-slate-300">
        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="h-[1px] bg-slate-800 my-0.5" />

        <button
          type="button"
          onClick={handleResetCenter}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
          title="Center on Salem, TN"
        >
          <MapPin className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleToggleFullscreen}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenConfig}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
          title="Google Maps API Key Settings"
        >
          <Key className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
