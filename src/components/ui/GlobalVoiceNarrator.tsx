import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Sparkles, StopCircle, Radio } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../../i18n';

interface GlobalVoiceNarratorProps {
  className?: string;
  defaultText?: string;
}

export const GlobalVoiceNarrator: React.FC<GlobalVoiceNarratorProps> = ({
  className = '',
  defaultText,
}) => {
  const { t, i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const getLanguageBCP47 = useCallback((langCode: string): string => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    return found?.bcp47 || 'en-IN';
  }, []);

  const speakCurrentPage = useCallback(
    (customText?: string) => {
      if (!speechSupported || typeof window === 'undefined') return;

      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();

      // Gather readable text from current page or use custom text
      let textToRead = customText || defaultText;
      if (!textToRead) {
        const titleEl = document.querySelector('h1, h2');
        const mainContentEl = document.querySelector('main, article, .glass-panel p');
        const pageTitle = titleEl?.textContent || 'SMARTMOVE Urban Mobility';
        const pageSummary = mainContentEl?.textContent || '';
        textToRead = `${pageTitle}. ${pageSummary.slice(0, 280)}`;
      }

      const langCode = i18n.language || 'en';
      const bcp47 = getLanguageBCP47(langCode);

      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = bcp47;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Match native voice if available
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langCode) ||
          v.lang.toLowerCase().replace('_', '-').startsWith(bcp47.toLowerCase())
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [isSpeaking, speechSupported, defaultText, i18n.language, getLanguageBCP47]
  );

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!speechSupported) return null;

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => speakCurrentPage()}
        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
          isSpeaking
            ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30 scale-105 animate-pulse'
            : 'bg-white hover:bg-blue-50 text-blue-900 border-blue-200 hover:border-blue-300'
        }`}
        title={`Listen to page narration in ${currentLang.nativeName} (${currentLang.name})`}
      >
        {isSpeaking ? (
          <>
            <StopCircle className="w-3.5 h-3.5 text-white" />
            <span>Narrating ({currentLang.code.toUpperCase()})</span>
            {/* Animated Audio Equalizer Bars */}
            <span className="flex items-center gap-0.5 ml-1 h-3">
              <span className="w-0.5 bg-white rounded-full h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-white rounded-full h-2/3 animate-[pulse_0.4s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-white rounded-full h-full animate-[pulse_0.8s_ease-in-out_infinite]" />
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline font-sans">Voice Narrator</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800">
              {currentLang.code.toUpperCase()}
            </span>
          </>
        )}
      </button>

      {isSpeaking && (
        <button
          type="button"
          onClick={stopSpeaking}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 text-xs transition-colors cursor-pointer"
          title="Stop Audio"
        >
          <VolumeX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
