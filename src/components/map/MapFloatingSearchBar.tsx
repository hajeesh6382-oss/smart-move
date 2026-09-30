// SMARTMOVE Floating Map Search Bar with Debounced Places Autocomplete

import React, { useState, useEffect, useRef } from 'react';
import { PlaceResult } from './types';
import { searchPlaces } from '../../lib/map/geocodingService';
import { Search, MapPin, X, Loader2, Navigation, Layers, Compass, Building, Bus, SquareParking } from 'lucide-react';

interface MapFloatingSearchBarProps {
  onSelectPlace: (place: PlaceResult) => void;
  onOpenDirections: () => void;
  onToggleLayers: () => void;
  onLocateMe: () => void;
  isDirectionsOpen?: boolean;
}

export const MapFloatingSearchBar: React.FC<MapFloatingSearchBarProps> = ({
  onSelectPlace,
  onOpenDirections,
  onToggleLayers,
  onLocateMe,
  isDirectionsOpen = false,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handler = setTimeout(async () => {
      try {
        const matches = await searchPlaces(query);
        setResults(matches);
        setIsOpen(true);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside to close results dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place: PlaceResult) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md z-30">
      <div className="glass-panel-glow rounded-2xl p-1.5 flex items-center gap-2 border border-slate-700/80 shadow-2xl bg-slate-950/90 backdrop-blur-2xl">
        <div className="pl-2.5 text-cyan-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search campus, hospital, parking or transit..."
          className="flex-1 bg-transparent border-none text-xs lg:text-sm text-white placeholder:text-slate-500 focus:outline-none font-medium"
        />

        {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin mr-1" />}

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <div className="h-5 w-[1px] bg-slate-800" />

        {/* Action Buttons: Directions, Locate Me, Layers */}
        <button
          type="button"
          onClick={onOpenDirections}
          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
            isDirectionsOpen
              ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
              : 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30'
          }`}
          title="Open Multi-Objective Directions"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Routes</span>
        </button>

        <button
          type="button"
          onClick={onLocateMe}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Locate My Position (GPS)"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={onToggleLayers}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Toggle Layers"
        >
          <Layers className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl bg-slate-950/98 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 z-50">
          <div className="p-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
            Smart Mobility Places & Telemetry
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
            {results.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left p-3 hover:bg-cyan-950/40 transition-colors flex items-start gap-2.5 cursor-pointer"
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                  {place.category === 'hospital' ? (
                    <Building className="w-3.5 h-3.5 text-emerald-400" />
                  ) : place.category === 'transit' ? (
                    <Bus className="w-3.5 h-3.5 text-blue-400" />
                  ) : place.category === 'parking' ? (
                    <SquareParking className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{place.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{place.address}</div>
                  {place.nearbyMetrics && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300 mt-1">
                      <span>🚦 {place.nearbyMetrics.congestionPct}% Congestion</span>
                      <span>🅿️ {place.nearbyMetrics.availableParking} bays</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
