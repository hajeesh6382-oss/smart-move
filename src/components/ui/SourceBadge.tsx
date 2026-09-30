// SMARTMOVE Upgraded Data Source & Provenance Badge Component
// Features icon + text (never color alone) and click-to-explain "Where does this data come from?" popover

import React, { useState } from 'react';
import { DataSourceType, DATA_PROVENANCE_CONFIG } from '../../config/design-tokens';
import { Cpu, Database, Radio, Wifi, Calculator, Info, HelpCircle, X } from 'lucide-react';

export type SourceType = DataSourceType | string;

export interface SourceBadgeProps {
  source?: SourceType;
  provider?: string;
  className?: string;
  interactive?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  source = 'simulated',
  provider,
  className = '',
  interactive = true,
}) => {
  const [showPopover, setShowPopover] = useState(false);

  const norm = (source.toLowerCase().replace(' data', '').replace(' value', '') as DataSourceType) || 'simulated';
  const config = DATA_PROVENANCE_CONFIG[norm] || DATA_PROVENANCE_CONFIG.simulated;

  const renderIcon = () => {
    switch (norm) {
      case 'live_api':
      case 'live_weather':
        return <Radio className="w-3 h-3 text-emerald-400" />;
      case 'sensor':
        return <Wifi className="w-3 h-3 text-cyan-400" />;
      case 'estimated':
        return <Calculator className="w-3 h-3 text-sky-400" />;
      case 'ai_prediction':
        return <Cpu className="w-3 h-3 text-indigo-400" />;
      case 'delayed':
        return <Info className="w-3 h-3 text-amber-400" />;
      case 'unavailable':
        return <X className="w-3 h-3 text-rose-400" />;
      case 'demo_seed':
      case 'demo':
        return <Database className="w-3 h-3 text-purple-400" />;
      default:
        return <Cpu className="w-3 h-3 text-amber-400" />;
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={(e) => {
          if (interactive) {
            e.stopPropagation();
            setShowPopover(!showPopover);
          }
        }}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-bold border transition-all cursor-pointer ${config.badgeClass} ${className}`}
        title={`Provenance: ${config.label}. Click to see data requirements.`}
      >
        {renderIcon()}
        <span>{config.label}</span>
        {interactive && <HelpCircle className="w-2.5 h-2.5 opacity-60 hover:opacity-100 ml-0.5" />}
      </button>

      {/* "Where does this data come from?" Popover */}
      {showPopover && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPopover(false)} />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-0 mt-2 w-72 p-4 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-cyan-500/40 shadow-2xl z-50 text-left text-xs animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" /> Data Provenance
              </span>
              <button
                type="button"
                onClick={() => setShowPopover(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="text-[11px] leading-relaxed">
                <strong className="text-white">{config.label}:</strong> {config.description}
              </div>

              {provider && (
                <div className="text-[10px] font-mono text-cyan-300">
                  Active Provider: <code>{provider}</code>
                </div>
              )}

              <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                💡 <em>What a live feed requires:</em>
                <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-400">
                  {norm === 'simulated' && <li>Municipal CCTV loops or TomTom/HERE live traffic flow API.</li>}
                  {norm === 'estimated' && <li>Automated Passenger Counting (APC) sensors or faregate ticketing feeds.</li>}
                  {norm === 'live_api' && <li>Connected GTFS-Realtime vehicle position streams or live API endpoints.</li>}
                  {norm === 'ai_prediction' && <li>Historical sensor telemetry + ML prediction model.</li>}
                  {norm === 'unavailable' && <li>Data source is currently offline or unconfigured.</li>}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
