// SMARTMOVE Official Admin & City Authority Sign-In Portal
// Requires Official Authority Email & Secure Email OTP Verification

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SmartMoveLogo } from '../../components/ui/SmartMoveLogo';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { GlobalVoiceNarrator } from '../../components/ui/GlobalVoiceNarrator';
import { realtimeOtpService } from '../../services/realtimeOtpService';
import { useTranslation } from 'react-i18next';
import {
  Shield,
  Mail,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';

export const AdminSignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid official authority email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      sessionStorage.setItem('smartmove_pending_role', 'admin');
      sessionStorage.setItem('smartmove_pending_recipient', cleanEmail);
      sessionStorage.setItem('smartmove_pending_email', cleanEmail);
      sessionStorage.setItem('smartmove_pending_name', 'City Transit Official');

      // Dispatch real-time 6-digit OTP to the admin's email
      const res = await realtimeOtpService.generateAndSendOtp(cleanEmail, 'email');
      if (res.success) {
        navigate('/auth/verify-otp');
      } else {
        setErrorMsg(res.error || 'Failed to dispatch email verification code. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with authentication server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-indigo-500/20 selection:text-indigo-300 relative overflow-hidden">
      {/* Background Command Center Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <div className="absolute top-6 left-6 right-6 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="cursor-pointer">
          <SmartMoveLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <GlobalVoiceNarrator />
          <LanguageSwitcher compact />
        </div>
      </div>

      <div className="w-full max-w-md bg-slate-900/80 p-6 sm:p-8 rounded-3xl border border-indigo-500/40 shadow-[0_0_50px_rgba(79,70,229,0.2)] backdrop-blur-2xl relative mt-16 z-10">
        {/* Authority Badge */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_20px_rgba(99,102,241,0.25)]">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-display text-white tracking-tight">
            City Authority Sign In
          </h2>
          <p className="text-xs text-indigo-300/80 font-medium mt-1">
            Urban Transit & Traffic Control Center Access
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Strict Email OTP Verification Required
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2 mb-4 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Official Authority Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="officer@transport.gov.in or admin@smartmove.city"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none transition-colors"
                required
                autoFocus
              />
              <Mail className="w-4 h-4 text-indigo-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              A 6-digit confirmation code will be dispatched to this email address.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-600 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-black text-sm shadow-[0_0_25px_rgba(79,70,229,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Dispatching Email OTP...
              </>
            ) : (
              <>
                SEND EMAIL OTP <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill for Authority Official */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => setEmail('admin@smartmove.city')}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 underline font-mono cursor-pointer"
          >
            Fill Demo Officer Email (admin@smartmove.city)
          </button>
        </div>

        {/* Navigation Switchers */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-2 text-center text-xs">
          <Link
            to="/auth/admin-signup"
            className="text-indigo-300 hover:text-white font-semibold transition-colors"
          >
            New Transit Official? Register Official Authority ➔
          </Link>
          <Link
            to="/auth/signin"
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            Looking for Commuter Portal? Citizen Sign In ➔
          </Link>
        </div>
      </div>
    </div>
  );
};
