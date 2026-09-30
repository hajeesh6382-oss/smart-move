// SMARTMOVE Language Switcher Component
// Enables instant switching between 10 Indian regional languages and persists preference

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false, className = '' }) => {
  const { i18n } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('smartmove_language', code);
    if (user) {
      updateProfile({ preferred_language: code });
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 text-blue-950 text-xs font-semibold transition-all cursor-pointer shadow-sm"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600" />
        <span className="font-bold text-blue-950">{currentLang.nativeName}</span>
        {!compact && <span className="text-blue-700 text-[11px]">({currentLang.name})</span>}
        <ChevronDown className="w-3 h-3 text-blue-600 ml-0.5" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto z-50 rounded-2xl bg-white border border-blue-200 shadow-2xl p-1.5 divide-y divide-blue-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-blue-900">
              Select Regional Language (10)
            </div>
            <div className="py-1">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelect(lang.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 text-blue-950 font-bold border border-blue-300'
                        : 'text-blue-950 hover:bg-blue-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-blue-950">{lang.nativeName}</div>
                      <div className="text-[10px] text-blue-700">{lang.name}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
