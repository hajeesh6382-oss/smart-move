// SMARTMOVE Data Sources & Provenance Observability Admin Panel
// Section 34: System Status dashboard displaying API connection health, latencies, and error rates.

import React from 'react';
import { useDataSourceStatus } from '../../hooks/useDataSourceStatus';
import { useSmartmoveMode } from '../../hooks/useSmartmoveMode';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { ModeToggle } from '../../components/ui/ModeToggle';
import { LastUpdatedIndicator } from '../../components/ui/LastUpdatedIndicator';
import { Radio, Database, Cpu, Wifi, AlertTriangle, CheckCircle2, ShieldCheck, RefreshCw, KeyRound, Clock } from 'lucide-react';

export const DataSourcesPanel: React.FC = () => {
  const { sources } = useDataSourceStatus();
  const { mode, isLive } = useSmartmoveMode();

  const liveCount = sources.filter((s) => s.status === 'LIVE').length;
  const aiCount = sources.filter((s) => s.status === 'AI_PREDICTION').length;
  const offlineCount = sources.filter((s) => s.status === 'OFFLINE').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl border border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Data Sources & Provenance Observability</h1>
              <p className="text-slate-400 text-sm">Real-time health, connection status, latency & provenance verification</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>

      {/* Top Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Mode</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${isLive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'}`}>
              {mode.toUpperCase()} MODE
            </span>
          </div>
          <div className="mt-3 text-2xl font-bold text-white">
            {isLive ? 'Real-Time APIs Active' : 'Demo Simulation Mode'}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isLive ? 'Strict source validation enabled' : 'Simulated telemetry stream active'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Live External APIs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-emerald-400">{liveCount} Sources</div>
          <p className="text-xs text-slate-400 mt-1">OpenWeather, OpenChargeMap, Google Routes</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI ML Models</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-indigo-400">{aiCount} Engines</div>
          <p className="text-xs text-slate-400 mt-1">Time-series forecasting & risk engines</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Offline / Unconfigured</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-bold text-amber-400">{offlineCount} Sources</div>
          <p className="text-xs text-slate-400 mt-1">Requires API key or municipal feed setup</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" /> Data Feed Registry
          </h2>
          <span className="text-xs font-mono text-slate-400">Total Registered Streams: {sources.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono uppercase">
                <th className="py-3.5 px-6">Data Stream Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4">API Key</th>
                <th className="py-3.5 px-6">Last Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sources.map((source) => (
                <tr key={source.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-medium text-white">
                    <div>{source.name}</div>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">{source.description}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-cyan-300 uppercase">{source.category}</td>
                  <td className="py-4 px-4 font-mono text-slate-400">{source.provider}</td>
                  <td className="py-4 px-4">
                    <SourceBadge
                      source={
                        source.status === 'LIVE'
                          ? 'live_api'
                          : source.status === 'AI_PREDICTION'
                          ? 'ai_prediction'
                          : source.status === 'OFFLINE'
                          ? 'unavailable'
                          : 'simulated'
                      }
                      provider={source.provider}
                    />
                  </td>
                  <td className="py-4 px-4 font-mono">
                    {source.latencyMs !== null ? (
                      <span className="text-emerald-400 font-semibold">{source.latencyMs} ms</span>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {source.requiresApiKey ? (
                      source.apiKeyConfigured ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
                          <KeyRound className="w-3 h-3" /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                          <AlertTriangle className="w-3 h-3" /> Missing Key
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">Public API</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <LastUpdatedIndicator timestamp={source.lastUpdated || undefined} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
