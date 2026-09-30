// SMARTMOVE Data Sources & Provenance Disclosure Modal
// Transparently details real geography vs simulated data vs what live API feeds would require

import React from 'react';
import { Info, X, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AboutDataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDataSourcesModal: React.FC<AboutDataSourcesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Data Sources & Provenance Model</h3>
              <span className="text-xs text-slate-400">SMARTMOVE Data Honesty Disclosure</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed space-y-3">
          <p>
            Real-time delivery is not the same as real-world data. SMARTMOVE operates on real map geography with deterministic simulation and estimation models. Here is the architectural mapping:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-3">Layer</th>
                  <th className="p-3">What it means</th>
                  <th className="p-3">Source in SMARTMOVE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-[11px] font-medium">
                <tr>
                  <td className="p-3 text-white font-bold">Real Map</td>
                  <td className="p-3 text-slate-300">Actual roads & geometry</td>
                  <td className="p-3 text-emerald-400">OpenStreetMap via Leaflet</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-bold">Real-time Updates</td>
                  <td className="p-3 text-slate-300">UI changes when DB changes</td>
                  <td className="p-3 text-emerald-400">Supabase Realtime Streams</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-bold">Traffic Flow</td>
                  <td className="p-3 text-slate-300">Sensors / Traffic API</td>
                  <td className="p-3 text-amber-400">Simulated by default (Pluggable)</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-bold">Bus Location</td>
                  <td className="p-3 text-slate-300">GPS / GTFS-Realtime</td>
                  <td className="p-3 text-amber-400">Simulated by default (Pluggable)</td>
                </tr>
                <tr>
                  <td className="p-3 text-white font-bold">Bus Overcrowding</td>
                  <td className="p-3 text-slate-300">Passenger-counting sensors</td>
                  <td className="p-3 text-sky-400">Estimated Crowding Model</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-white">Future Municipal Production Integrations:</div>
            <div>• Road traffic: TomTom / HERE Flow API or roadside loop induction sensors.</div>
            <div>• Transit: City Transport Agency GTFS-Realtime vehicle position feeds.</div>
            <div>• Crowding: Automated Passenger Counter (APC) infrared sensors and smart ticketing.</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
        >
          Understood & Close
        </button>
      </div>
    </div>
  );
};
