// SMARTMOVE Layer Control Panel with Clear Provenance Identification

import React from 'react';
import { MapLayersState } from './types';
import { Layers, CheckSquare, Square, X, Radio, Cpu, Bus, SquareParking, Zap, AlertTriangle, Siren } from 'lucide-react';
import { SourceBadge } from '../ui/SourceBadge';

interface MapLayerControlProps {
  isOpen: boolean;
  onClose: () => void;
  layers: MapLayersState;
  onToggleLayer: (layerKey: keyof MapLayersState) => void;
}

export const MapLayerControl: React.FC<MapLayerControlProps> = ({
  isOpen,
  onClose,
  layers,
  onToggleLayer,
}) => {
  if (!isOpen) return null;

  const layerItems: {
    key: keyof MapLayersState;
    title: string;
    description: string;
    source: 'LIVE API DATA' | 'SIMULATED DATA' | 'ESTIMATED VALUE';
    icon: React.ReactNode;
  }[] = [
    {
      key: 'googleTraffic',
      title: 'OSM & ML Congestion Flow',
      description: 'OpenStreetMap topology with SMARTMOVE AI traffic modeling',
      source: 'LIVE API DATA',
      icon: <Radio className="w-4 h-4 text-emerald-400" />,
    },
    {
      key: 'simulatedCongestion',
      title: 'SMARTMOVE Predictive Corridors',
      description: 'Mathematical flow & queue congestion model',
      source: 'SIMULATED DATA',
      icon: <Cpu className="w-4 h-4 text-amber-400" />,
    },
    {
      key: 'buses',
      title: 'Smart Buses & Crowding',
      description: 'Simulated bus positions with estimated crowd levels',
      source: 'ESTIMATED VALUE',
      icon: <Bus className="w-4 h-4 text-sky-400" />,
    },
    {
      key: 'parking',
      title: 'Parking Availability',
      description: 'Dynamic available bays & 15m exhaustion forecast',
      source: 'SIMULATED DATA',
      icon: <SquareParking className="w-4 h-4 text-blue-400" />,
    },
    {
      key: 'ev',
      title: 'EV Fast Charging Stations',
      description: 'Live plug status (kW output & queue wait)',
      source: 'SIMULATED DATA',
      icon: <Zap className="w-4 h-4 text-cyan-400" />,
    },
    {
      key: 'pedestrian',
      title: 'Pedestrian Risk Heatmap',
      description: 'Conflict risk zones near colleges and markets',
      source: 'ESTIMATED VALUE',
      icon: <AlertTriangle className="w-4 h-4 text-rose-400" />,
    },
    {
      key: 'emergency',
      title: 'Emergency Green Corridor',
      description: 'Preemptive route link to Govt Medical College Hospital',
      source: 'SIMULATED DATA',
      icon: <Siren className="w-4 h-4 text-emerald-400" />,
    },
  ];

  return (
    <div className="absolute top-20 left-4 sm:left-96 z-40 p-4 sm:p-5 rounded-3xl bg-slate-950/98 backdrop-blur-2xl border border-slate-700 shadow-2xl max-w-sm space-y-3 animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <span className="text-xs font-bold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-cyan-400" /> Map Layers & Provenance
        </span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-[65vh] overflow-y-auto space-y-2 pr-1">
        {layerItems.map((item) => {
          const isEnabled = layers[item.key];

          return (
            <div
              key={item.key}
              onClick={() => onToggleLayer(item.key)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                isEnabled
                  ? 'bg-cyan-950/30 border-cyan-500/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-display">{item.title}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.description}</div>
                  <div className="mt-1.5">
                    <SourceBadge source={item.source} interactive={false} />
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => {}} // Controlled by container onClick
                className="w-4 h-4 mt-1 accent-cyan-500 cursor-pointer shrink-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
