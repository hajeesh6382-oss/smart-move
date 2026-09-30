// SMARTMOVE Hackathon Judge-Facing Demo Mode (12-Step Automated Simulation Centerpiece)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DEMO_STEPS, DemoStep } from '../lib/ai/demoTimeline';
import { cityStore } from '../lib/supabase/mockStore';
import { useRealtimeTable } from '../hooks/useRealtimeTable';
import { voiceService } from '../lib/ai/voiceAssistant';
import { BeforeAfterTable } from '../components/ui/BeforeAfterTable';
import { ConnectedEffectsDiagram } from '../components/ui/ConnectedEffectsDiagram';
import { SourceBadge } from '../components/ui/SourceBadge';
import { LanguageSwitcher } from '../components/ui/LanguageSwitcher';
import { LiveBadge } from '../components/ui/LiveBadge';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  FastForward,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Activity,
  Bus,
  SquareParking,
  ShieldAlert,
  Wind,
} from 'lucide-react';

export const DemoModePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: simState } = useRealtimeTable('simulation_state');
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(3); // 1x, 3x, 10x
  const [isNarrating, setIsNarrating] = useState(false);

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];

  // Auto-progression timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      const stepDuration = Math.round(6000 / speedMultiplier);
      interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < DEMO_STEPS.length - 1) {
            const nextIdx = prev + 1;
            cityStore.setDemoStep(DEMO_STEPS[nextIdx].step);
            if (nextIdx === DEMO_STEPS.length - 1) {
              // Trigger confetti celebration on completion
              try {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
              } catch (e) {}
            }
            return nextIdx;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, stepDuration);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speedMultiplier]);

  // Synchronize state on step select
  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    cityStore.setDemoStep(DEMO_STEPS[idx].step);
  };

  const handlePlayPause = () => {
    if (!isPlaying && currentStepIndex === DEMO_STEPS.length - 1) {
      setCurrentStepIndex(0);
      cityStore.setDemoStep(1);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    cityStore.setDemoStep(1);
    voiceService.stopSpeaking();
    setIsNarrating(false);
  };

  const handleNarrate = () => {
    if (isNarrating) {
      voiceService.stopSpeaking();
      setIsNarrating(false);
    } else {
      setIsNarrating(true);
      voiceService.speak(
        currentStep.narration,
        i18n.language,
        () => setIsNarrating(true),
        () => setIsNarrating(false)
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/app')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-mono font-bold text-amber-400">
                  🎬 Hackathon Showcase Centerpiece
                </span>
                <SourceBadge source="SIMULATED DATA" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
                AI Peak-Hour Congestion & Ripple Simulation
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LiveBadge />
            <LanguageSwitcher compact />
            <button
              onClick={() => navigate('/admin')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold hover:bg-slate-800 text-slate-300"
            >
              Command Center
            </button>
          </div>
        </div>

        {/* Master Demo Control Bar */}
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-[#1e1305] flex flex-wrap items-center justify-between gap-4 shadow-2xl">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30 scale-105'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
              {isPlaying ? 'Pause Simulation' : currentStepIndex === DEMO_STEPS.length - 1 ? 'Replay Simulation' : 'Run Peak-Hour Simulation'}
            </button>

            <button
              onClick={handleReset}
              className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Reset Timeline to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleNarrate}
              className={`px-4 py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isNarrating
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/30 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-cyan-500/30'
              }`}
            >
              {isNarrating ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {isNarrating ? 'Stop Voice Narration' : 'Narrate Step by Voice'}
            </button>
          </div>

          {/* Speed Multiplier Toggles */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">Speed:</span>
            {[1, 3, 10].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  speedMultiplier === spd
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* 12-Step Interactive Visual Timeline */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-bold uppercase">
              Simulation Chronology ({currentStep.time} — Step {currentStep.step} of 12)
            </span>
            <span className="text-amber-400 font-bold">{currentStep.title}</span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {DEMO_STEPS.map((s, idx) => {
              const isActive = idx === currentStepIndex;
              const isPast = idx < currentStepIndex;

              return (
                <button
                  key={s.step}
                  onClick={() => handleSelectStep(idx)}
                  className={`p-2 rounded-xl text-center border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-b from-amber-500 to-orange-600 text-slate-950 font-black border-amber-400 shadow-lg shadow-amber-500/30 scale-105 z-10'
                      : isPast
                      ? 'bg-slate-900/90 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-950/60 text-slate-600 border-slate-800/80 hover:text-slate-400'
                  }`}
                  title={`${s.time} - ${s.title}`}
                >
                  <div className="text-[10px] font-mono font-bold">{s.time}</div>
                  <div className="text-xs font-black">{s.step}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Details & Live Metrics Card */}
        <div className="glass-panel-glow p-6 rounded-3xl border border-cyan-500/30 space-y-5 bg-slate-950/90">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Simulation Clock: {currentStep.time}
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white mt-1">
                {currentStep.step}. {currentStep.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {currentStep.summary}
              </p>
            </div>

            {currentStep.step === 11 && (
              <div className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold animate-pulse">
                🧠 Coordinated Interventions Applied
              </div>
            )}
          </div>

          {/* Real-Time Metrics Bar for Current Step */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Traffic Congestion</span>
              <span className={`text-xl font-black ${currentStep.metrics.trafficCongestion > 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentStep.metrics.trafficCongestion}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Bus 102 Occupancy</span>
              <span className={`text-xl font-black ${currentStep.metrics.busOccupancy > 88 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {currentStep.metrics.busOccupancy}%
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Campus Parking</span>
              <span className={`text-xl font-black ${currentStep.metrics.parkingAvail < 15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currentStep.metrics.parkingAvail} spots
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Pedestrian Risk</span>
              <span className={`text-xl font-black ${currentStep.metrics.pedRisk > 65 ? 'text-rose-400' : 'text-amber-400'}`}>
                {currentStep.metrics.pedRisk} / 100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">CO₂ Output Rate</span>
              <span className="text-xl font-black text-purple-300">
                {currentStep.metrics.co2Kg} kg/hr
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Connected Ripple Diagram in Step */}
        <ConnectedEffectsDiagram
          trafficVolume={currentStep.stateOverrides.traffic_volume}
          collegeCongestion={currentStep.metrics.trafficCongestion}
          busOccupancy={currentStep.metrics.busOccupancy}
          parkingAvail={currentStep.metrics.parkingAvail}
          pedRisk={currentStep.metrics.pedRisk}
          co2Kg={currentStep.metrics.co2Kg}
          highlightedNodeIds={currentStep.activeNodes}
        />
      </div>
    </div>
  );
};
