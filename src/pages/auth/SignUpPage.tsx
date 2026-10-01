// SMARTMOVE Sign Up Page with Firebase Authentication
// Supports Name, Phone Number, Email, Password, and Phone SMS OTP Verification

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { GlobalVoiceNarrator } from '../../components/ui/GlobalVoiceNarrator';
import { SmartMoveLogo } from '../../components/ui/SmartMoveLogo';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
];

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, sendPhoneOtp, loading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [rawPhone, setRawPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    const cleanNum = rawPhone.replace(/\D/g, '');
    const fullPhone = cleanNum ? `${countryCode}${cleanNum}` : undefined;

    setIsSubmitting(true);
    try {
      if (fullPhone) {
        sessionStorage.setItem('smartmove_pending_name', fullName);
        const res = await sendPhoneOtp(fullPhone, 'recaptcha-container');
        if (res.success) {
          navigate('/auth/verify-otp');
          return;
        }
      }

      const res = await signUp(email, password, fullName, 'en', fullPhone);
      if (res.success) {
        navigate('/app');
      } else {
        setErrorMsg(res.error || 'Failed to create account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-blue-950 flex flex-col justify-center items-center p-4 selection:bg-blue-500/20 selection:text-blue-900">
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="cursor-pointer">
          <SmartMoveLogo size="md" />
        </Link>
        <div className="flex items-center gap-2">
          <GlobalVoiceNarrator />
          <LanguageSwitcher compact />
        </div>
      </div>

      <div className="w-full max-w-md bg-white p-6 sm:p-8 rounded-3xl border border-blue-200 shadow-2xl shadow-blue-500/10 relative mt-16">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black font-display text-blue-950 tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-blue-900 font-medium mt-1">
            Join SMARTMOVE AI Urban Mobility Ecosystem
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 mb-4 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-950 font-display block">Full Name</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Aditi Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-blue-950 placeholder:text-blue-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                required
              />
              <User className="w-4 h-4 text-blue-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Mobile Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-950 font-display block">Mobile Number (For SMS OTP)</label>
            <div className="flex items-center gap-2">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-white border border-blue-200 rounded-2xl px-2.5 py-2.5 text-xs font-mono font-bold text-blue-950 focus:border-blue-600 focus:outline-none cursor-pointer"
              >
                {COUNTRY_CODES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>

              <div className="relative flex-1">
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={rawPhone}
                  onChange={(e) => setRawPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-2.5 text-sm font-mono font-semibold text-blue-950 placeholder:text-blue-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                  maxLength={10}
                  required
                />
                <Phone className="w-4 h-4 text-blue-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-950 font-display block">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="aditi@smartmove.city"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-blue-950 placeholder:text-blue-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                required
              />
              <Mail className="w-4 h-4 text-blue-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-950 font-display block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-blue-950 placeholder:text-blue-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-blue-400 hover:text-blue-700 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-blue-950 font-display block">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-white border border-blue-200 rounded-2xl px-4 py-2.5 text-sm font-medium text-blue-950 placeholder:text-blue-300 focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Invisible reCAPTCHA container */}
          <div id="recaptcha-container" />

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account & Verify <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-blue-800 mt-5 pt-4 border-t border-blue-100 flex flex-col gap-2">
          <div>
            Already have a Citizen account?{' '}
            <Link to="/auth/signin" className="font-bold text-blue-600 hover:underline">
              Citizen Sign In
            </Link>
          </div>
          <div>
            City Authority Official?{' '}
            <Link to="/auth/admin-signup" className="font-bold text-indigo-600 hover:underline">
              Register Authority Account (Email OTP) ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
