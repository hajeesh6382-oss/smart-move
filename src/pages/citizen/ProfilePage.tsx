// SMARTMOVE Citizen Profile & Preferences Page

import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LanguageSwitcher } from '../../components/ui/LanguageSwitcher';
import { User, Globe, Route, Mic, ShieldCheck, LogOut, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [transportPref, setTransportPref] = useState(user?.preferred_transport || 'balanced');
  const [voicePref, setVoicePref] = useState(user?.voice_enabled ?? true);
  const [savedNote, setSavedNote] = useState(false);

  const handleSave = () => {
    updateProfile({
      preferred_transport: transportPref,
      voice_enabled: voicePref,
    });
    setSavedNote(true);
    setTimeout(() => setSavedNote(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <h2 className="text-2xl font-black font-display text-white">Citizen Profile & Settings</h2>
        <button
          onClick={() => signOut()}
          className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold hover:bg-rose-500/25 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

      {savedNote && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Preferences updated successfully.
        </div>
      )}

      {/* User Info Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-2xl font-display font-black flex items-center justify-center">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-display">{user?.full_name || 'Citizen User'}</h3>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-mono uppercase font-bold">
                {user?.role || 'Citizen'}
              </span>
              <span className="text-[11px] text-slate-500">Verified Supabase Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Smart Mobility Preferences
        </h3>

        {/* Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-cyan-400" /> Preferred Regional Language
          </label>
          <LanguageSwitcher />
        </div>

        {/* Preferred Routing Strategy */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
            <Route className="w-4 h-4 text-cyan-400" /> Default Routing Optimization Goal
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'fastest', label: '⚡ Fastest ETA' },
              { id: 'eco', label: '🌱 Lowest CO₂' },
              { id: 'balanced', label: '⚖️ Balanced' },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTransportPref(opt.id)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  transportPref === opt.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Assistant Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-xs font-semibold text-white">Voice Output & Spoken Replies</div>
              <div className="text-[11px] text-slate-400">Speak AI insights aloud in selected regional accent</div>
            </div>
          </div>
          <input
            type="checkbox"
            checked={voicePref}
            onChange={(e) => setVoicePref(e.target.checked)}
            className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};
