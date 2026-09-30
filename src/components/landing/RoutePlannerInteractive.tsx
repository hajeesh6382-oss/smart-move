import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Car,
  Bike,
  Bus,
  Train,
  Footprints,
  Zap,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Coins,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface RouteCard {
  id: string;
  tag: string;
  isAiRecommended?: boolean;
  time: string;
  distance: string;
  cost: string;
  traffic: string;
  co2: string;
  description: string;
  accentColor: string;
}

export const RoutePlannerInteractive: React.FC = () => {
  const navigate = useNavigate();
  const [fromLocation, setFromLocation] = useState('Tech Corridor, Phase 1 (Current Location)');
  const [toLocation, setToLocation] = useState('Central Airport Hub, Terminal 2');
  const [selectedTransport, setSelectedTransport] = useState<string>('EV');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('ai-route');
  const [isCalculating, setIsCalculating] = useState(false);

  const transportModes = [
    { id: 'Car', label: 'Car', icon: '🚗' },
    { id: 'Bike', label: 'Bike', icon: '🏍️' },
    { id: 'Bus', label: 'Bus', icon: '🚌' },
    { id: 'Metro', label: 'Metro', icon: '🚆' },
    { id: 'Walk', label: 'Walk', icon: '🚶' },
    { id: 'EV', label: 'EV', icon: '⚡' },
  ];

  const routes: RouteCard[] = [
    {
      id: 'ai-route',
      tag: 'AI RECOMMENDED ROUTE',
      isAiRecommended: true,
      time: '18 min',
      distance: '7.2 km',
      cost: '₹42',
      traffic: 'Low Traffic',
      co2: '32% less CO₂',
      description: 'Dynamic green wave signal clearance + automated bypass toll routing',
      accentColor: '#06b6d4',
    },
    {
      id: 'fastest-route',
      tag: 'FASTEST',
      isAiRecommended: false,
      time: '20 min',
      distance: '8.4 km',
      cost: '₹58',
      traffic: 'Moderate Traffic',
      co2: '14% less CO₂',
      description: 'Elevated expressway with minimal intermediate intersections',
      accentColor: '#3b82f6',
    },
    {
      id: 'cheapest-route',
      tag: 'CHEAPEST',
      isAiRecommended: false,
      time: '28 min',
      distance: '7.9 km',
      cost: '₹28',
      traffic: 'Low Traffic',
      co2: '25% less CO₂',
      description: 'Non-toll arterial avenue with coordinated dedicated transit lane',
      accentColor: '#f59e0b',
    },
    {
      id: 'eco-route',
      tag: 'ECO FRIENDLY',
      isAiRecommended: false,
      time: '24 min',
      distance: '6.8 km',
      cost: '₹34',
      traffic: 'Low Traffic',
      co2: '58% less CO₂',
      description: 'Zero emission corridor with priority EV charging stops & tree canopy',
      accentColor: '#10b981',
    },
  ];

  const handleSimulateSearch = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setIsCalculating(false);
    }, 600);
  };

  return (
    <div className="w-full">
      {/* Route Inputs Bar */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-slate-950/80 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {/* From Input */}
          <div className="relative">
            <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              FROM
            </label>
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-medium focus:outline-none transition-colors"
                placeholder="Current Location"
              />
            </div>
          </div>

          {/* To Input */}
          <div className="relative">
            <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              TO
            </label>
            <div className="relative flex items-center">
              <Navigation className="w-4 h-4 text-rose-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-700 focus:border-cyan-400 text-white text-xs sm:text-sm font-medium focus:outline-none transition-colors"
                placeholder="Enter destination"
              />
            </div>
          </div>
        </div>

        {/* Transport Mode Pills (Prompt Section 7) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-5 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-2">Mode:</span>
            {transportModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setSelectedTransport(mode.id);
                  handleSimulateSearch();
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedTransport === mode.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 scale-105'
                    : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => navigate('/app/routes')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Advanced Planner</span>
          </button>
        </div>
      </div>

      {/* Generated Route Option Cards Grid */}
      <div className={`mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 transition-opacity duration-300 ${isCalculating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
        {routes.map((route) => {
          const isSelected = route.id === selectedRouteId;
          return (
            <div
              key={route.id}
              onClick={() => setSelectedRouteId(route.id)}
              className={`relative rounded-3xl p-5 border text-left transition-all duration-300 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900/95 border-cyan-400 shadow-2xl shadow-cyan-500/25 scale-[1.03] ring-1 ring-cyan-400'
                  : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
              }`}
            >
              {/* AI Recommended Badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full ${
                    route.isAiRecommended
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {route.tag}
                </span>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                )}
              </div>

              {/* Time & Distance Header */}
              <div className="flex items-baseline justify-between mb-2">
                <h4 className="text-2xl font-black font-display text-white">
                  {route.time}
                </h4>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {route.distance}
                </span>
              </div>

              {/* Pricing & Traffic */}
              <div className="flex items-center justify-between py-2 border-y border-slate-800/80 mb-3 text-xs font-semibold">
                <span className="text-cyan-300 font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  {route.cost}
                </span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {route.traffic}
                </span>
              </div>

              {/* Eco CO2 Benefit */}
              <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-between">
                <span>🌱 {route.co2}</span>
                <span className="text-[10px] text-emerald-500">Verified</span>
              </div>

              {/* Route Summary */}
              <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
                {route.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
