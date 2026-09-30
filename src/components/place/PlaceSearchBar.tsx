// SMARTMOVE All-India Place Search Bar with Debounced Autocomplete & Disambiguation Chooser
// Resolves any place in India (metros, Tier-2, towns, villages, PIN codes, landmarks)

import React, { useState, useEffect, useRef } from 'react';
import { searchIndiaPlaces, ResolvedPlace } from '../../lib/place/placeService';
import { Search, MapPin, X, Loader2, Compass, Layers, AlertCircle } from 'lucide-react';

interface PlaceSearchBarProps {
  onSelectPlace: (place: ResolvedPlace) => void;
  onOpenDirections?: () => void;
  onToggleLayers?: () => void;
  placeholder?: string;
  className?: string;
}

export const PlaceSearchBar: React.FC<PlaceSearchBarProps> = ({
  onSelectPlace,
  onOpenDirections,
  onToggleLayers,
  placeholder = 'Search any city, town, PIN code in India (e.g. Salem, Theni, 636005)...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResolvedPlace[]>([]);
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
        const places = await searchIndiaPlaces(query);
        setResults(places);
        setIsOpen(places.length > 0);
      } catch (err) {
        console.warn('Place search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(handler);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (place: ResolvedPlace) => {
    setQuery(place.name);
    setIsOpen(false);
    onSelectPlace(place);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        handleSelect({
          name: 'My Current Location (GPS)',
          state: 'Tamil Nadu',
          district: 'Salem',
          lat,
          lng,
          type: 'user_gps',
        });
      },
      (err) => console.warn('Geolocation error:', err)
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full max-w-lg z-30 ${className}`}>
      <div className="glass-panel-glow rounded-2xl p-1.5 flex items-center gap-2 border border-slate-700/80 shadow-2xl bg-slate-950/95 backdrop-blur-2xl">
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
          placeholder={placeholder}
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

        <button
          type="button"
          onClick={handleLocateMe}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-cyan-400 transition-colors cursor-pointer"
          title="Detect Current GPS Location"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>

        {onOpenDirections && (
          <button
            type="button"
            onClick={onOpenDirections}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all cursor-pointer"
            title="Open Route Navigation"
          >
            <span className="hidden sm:inline">Routes</span>
          </button>
        )}

        {onToggleLayers && (
          <button
            type="button"
            onClick={onToggleLayers}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Map Layers"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Disambiguation Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl bg-slate-950/98 backdrop-blur-2xl overflow-hidden animate-in fade-in zoom-in-95 z-50">
          <div className="p-2.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>All-India Resolved Locations</span>
            <span className="text-cyan-400 font-bold">{results.length} Matches</span>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/60">
            {results.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left p-3 hover:bg-cyan-950/40 transition-colors flex items-start gap-2.5 cursor-pointer"
              >
                <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{place.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    {place.district && <span>District: {place.district}</span>}
                    {place.state && <span>• State: {place.state}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
