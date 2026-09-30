// SMARTMOVE Real-Time Notification Center Drawer
// Displays timestamped alerts, severity categories, unread counts, and mark-as-read controls

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { cityStore } from '../../lib/supabase/mockStore';
import {
  Bell,
  X,
  CheckCheck,
  AlertTriangle,
  Info,
  ShieldAlert,
  Flame,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { data: alerts } = useRealtimeTable('alerts');

  if (!isOpen) return null;

  const unreadCount = alerts.filter((a) => !a.read).length;

  const handleMarkAllRead = () => {
    alerts.forEach((a) => {
      if (!a.read) cityStore.markAlertRead(a.id);
    });
  };

  const handleMarkRead = (id: string) => {
    cityStore.markAlertRead(id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-blue-200 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black font-display text-blue-950">Live Mobility Alerts</h3>
                <p className="text-xs text-blue-700 font-medium">
                  {unreadCount > 0 ? `${unreadCount} unread incident notifications` : 'All alerts up to date'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[11px] font-mono text-blue-800 border border-blue-200 flex items-center gap-1 cursor-pointer font-bold"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Read All
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-blue-50 text-blue-700 hover:text-blue-950 hover:bg-blue-100 border border-blue-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-blue-50">
            {alerts.length === 0 ? (
              <div className="text-center py-16 text-blue-800 space-y-2">
                <Bell className="w-10 h-10 mx-auto text-blue-300 stroke-1" />
                <p className="text-xs font-mono font-bold text-blue-950">No active notifications.</p>
                <p className="text-[11px] text-blue-700">The city network is operating within baseline parameters.</p>
              </div>
            ) : (
              alerts.map((alert) => {
                const isCritical = alert.severity === 'critical' || alert.severity === 'severe';
                const isWarning = alert.severity === 'warning';

                return (
                  <div
                    key={alert.id}
                    onClick={() => handleMarkRead(alert.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      !alert.read
                        ? isCritical
                          ? 'bg-rose-50 border-rose-200'
                          : isWarning
                          ? 'bg-amber-50 border-amber-200'
                          : 'bg-blue-50 border-blue-200'
                        : 'bg-white border-blue-100 opacity-80 hover:opacity-100 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                            isCritical
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        {!alert.read && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
                      </div>
                      <span className="text-[10px] font-mono text-blue-700 font-medium">
                        {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-blue-950 mt-1.5 font-display">{alert.title}</h4>
                    <p className="text-[11px] text-blue-800 mt-1 leading-relaxed">{alert.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer status */}
          <div className="p-4 border-t border-blue-100 bg-blue-50/50 text-[11px] font-mono text-blue-800 flex items-center justify-between font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              SMARTMOVE Real-Time Synced
            </span>
            <span className="text-blue-700 font-bold">Auto-Purging</span>
          </div>
        </div>
      </div>
    </div>
  );
};
