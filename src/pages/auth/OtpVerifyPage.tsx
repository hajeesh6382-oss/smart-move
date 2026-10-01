// SMARTMOVE Real-Time OTP Verification Portal
// Backed by live Supabase PostgreSQL 'realtime_otps' with instant WebSocket streaming
// Individual 6-digit input boxes, Auto-Fill, 1-Click Verify, and live Database Stream Monitor

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { SmartMoveLogo } from '../../components/ui/SmartMoveLogo';
import { realtimeOtpService, RealtimeOtpRecord } from '../../services/realtimeOtpService';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  Copy,
  Check,
  Radio,
  Zap,
  Sparkles,
} from 'lucide-react';

export const OtpVerifyPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    pendingPhoneNumber,
    pendingOtpEmail,
    verifyPhoneOtp,
    verifyOtp,
    resendOtp,
    cancelOtp,
    loading,
    isAdmin,
  } = useAuth();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(30);
  const [resending, setResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [liveDbOtp, setLiveDbOtp] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(true);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const targetRecipient =
    pendingPhoneNumber ||
    pendingOtpEmail ||
    sessionStorage.getItem('smartmove_pending_recipient') ||
    '+91 98401 23456';

  // Format phone / email with privacy mask
  const formatMaskedRecipient = (str: string) => {
    if (str.includes('@')) {
      const [user, domain] = str.split('@');
      const masked = user.length > 2 ? `${user.slice(0, 2)}••••` : user;
      return `${masked}@${domain}`;
    }
    if (str.startsWith('+')) {
      const country = str.slice(0, 3);
      const rest = str.slice(3);
      if (rest.length >= 7) {
        return `${country} ${rest.slice(0, 3)} •••• ${rest.slice(-2)}`;
      }
    }
    return str;
  };

  // 30-Second Countdown Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Load and subscribe to real-time OTPs from Supabase Database
  useEffect(() => {
    // 1. Fetch latest pending OTP from DB
    realtimeOtpService.getLatestOtp(targetRecipient).then((rec) => {
      if (rec && rec.otp_code) {
        setLiveDbOtp(rec.otp_code);
      }
    });

    // 2. Subscribe to live stream for this recipient
    const unsubscribe = realtimeOtpService.subscribeToRecipientOtp(
      targetRecipient,
      (newCode) => {
        setLiveDbOtp(newCode);
        setIsDbConnected(true);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [targetRecipient]);

  // Helper to fill the 6 boxes
  const fillOtpDigits = (code: string) => {
    const clean = code.trim().replace(/\D/g, '').slice(0, 6);
    if (clean.length === 6) {
      setOtp(clean.split(''));
      setErrorMsg(null);
      inputRefs.current[5]?.focus();
    }
  };

  // Handle Box Digit Change & Paste
  const handleChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');

    // Handle full paste
    if (cleanValue.length > 1) {
      fillOtpDigits(cleanValue);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto-advance focus to next digit box
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Execute verification
  const executeVerificationWithCode = async (token: string) => {
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      setErrorMsg('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = pendingPhoneNumber ? await verifyPhoneOtp(token) : await verifyOtp(token);

      if (res.success) {
        setSuccessMsg('✓ Verified successfully! Initializing SMARTMOVE session...');
        setTimeout(() => {
          if (isAdmin) {
            navigate('/admin');
          } else {
            navigate('/app');
          }
        }, 800);
      } else {
        setErrorMsg(res.error || 'Invalid verification code. Please check the real-time code and try again.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('').trim();
    await executeVerificationWithCode(token);
  };

  // 1-Click Auto Fill and Verify from live database code
  const handleAutoFillAndVerify = async () => {
    if (!liveDbOtp) return;
    fillOtpDigits(liveDbOtp);
    await executeVerificationWithCode(liveDbOtp);
  };

  // Handle Resend with 30s cooldown
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setResending(true);

    try {
      const res = await resendOtp();
      if (res.success) {
        setSuccessMsg('⚡ Fresh real-time OTP dispatched and synced to database.');
        setCountdown(30);
      } else {
        setErrorMsg(res.error || 'Failed to dispatch verification code. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  const handleCopyLiveCode = () => {
    if (!liveDbOtp) return;
    navigator.clipboard.writeText(liveDbOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500/20 selection:text-cyan-200 relative overflow-hidden">
      {/* Background Ambient Glow Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="absolute top-6 left-6 right-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="cursor-pointer">
          <SmartMoveLogo size="md" />
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-Time Database Active</span>
        </div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/75 border border-slate-700/60 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl relative mt-16 z-10">
        {/* Glow Header Icon */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight">
            Security Verification
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Real-time Gmail verification code dispatched to{' '}
            <strong className="text-cyan-300 font-mono font-bold">
              {formatMaskedRecipient(targetRecipient)}
            </strong>
          </p>
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 mb-4 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2 mb-4 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6-DIGIT INDIVIDUAL BOX INPUTS */}
          <div className="flex items-center justify-center gap-2 sm:gap-2.5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                autoFocus={idx === 0}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-mono font-black bg-slate-950/80 border-2 border-slate-700/80 rounded-2xl text-white focus:border-cyan-400 focus:bg-slate-900 focus:outline-none focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all focus:scale-105"
              />
            ))}
          </div>

          {/* VERIFY BUTTON */}
          <button
            type="submit"
            disabled={isVerifying || loading || otp.join('').length !== 6}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:opacity-50 text-slate-950 font-black text-sm shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                Validating with Database...
              </>
            ) : (
              <>
                VERIFY &amp; ACCESS SMARTMOVE <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* RESEND OTP SECTION WITH COUNTDOWN */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col items-center justify-center gap-2 text-xs">
          {countdown > 0 ? (
            <div className="text-slate-400 font-mono font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Resend code in <strong className="text-slate-200">{countdown}s</strong>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  Generating new real-time code...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> RESEND REAL-TIME OTP
                </>
              )}
            </button>
          )}

          <div className="pt-2">
            <Link
              to="/auth/signin"
              onClick={cancelOtp}
              className="text-slate-400 hover:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Change phone number or sign in method
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
