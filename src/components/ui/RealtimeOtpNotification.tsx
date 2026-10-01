// SMARTMOVE Real-Time OTP Live Notification Banner
// Dispatches delivery confirmation without exposing or auto-filling OTP on screen
import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Smartphone, Mail } from 'lucide-react';

interface OtpPayload {
  recipient: string;
  channel: string;
  expiresAt: string;
}

export const RealtimeOtpNotification: React.FC = () => {
  const [activeOtp, setActiveOtp] = useState<OtpPayload | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Listen to global SMARTMOVE_REALTIME_OTP event
    const handleOtpEvent = (e: any) => {
      if (e.detail && e.detail.recipient) {
        setActiveOtp({
          recipient: e.detail.recipient,
          channel: e.detail.channel || 'sms',
          expiresAt: e.detail.expiresAt,
        });
        setVisible(true);
      }
    };

    window.addEventListener('SMARTMOVE_REALTIME_OTP', handleOtpEvent);
    return () => {
      window.removeEventListener('SMARTMOVE_REALTIME_OTP', handleOtpEvent);
    };
  }, []);

  if (!visible || !activeOtp) return null;

  return (
    <aside
      aria-label="Real-time security OTP toast"
      className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 select-none shadow-2xl transition-all"
    >
      <div className="relative rounded-2xl p-4 bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-xl text-white overflow-hidden">
        {/* Glowing Top Laser Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                Passcode Dispatched
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                {activeOtp.recipient.includes('@') ? (
                  <Mail className="w-3 h-3 text-cyan-400" />
                ) : (
                  <Smartphone className="w-3 h-3 text-emerald-400" />
                )}
                {activeOtp.recipient}
              </div>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Message */}
        <div className="my-2.5 text-left text-xs text-slate-300">
          A secure 6-digit verification code has been dispatched. Please check your{' '}
          <strong className="text-cyan-400">
            {activeOtp.recipient.includes('@') ? 'Email inbox' : 'Mobile SMS'}
          </strong>{' '}
          and enter the code manually.
        </div>

        {/* Expiry footer */}
        <div className="text-center text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/60">
          Valid for 10 minutes • Zero Auto-Fill for Security
        </div>
      </div>
    </aside>
  );
};
