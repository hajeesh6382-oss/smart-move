// SMARTMOVE System Settings Modal
// Implements Dark and Light Mode, Multilingual Language Settings, and Voice Recognition Language selection

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import {
  Settings,
  X,
  Sun,
  Moon,
  Globe,
  Mic,
  Volume2,
  Check,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();

  // 1. Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartmove_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return document.body.classList.contains('light-theme') ? 'light' : 'dark';
    }
    return 'dark';
  });

  // 2. Language State
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');

  // 3. Voice Recognition Language State
  const [voiceLang, setVoiceLang] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smartmove_stt_lang') || 'ta-IN';
    }
    return 'ta-IN';
  });

  // Apply Theme Mode
  const applyTheme = (mode: 'dark' | 'light') => {
    setTheme(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartmove_theme', mode);
      if (mode === 'light') {
        document.body.classList.add('light-theme');
        document.documentElement.classList.remove('dark');
      } else {
        document.body.classList.remove('light-theme');
        document.documentElement.classList.add('dark');
      }
      window.dispatchEvent(new CustomEvent('SMARTMOVE_THEME_CHANGED', { detail: { theme: mode } }));
    }
  };

  // Change App Language
  const handleLanguageChange = (langCode: string) => {
    setCurrentLang(langCode);
    i18n.changeLanguage(langCode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('i18nextLng', langCode);
      window.dispatchEvent(new CustomEvent('SMARTMOVE_LANG_CHANGED', { detail: { lang: langCode } }));
    }
  };

  // Change Voice Recognition Language
  const handleVoiceLangChange = (bcp47Code: string) => {
    setVoiceLang(bcp47Code);
    if (typeof window !== 'undefined') {
      localStorage.setItem('smartmove_stt_lang', bcp47Code);
      window.dispatchEvent(
        new CustomEvent('SMARTMOVE_STT_LANG_CHANGED', { detail: { bcp47: bcp47Code } })
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-black font-display text-blue-950">
                System & Regional Settings
              </h3>
              <p className="text-xs text-slate-500">
                Theme, App Language, and Voice Recognition controls
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* SECTION 1: THEME MODE (DARK & LIGHT) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-blue-700 tracking-wider">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Theme Mode (Dark / Light)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Light Mode Card */}
              <button
                type="button"
                onClick={() => applyTheme('light')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
                  theme === 'light'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-md shadow-blue-500/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>Light Mode</span>
                    {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Clean crisp white interface with high contrast
                  </p>
                </div>
              </button>

              {/* Dark Mode Card */}
              <button
                type="button"
                onClick={() => applyTheme('dark')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-left ${
                  theme === 'dark'
                    ? 'border-blue-600 bg-slate-900 text-white shadow-md shadow-slate-900/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-cyan-300 flex items-center justify-center shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center justify-between">
                    <span>Dark Mode</span>
                    {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Deep AMOLED dark space with glowing neon accents
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* SECTION 2: APPLICATION LANGUAGE SETTINGS */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-blue-700 tracking-wider">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>Application Language Settings</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">10 Languages</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLang.toLowerCase().startsWith(lang.code.toLowerCase());
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/25 font-bold'
                        : 'border-slate-200 bg-slate-50 hover:bg-blue-50/50 text-slate-800 hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-mono opacity-80">{lang.code}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="mt-1">
                      <div className="text-sm font-bold">{lang.nativeName}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                        {lang.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: VOICE RECOGNITION LANGUAGE */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-blue-700 tracking-wider">
              <Mic className="w-4 h-4 text-rose-500" />
              <span>Voice Recognition Language (STT)</span>
            </div>
            <p className="text-xs text-slate-600">
              Select the spoken dialect and accent used when speaking queries to the SMARTMOVE Gemini Assistant:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { bcp: 'ta-IN', label: 'தமிழ் (Tamil - India)', sub: 'வணக்கம், பேருந்து வருகை' },
                { bcp: 'en-IN', label: 'English (Indian Accent)', sub: 'When will Bus 102 arrive?' },
                { bcp: 'hi-IN', label: 'हिन्दी (Hindi - India)', sub: 'नमस्ते, कॉलेज रोड का ट्रैफिक' },
                { bcp: 'te-IN', label: 'తెలుగు (Telugu - India)', sub: 'బస్సు షెడ్యూల్ మరియు టోల్' },
                { bcp: 'kn-IN', label: 'ಕನ್ನಡ (Kannada - India)', sub: 'ಸಂಚಾರ ದಟ್ಟಣೆ ಮಾಹಿತಿ' },
                { bcp: 'ml-IN', label: 'മലയാളം (Malayalam - India)', sub: 'ബസ് സമയം അറിയുക' },
              ].map((v) => {
                const isSelected = voiceLang === v.bcp;
                return (
                  <button
                    key={v.bcp}
                    type="button"
                    onClick={() => handleVoiceLangChange(v.bcp)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/80 text-rose-950 font-bold shadow-sm'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{v.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{v.sub}</div>
                    </div>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">Changes apply instantaneously across all pages.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition-all shadow-md shadow-blue-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
