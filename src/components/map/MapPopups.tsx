// SMARTMOVE Interactive Map Entity Popup Card

import React from 'react';
import { SourceBadge } from '../ui/SourceBadge';
import {
  Navigation,
  X,
  Sparkles,
  ArrowRight,
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Siren,
  HelpCircle,
} from 'lucide-react';

interface MapPopupsProps {
  entity: any;
  onClose: () => void;
  onStartRoute: (destName: string) => void;
}

export const MapPopups: React.FC<MapPopupsProps> = ({
  entity,
  onClose,
  onStartRoute,
}) => {
  if (!entity) return null;

  return (
    <div className="absolute bottom-4 right-4 z-40 p-5 rounded-3xl bg-slate-950/98 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 text-left">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
            {entity.type || 'SMARTMOVE INTELLIGENCE'}
          </span>
          <SourceBadge source={entity.source || 'simulated'} />
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xs cursor-pointer p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <h4 className="text-base font-bold text-white font-display mb-1">{entity.title}</h4>
      {entity.address && <p className="text-xs text-slate-400 mb-3">{entity.address}</p>}

      {/* Dynamic Key-Value Telemetry */}
      <div className="space-y-1.5 text-xs text-slate-300 font-mono p-3 rounded-2xl bg-slate-900/90 border border-slate-800 my-3">
        {Object.entries(entity).map(([k, v]) => {
          if (
            k === 'type' ||
            k === 'title' ||
            k === 'address' ||
            k === 'source' ||
            k === 'action' ||
            typeof v === 'object'
          )
            return null;

          return (
            <div key={k} className="flex justify-between gap-2 border-b border-slate-800/60 pb-1 last:border-none">
              <span className="text-slate-500 uppercase text-[10px]">{k.replace(/([A-Z])/g, ' $1')}:</span>
              <span className="text-cyan-300 font-semibold text-right">{String(v)}</span>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onStartRoute(entity.title)}
          className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          {entity.action === 'START_EMERGENCY_ROUTE' ? 'Start Emergency Corridor' : 'Navigate Here'}
        </button>
      </div>
    </div>
  );
};
