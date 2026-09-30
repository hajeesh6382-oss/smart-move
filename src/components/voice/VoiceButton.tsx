// SMARTMOVE Floating Voice & Mic Assistant Button
// Features live audio wave animation, speech recognition toggle, and transcript preview

import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Square, Sparkles } from 'lucide-react';
import { voiceService } from '../../lib/ai/voiceAssistant';
import { useTranslation } from 'react-i18next';

interface VoiceButtonProps {
  onTranscriptReceived?: (transcript: string) => void;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ onTranscriptReceived, className = '' }) => {
  const { i18n } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      setErrorMessage(null);
      setIsListening(true);
      setLiveTranscript('Listening in ' + i18n.language.toUpperCase() + '...');

      voiceService.startListening(
        i18n.language,
        (text, isFinal) => {
          setLiveTranscript(text);
          if (isFinal) {
            setIsListening(false);
            if (onTranscriptReceived) {
              onTranscriptReceived(text);
            }
          }
        },
        (err) => {
          setErrorMessage(err);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Active Listening Floating Transcript Toast */}
      {isListening && (
        <div className="absolute bottom-14 right-0 z-50 p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 backdrop-blur-xl shadow-2xl min-w-[260px] max-w-sm animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Listening ({i18n.language.toUpperCase()})
            </span>
            <button
              onClick={() => {
                voiceService.stopListening();
                setIsListening(false);
              }}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-white font-medium italic">
            "{liveTranscript || 'Speak a command (e.g. Traffic near College Road, Bus 102 status, Find parking)...'}"
          </p>

          {/* Soundwave animation */}
          <div className="flex items-center justify-center gap-1 mt-2.5 h-3">
            <span className="w-1 bg-cyan-400 rounded-full h-full animate-pulse" />
            <span className="w-1 bg-cyan-400 rounded-full h-2/3 animate-pulse delay-75" />
            <span className="w-1 bg-cyan-400 rounded-full h-full animate-pulse delay-150" />
            <span className="w-1 bg-cyan-400 rounded-full h-1/2 animate-pulse delay-200" />
            <span className="w-1 bg-cyan-400 rounded-full h-full animate-pulse delay-300" />
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="absolute bottom-14 right-0 z-50 p-2.5 rounded-xl bg-rose-950/95 border border-rose-500/50 text-[11px] text-rose-200 shadow-xl max-w-xs animate-in fade-in">
          {errorMessage}
          <button onClick={() => setErrorMessage(null)} className="ml-2 font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={toggleListening}
        className={`p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer ${
          isListening
            ? 'bg-rose-500 text-white shadow-rose-500/40 scale-110 animate-pulse'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 hover:scale-105'
        }`}
        title="Activate Multilingual Voice Assistant"
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    </div>
  );
};
