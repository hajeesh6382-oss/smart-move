// SMARTMOVE Data Provider Health & Ingest Log Monitor Page (Admin)

import React, { useState } from 'react';
import { providerManager, IngestLogEntry, SourceMode } from '../../lib/providers/dataProviderManager';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { StatCard } from '../../components/ui/StatCard';
import { Radio, Cpu, Wifi, Database, CheckCircle2, AlertTriangle, RefreshCw, ShieldCheck, Activity } from 'lucide-react';

export const ProvidersHealthPage: React.FC = () => {
  const [sourceMode, setSourceMode] = useState<SourceMode>(providerManager.getSourceMode());
  const [logs, setLogs] = useState<IngestLogEntry[]>(providerManager.getLogs());

  const handleModeChange = (mode: SourceMode) => {
    setSourceMode(mode);
    providerManager.setSourceMode(mode);
  };

  const handleRefresh = () => {
    setLogs([...providerManager.getLogs()]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Data Ingestion & Provider Observability
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Data Provenance & Provider Health
          </h2>
          <p className="text-xs text-slate-400">
            Monitor connected telemetry sources, fallback latencies, and source mode configurations.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Telemetry
        </button>
      </div>

      {/* Source Mode Selector Sandbox */}
      <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Active System Ingestion Mode
          </span>
          <span className="text-xs text-cyan-400 font-mono font-bold">
            Current: {sourceMode.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              mode: 'simulated' as SourceMode,
              title: '1. Simulated Mode (Default)',
              desc: 'All city corridors driven by internal deterministic simulation loop.',
              badge: '🟠 SIMULATED LIVE',
            },
            {
              mode: 'hybrid' as SourceMode,
              title: '2. Hybrid Mode',
              desc: 'Prefers live telemetry if provider keys exist; falls back to simulation.',
              badge: '🔵 HYBRID DATA',
            },
            {
              mode: 'live_only' as SourceMode,
              title: '3. Strict Live Only',
              desc: 'Never falls back silently. Shows "No live source connected" on missing feeds.',
              badge: '🟢 LIVE API ONLY',
            },
          ].map((item) => (
            <button
              key={item.mode}
              type="button"
              onClick={() => handleModeChange(item.mode)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                sourceMode === item.mode
                  ? 'bg-cyan-500/15 border-cyan-500/50 shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white font-display">{item.title}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Provider Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Simulation Engine"
          value="Healthy (14ms)"
          subtitle="Reactive ticker running"
          icon={<Cpu className="w-4 h-4 text-amber-400" />}
          source="SIMULATED DATA"
        />
        <StatCard
          title="TomTom Traffic API"
          value="Fallback (Stub)"
          subtitle="Awaiting TRAFFIC_API_KEY"
          icon={<Radio className="w-4 h-4 text-emerald-400" />}
          source="LIVE API DATA"
        />
        <StatCard
          title="GTFS-Realtime"
          value="Standby"
          subtitle="Awaiting transit agency feed"
          icon={<Radio className="w-4 h-4 text-emerald-400" />}
          source="LIVE API DATA"
        />
        <StatCard
          title="Supabase Auth SMTP"
          value="Ready"
          subtitle="Resend / Custom SMTP"
          icon={<ShieldCheck className="w-4 h-4 text-cyan-400" />}
          source="LIVE API DATA"
        />
      </div>

      {/* Admin Auth & SMTP Diagnostics Panel */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Supabase Auth & SMTP Observability Check
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify Supabase Auth custom SMTP health and token dispatch capability.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const btn = document.getElementById('auth-check-btn');
              const resBox = document.getElementById('auth-check-res');
              if (btn) btn.innerText = 'Checking SMTP...';
              try {
                const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
                const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
                if (!supabaseUrl || supabaseUrl.includes('mock-smartmove')) {
                  if (resBox) {
                    resBox.innerHTML =
                      '<div class="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs"><strong>Sandbox Mode:</strong> Local dev active. For live cloud SMTP, configure VITE_SUPABASE_URL and follow docs/AUTH_SETUP.md.</div>';
                  }
                  return;
                }
                const res = await fetch(`${supabaseUrl}/functions/v1/auth-health`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${supabaseAnonKey}`,
                  },
                  body: JSON.stringify({ testEmail: 'admin@smartmove.city' }),
                });
                const data = await res.json();
                if (resBox) {
                  resBox.innerHTML = `<div class="p-3 rounded-xl ${
                    data.status === 'healthy'
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                  } text-xs"><p class="font-bold">Status: ${data.status.toUpperCase()}</p><p class="text-[11px] mt-1">${
                    data.message || data.error
                  }</p></div>`;
                }
              } catch (e: any) {
                if (resBox) {
                  resBox.innerHTML = `<div class="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">Note: ${e.message}</div>`;
                }
              } finally {
                if (btn) btn.innerText = 'Run Auth Health Check';
              }
            }}
            id="auth-check-btn"
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold cursor-pointer transition-colors"
          >
            Run Auth Health Check
          </button>
        </div>
        <div id="auth-check-res" />
      </div>

      {/* Ingest Log Audit Table */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white font-display uppercase tracking-wider font-mono">
            Recent Ingest Log Stream ({logs.length} entries)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="pb-2.5 pl-2">Timestamp</th>
                <th className="pb-2.5 px-3">Provider</th>
                <th className="pb-2.5 px-3">Category</th>
                <th className="pb-2.5 px-3">Status</th>
                <th className="pb-2.5 px-3">Latency</th>
                <th className="pb-2.5 px-3">Provenance Assigned</th>
                <th className="pb-2.5 pr-2">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pl-2 text-slate-400 text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">{log.provider}</td>
                  <td className="py-3 px-3 uppercase text-slate-400 text-[10px]">{log.category}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyan-300 font-bold">{log.latencyMs} ms</td>
                  <td className="py-3 px-3">
                    <SourceBadge source={log.dataSource} interactive={false} />
                  </td>
                  <td className="py-3 pr-2 text-slate-300 font-sans text-xs">{log.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
