// SMARTMOVE OpenStreetMap Nominatim Places Autocomplete Input Component
// 100% Free & Open-Source, replacing Google Places Autocomplete API.
// Features debouncing (350ms), in-memory caching, rate-limit throttling, and instant suggestions.

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, X, Loader2, Search, Compass } from 'lucide-react';
import { searchNominatim, NominatimPlace } from '../../services/nominatimService';

export interface PlaceSelection {
  displayName?: string;
  name?: string;
  formattedAddress: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

interface PlacesAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectPlace?: (place: PlaceSelection) => void;
  placeholder?: string;
  label: string;
  indicatorColor?: string;
  disabled?: boolean;
}

export const PlacesAutocompleteInput: React.FC<PlacesAutocompleteInputProps> = ({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Search place, junction, landmark, town (OpenStreetMap)...',
  label,
  indicatorColor = 'bg-cyan-400',
  disabled = false,
}) => {
  const [predictions, setPredictions] = useState<NominatimPlace[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Nominatim Fetch
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const handler = setTimeout(async () => {
      try {
        const results = await searchNominatim(value.trim(), 6);
        setPredictions(results);
        setIsOpen(results.length > 0);
      } catch (err) {
        console.warn('[SMARTMOVE Nominatim] Autocomplete error:', err);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (item: NominatimPlace) => {
    const textToDisplay = item.displayName || item.name;
    onChange(textToDisplay);
    setIsOpen(false);
    if (onSelectPlace) {
      onSelectPlace({
        displayName: item.displayName,
        name: item.name,
        formattedAddress: item.formattedAddress,
        placeId: item.placeId,
        lat: item.lat,
        lng: item.lng,
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <label className="text-[11px] text-blue-950 font-bold flex items-center justify-between mb-1 font-mono">
        <span className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${indicatorColor}`} /> {label}
        </span>
        <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">
          OSM Nominatim
        </span>
      </label>

      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && predictions.length > 0) {
              e.preventDefault();
              handleSelect(predictions[0]);
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full bg-white border border-blue-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 rounded-xl pl-3 pr-8 py-2.5 text-xs text-blue-950 placeholder:text-blue-300 font-semibold focus:outline-none transition-colors shadow-sm"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setPredictions([]);
                setIsOpen(false);
              }}
              className="p-0.5 text-blue-500 hover:text-blue-900 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Search className="w-3.5 h-3.5 text-blue-500" />
          )}
        </div>
      </div>

      {/* Nominatim Autocomplete Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 rounded-2xl glass-panel border border-blue-200 shadow-2xl bg-white/98 backdrop-blur-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
          <div className="p-2 text-[10px] font-mono uppercase text-blue-950 border-b border-blue-100 flex items-center justify-between font-bold">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-blue-600" /> OpenStreetMap Suggestions
            </span>
            <span className="text-blue-600 font-bold">{predictions.length} Places Found</span>
          </div>

          <div className="max-h-56 overflow-y-auto divide-y divide-blue-50">
            {predictions.map((p, idx) => (
              <button
                key={p.placeId || idx}
                type="button"
                onClick={() => handleSelect(p)}
                className="w-full text-left p-2.5 hover:bg-blue-50 transition-colors flex items-start gap-2.5 cursor-pointer text-xs group"
              >
                <div className="mt-0.5 p-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 group-hover:bg-blue-100 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-blue-950 truncate group-hover:text-blue-600 transition-colors">
                    {p.name || p.displayName}
                  </div>
                  <div className="text-[11px] text-blue-700 truncate font-medium">
                    {p.formattedAddress}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="px-3 py-1.5 bg-blue-50/70 border-t border-blue-100 text-[10px] font-mono text-blue-700 text-right">
            Data © OpenStreetMap contributors | Nominatim API
          </div>
        </div>
      )}
    </div>
  );
};
