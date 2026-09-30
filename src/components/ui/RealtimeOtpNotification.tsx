// SMARTMOVE Real-Time OTP Live Notification Banner & Auto-Fill Toast
// Automatically displays when a 6-digit OTP is generated/streamed from Supabase PostgreSQL database
// Provides 1-click Copy, 1-click Auto-Fill, and Web Audio notification chime

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, Check, X, Sparkles, Smartphone, KeyRound, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

interface OtpPayload {
  recipient: string;
  otpCode: string;
  channel: string;
  expiresAt: string;
}

export const RealtimeOtpNotification: React.FC = () => {
  const [activeOtp, setActiveOtp] = useState<OtpPayload | null>(null);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  // Play subtle futuristic chime via Web Audio API (Zero external assets needed)
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio autoplay policy might restrict; silent fail is expected
    }
  };

  useEffect(() => {
    // Check if active OTP in sessionStorage
    try {
      const stored = sessionStorage.getItem('smartmove_active_realtime_otp');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (new Date(parsed.expires_at) > new Date() && parsed.status === 'pending') {
          setActiveOtp({
            recipient: parsed.recipient,
            otpCode: parsed.otp_code,
            channel: parsed.channel || 'sms',
            expiresAt: parsed.expires_at,
          });
          setVisible(true);
        }
      }
    } catch (e) {
      // ignore
    }

    // Listen to global SMARTMOVE_REALTIME_OTP event
    const handleOtpEvent = (e: any) => {
      if (e.detail && e.detail.otpCode) {
        setActiveOtp(e.detail);
        setVisible(true);
        setCopied(false);
        playChime();
      }
    };

    window.addEventListener('SMARTMOVE_REALTIME_OTP', handleOtpEvent);
    return () => {
      window.removeEventListener('SMARTMOVE_REALTIME_OTP', handleOtpEvent);
    };
  }, []);

  if (!visible || !activeOtp) return null;

  const handleCopy = () => {
    if (!activeOtp) return;
    navigator.clipboard.writeText(activeOtp.otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleAutoFill = () => {
    if (!activeOtp) return;
    window.dispatchEvent(
      new CustomEvent('SMARTMOVE_AUTOFILL_OTP', {
        detail: { otpCode: activeOtp.otpCode },
      })
    );
  };

  return (
    <aside
      aria-label="Real-time security OTP toast"
      className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-bounce-subtle select-none shadow-2xl transition-all"
    >
      <div className="relative rounded-2xl p-4 bg-slate-950/95 border border-cyan-500/50 shadow-[0_0_35px_rgba(6,182,212,0.35)] backdrop-blur-xl text-white overflow-hidden">
        {/* Glowing Top Laser Beam */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        {/* Header */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                Real-Time OTP Dispatched
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-slate-500" />
                {activeOtp.recipient}
              </div>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6-Digit Code Presentation */}
        <div className="my-3 text-center">
          <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider mb-1">
            Verification Passcode
          </div>
          <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 shadow-inner">
            {activeOtp.otpCode.split('').map((digit, idx) => (
              <span
                key={idx}
                className="w-7 h-9 flex items-center justify-center text-lg font-black font-mono text-emerald-400 bg-slate-950 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              >
                {digit}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Code</span>
              </>
            )}
          </button>

          {location.pathname.includes('/auth/verify-otp') && (
            <button
              onClick={handleAutoFill}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Auto-Fill</span>
            </button>
          )}
        </div>

        {/* Expiry footer */}
        <div className="mt-2.5 text-center text-[10px] font-mono text-slate-500">
          Valid for 10 minutes • Powered by Supabase Realtime
        </div>
      </div>
    </aside>
  );
};
