import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  Send,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Shield,
  Compass,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock,
  Navigation,
} from 'lucide-react';
import { trafficAlertService, TrafficAlertRecord } from '../../services/trafficAlertService';
import { useAuth } from '../../hooks/useAuth';

interface PredictiveTrafficAlertPanelProps {
  corridorName?: string;
  roadName?: string;
  congestionLevel?: number;
  expectedDelayMin?: number;
  compact?: boolean;
}

export const PredictiveTrafficAlertPanel: React.FC<PredictiveTrafficAlertPanelProps> = ({
  corridorName = 'Theni Highway Gantry (NH-85)',
  roadName = 'Madurai - Theni Expressway',
  congestionLevel = 84,
  expectedDelayMin = 22,
  compact = false,
}) => {
  const { user, isAdmin } = useAuth();

  const [adminEmail, setAdminEmail] = useState(() => trafficAlertService.getAdminAlertEmail());
  const [userEmail, setUserEmail] = useState(() => user?.email || 'citizen@smartmove.city');
  const [autoAlertEnabled, setAutoAlertEnabled] = useState(() => trafficAlertService.isAutoAlertEnabled());
  const [selectedCorridor, setSelectedCorridor] = useState(corridorName);
  const [selectedCongestion, setSelectedCongestion] = useState(congestionLevel);

  const [isSending, setIsSending] = useState(false);
  const [alertStatus, setAlertStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [recentLogs, setRecentLogs] = useState<TrafficAlertRecord[]>(() => trafficAlertService.getAlertsLog());

  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user]);

  const handleToggleAutoAlert = () => {
    const next = !autoAlertEnabled;
    setAutoAlertEnabled(next);
    trafficAlertService.setAutoAlertEnabled(next);
  };

  const handleUpdateAdminEmail = (newEmail: string) => {
    setAdminEmail(newEmail);
    trafficAlertService.setAdminAlertEmail(newEmail);
  };

  const handleSendAlert = async () => {
    setIsSending(true);
    setAlertStatus(null);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smart-move-yg21.vercel.app';
    const navigateUrl = `${baseUrl}/routes?from=Theni&to=Madurai`;

    const altRoute = selectedCorridor.includes('Theni')
      ? 'Periyakulam Bypass (Route 2 via NH-44)'
      : selectedCorridor.includes('Periyakulam')
      ? 'Theni Old Bypass Arterial'
      : 'Madurai Outer Ring Road (Service Lane)';

    const res = await trafficAlertService.dispatchHighTrafficAlert({
      recipients: [adminEmail, userEmail].filter(Boolean),
      corridorName: selectedCorridor,
      roadName,
      congestionLevel: selectedCongestion,
      expectedDelayMin,
      predictedHorizon: 'Next 15–30 minutes',
      alternativeRoute: altRoute,
      timeSavedMin: 18,
      transitAlternative: 'Theni Express Bus 101 (Dedicated Priority Lane)',
      navigateUrl,
    });

    setIsSending(false);
    setAlertStatus(res);
    setRecentLogs(trafficAlertService.getAlertsLog());

    setTimeout(() => {
      setAlertStatus(null);
    }, 6000);
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-slate-950 via-[#0e1626] to-[#1c1214] text-white space-y-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shadow-inner">
            <Bell className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-400 tracking-wider">
                Predictive Traffic Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold border border-rose-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                GMAIL ALERTS ACTIVE
              </span>
            </div>
            <h3 className="text-xl font-black font-display text-white mt-0.5">
              High-Traffic Predictive Gmail Alert & Re-routing Advisory
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Dispatches predictive high congestion warnings directly to <strong>User</strong> and <strong>Admin</strong> Gmail inboxes with AI alternative routes and direct 1-click website navigation.
            </p>
          </div>
        </div>

        {/* Auto Dispatch Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-300 font-mono">Auto Alert (&ge;70%):</span>
          <button
            type="button"
            onClick={handleToggleAutoAlert}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              autoAlertEnabled
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {autoAlertEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Recipient Inboxes & Settings Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* User Recipient */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <Mail className="w-3.5 h-3.5" />
              <span>User / Commuter Gmail:</span>
            </span>
            <span className="text-[10px] text-emerald-400">● Active Recipient</span>
          </div>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
            placeholder="citizen@smartmove.city or personal email"
          />
          <p className="text-[11px] text-slate-500 font-sans">
            Receives re-routing suggestions, time saved, and 1-click website navigation link.
          </p>
        </div>

        {/* Admin Recipient */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300 font-bold">
              <Shield className="w-3.5 h-3.5" />
              <span>City Admin & Authority Gmail:</span>
            </span>
            <span className="text-[10px] text-amber-400">● Authority Inbox</span>
          </div>
          <input
            type="email"
            value={adminEmail}
            onChange={(e) => handleUpdateAdminEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-amber-400 focus:outline-none"
            placeholder="admin@smartmove.city or hajeesh6382@gmail.com"
          />
          <p className="text-[11px] text-slate-500 font-sans">
            Receives corridor telemetry, toll status, and green wave dispatch recommendations.
          </p>
        </div>
      </div>

      {/* Corridor Selection & Real-Time Prediction Preview */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-bold text-slate-300 flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>Select Corridor for High-Traffic Predictive Alert:</span>
          </div>
          <div className="flex items-center gap-2">
            {[
              { name: 'Theni Highway Gantry (NH-85)', cong: 86 },
              { name: 'Periyakulam Bypass Gantry', cong: 78 },
              { name: 'Madurai Outer Ring Gantry', cong: 82 },
            ].map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setSelectedCorridor(c.name);
                  setSelectedCongestion(c.cong);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                  selectedCorridor === c.name
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {c.name.split(' ')[0]} ({c.cong}%)
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Email Preview Details */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400">Target Corridor:</span>
            <span className="font-bold text-amber-300">{selectedCorridor}</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400">Predicted Congestion:</span>
            <span className="font-bold text-rose-400">{selectedCongestion}% (HIGH SURGE AHEAD)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400">AI Re-routing Suggestion:</span>
            <span className="text-cyan-300">Divert via Periyakulam Bypass (Saves ~18 mins)</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-slate-400">Direct Navigation Link:</span>
            <a
              href="https://smart-move-yg21.vercel.app/routes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>https://smart-move-yg21.vercel.app/routes</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Action Button & Status Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={handleSendAlert}
          disabled={isSending}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-xl shadow-red-600/30 flex items-center gap-2 transition-all cursor-pointer transform hover:scale-105 disabled:opacity-50"
        >
          {isSending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Dispatching Alert to Gmail...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>Dispatch Predictive Traffic Alert to Gmail (User & Admin)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {alertStatus && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
              alertStatus.success
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
            }`}
          >
            {alertStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{alertStatus.message}</span>
          </div>
        )}
      </div>

      {/* Dispatched Alerts History Log */}
      {recentLogs.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Recent High-Traffic Gmail Alerts Dispatched:</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {recentLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-bold">{log.corridorName}</span>
                  <span className="text-rose-400">({log.congestionLevel}% Congestion)</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>To: {log.recipients.join(', ')}</span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
