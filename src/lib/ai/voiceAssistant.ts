// SMARTMOVE Multilingual Voice Assistant Service
// Implements Web Speech STT, TTS, and Fallback Speech Synthesis with Indian Accents

import { SUPPORTED_LANGUAGES } from '../../i18n';

export interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
      this.synthesis = window.speechSynthesis || null;
    }
  }

  public isSTTSupported(): boolean {
    return !!this.recognition;
  }

  public isTTSSupported(): boolean {
    return !!this.synthesis;
  }

  public startListening(
    langCode: string,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    this.recognition.lang = langObj?.bcp47 || 'en-IN';

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      onResult(final || interim, !!final);
    };

    this.recognition.onerror = (event: any) => {
      onError(event.error === 'not-allowed' ? 'Microphone access was denied. Please allow microphone permissions in browser.' : `Speech error: ${event.error}`);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition already active');
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
  }

  public speak(
    text: string,
    langCode: string,
    onStart?: () => void,
    onEnd?: () => void
  ): { hasVoice: boolean } {
    if (!this.synthesis) {
      if (onEnd) onEnd();
      return { hasVoice: false };
    }

    this.stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const langObj = SUPPORTED_LANGUAGES.find((l) => l.code === langCode);
    const targetBcp47 = langObj?.bcp47 || 'en-IN';
    utterance.lang = targetBcp47;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Try to find a matching voice for Indic languages
    const voices = this.synthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(targetBcp47.slice(0, 2)) || v.lang === targetBcp47);
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synthesis.speak(utterance);

    return { hasVoice: !!matchingVoice };
  }

  public stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.currentUtterance = null;
  }
}

export const voiceService = new VoiceService();
