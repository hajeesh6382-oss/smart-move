// SMARTMOVE Citizen Notifications & Real-Time Alerts Page

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore } from '../../lib/supabase/mockStore';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Bell, Check, Trash2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { PredictiveTrafficAlertPanel } from '../../components/ui/PredictiveTrafficAlertPanel';

export const AlertsPage: React.FC = () => {
  const { data: alerts } = useRealtimeTable('alerts');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Real-Time Push Notifications
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            Active Alerts & Advisories
          </h2>
          <p className="text-xs text-slate-400">
            Automated alerts triggered by surge anomalies, bus overloads, and pedestrian safety warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => cityStore.clearAlerts()}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      </div>

      {/* FEATURE: Predictive High-Traffic Gmail Alert & Re-routing Advisory Panel */}
      <PredictiveTrafficAlertPanel />

      {/* Alerts Feed */}
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-800 text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <div className="font-semibold text-white">All Clear</div>
            <p className="text-xs text-slate-500 mt-1">No active critical mobility warnings at this moment.</p>
          </div>
        ) : (
          alerts.map((alert: any) => (
            <div
              key={alert.id}
              className={`p-4 sm:p-5 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                alert.read ? 'bg-slate-950/40 border-slate-800/80 opacity-60' : 'glass-panel border-cyan-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 flex-shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                    <StatusBadge status={alert.severity || 'warning'} />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                  <div className="text-[10px] text-slate-500 font-mono mt-2">
                    Category: {alert.category} • Broadcasted to Citizens
                  </div>
                </div>
              </div>

              {!alert.read && (
                <button
                  onClick={() => cityStore.markAlertRead(alert.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
                  title="Mark as Read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
