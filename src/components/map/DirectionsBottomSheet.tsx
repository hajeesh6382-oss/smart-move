// SMARTMOVE Google-Maps-Style Multi-Objective Directions Panel & Mobile Draggable Bottom Sheet

import React, { useState } from 'react';
import { MultiObjectiveRoute, TravelMode } from './types';
import { SourceBadge } from '../ui/SourceBadge';
import {
  Car,
  Bike,
  Bus,
  Footprints,
  ArrowUpDown,
  X,
  ChevronUp,
  ChevronDown,
  Navigation,
  CheckCircle2,
  HelpCircle,
  Clock,
  Fuel,
  Leaf,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DirectionsBottomSheetProps {
  originName: string;
  destinationName: string;
  travelMode: TravelMode;
  routes: MultiObjectiveRoute[];
  selectedRouteId: 'fastest' | 'eco' | 'balanced';
  isOpen: boolean;
  onClose: () => void;
  onSwapPoints: () => void;
  onChangeTravelMode: (mode: TravelMode) => void;
  onSelectRoute: (routeId: 'fastest' | 'eco' | 'balanced') => void;
  onStartNavigation: () => void;
}

export const DirectionsBottomSheet: React.FC<DirectionsBottomSheetProps> = ({
  originName,
  destinationName,
  travelMode,
  routes,
  selectedRouteId,
  isOpen,
  onClose,
  onSwapPoints,
  onChangeTravelMode,
  onSelectRoute,
  onStartNavigation,
}) => {
  const [sheetState, setSheetState] = useState<'peek' | 'half' | 'full'>('half');
  const [expandedWhyId, setExpandedWhyId] = useState<string | null>('eco');
  const [showSteps, setShowSteps] = useState(false);

  if (!isOpen) return null;

  const activeRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  const travelModes: { mode: TravelMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'DRIVE', label: 'Drive', icon: <Car className="w-4 h-4" /> },
    { mode: 'TWO_WHEELER', label: '2-Wheeler', icon: <Bike className="w-4 h-4" /> },
    { mode: 'TRANSIT', label: 'Transit', icon: <Bus className="w-4 h-4" /> },
    { mode: 'WALK', label: 'Walk', icon: <Footprints className="w-4 h-4" /> },
  ];

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 sm:top-20 sm:left-4 sm:bottom-auto sm:right-auto sm:w-96 z-40 transition-all duration-300 ${
        sheetState === 'peek'
          ? 'h-24 sm:h-auto'
          : sheetState === 'half'
          ? 'h-[62vh] sm:h-auto sm:max-h-[85vh]'
          : 'h-[92vh] sm:h-auto sm:max-h-[85vh]'
      }`}
    >
      <div className="h-full glass-panel-glow p-4 sm:p-5 rounded-t-3xl sm:rounded-3xl border border-slate-700/80 shadow-2xl bg-slate-950/95 backdrop-blur-2xl flex flex-col overflow-hidden">
        {/* Mobile Drag Handle */}
        <div className="sm:hidden flex justify-center pb-2 cursor-pointer" onClick={() => setSheetState(sheetState === 'half' ? 'full' : 'half')}>
          <div className="w-10 h-1.5 rounded-full bg-slate-700" />
        </div>

        {/* Header & Close Button */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" /> SMARTMOVE Routes
            </span>
            <SourceBadge source="LIVE API DATA" interactive={false} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Travel Mode Selector */}
        <div className="grid grid-cols-4 gap-1.5 my-3">
          {travelModes.map((item) => {
            const isSelected = travelMode === item.mode;
            return (
              <button
                key={item.mode}
                type="button"
                onClick={() => onChangeTravelMode(item.mode)}
                className={`py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {item.icon}
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Origin & Destination with Swap */}
        <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 mb-3 relative">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-slate-300 font-medium truncate">{originName}</span>
          </div>
          <div className="h-[1px] bg-slate-800 ml-4" />
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0" />
            <span className="text-white font-bold truncate">{destinationName}</span>
          </div>

          <button
            type="button"
            onClick={onSwapPoints}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Route Cards List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {routes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            const isWhyOpen = expandedWhyId === route.id;

            return (
              <div
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full ${
                          route.id === 'eco'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : route.id === 'fastest'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {route.badge}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <h4 className="text-xs font-bold text-white font-display mt-1">{route.name}</h4>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-black font-mono text-white">{route.etaMin} min</div>
                    <div className="text-[10px] text-slate-400">{route.distanceKm} km</div>
                  </div>
                </div>

                {/* Emissions & Metrics Row */}
                <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
                  <div>
                    <span className="text-slate-500 block">Congestion</span>
                    <span className="text-white font-bold">{route.congestionPct}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">CO₂ (ESTIMATED)</span>
                    <span className="text-emerald-400 font-bold">{route.co2Grams} g</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Fuel Saved</span>
                    <span className="text-cyan-300 font-bold">{route.fuelSavedPct}%</span>
                  </div>
                </div>

                {/* Why Explainability Trigger */}
                <div className="mt-2 pt-1.5 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedWhyId(isWhyOpen ? null : route.id);
                    }}
                    className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3 text-cyan-400" />
                    Why this recommendation?
                    {isWhyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isWhyOpen && (
                    <p className="text-[11px] text-slate-300 mt-1.5 p-2 rounded-lg bg-slate-950/80 border border-slate-800 leading-relaxed">
                      {route.whyExplanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Turn-by-turn steps expander */}
          {activeRoute?.steps && activeRoute.steps.length > 0 && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowSteps(!showSteps)}
                className="w-full text-left text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <span>Turn-by-turn Directions ({activeRoute.steps.length} steps)</span>
                {showSteps ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showSteps && (
                <div className="mt-2 space-y-1.5 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                  {activeRoute.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 pb-2 border-b border-slate-800/60 last:border-none">
                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-slate-200 font-medium">{step.instruction}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{step.distanceMeters} m</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Start Navigation CTA */}
        <div className="pt-3 mt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onStartNavigation}
            className="w-full py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs lg:text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation className="w-4 h-4" /> Start Route ({activeRoute?.name || 'Fastest'})
          </button>
        </div>
      </div>
    </div>
  );
};
