import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { NavbarAndDrawer } from '../components/landing/NavbarAndDrawer';
import { HeroSmartCityBackdrop } from '../components/landing/HeroSmartCityBackdrop';
import { AIMobilityDrawer } from '../components/landing/AIMobilityDrawer';
import {
  Sparkles,
  ArrowRight,
  PlayCircle,
  Clock,
  MapPin,
  Coins,
  Navigation,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, signInAsDemo } = useAuth();

  // Real-time ticking hackathon demo status counter
  const [secondsAgo, setSecondsAgo] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo((prev) => (prev >= 15 ? 1 : prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLaunchCitizen = () => {
    navigate('/auth/signin');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden relative">
      {/* 1. Floating Glass Navigation Bar & Menu Drawer */}
      <NavbarAndDrawer activeSection="hero" />

      {/* 2. Full-Screen Cinematic Hero Experience */}
      <section
        id="hero"
        className="relative min-h-[calc(100vh-80px)] flex-1 w-full flex flex-col items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-12 text-center overflow-hidden"
      >
        {/* Animated Smart-City Background Map & Vehicles */}
        <HeroSmartCityBackdrop />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          {/* Hackathon Demo Live Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-6 shadow-lg shadow-cyan-950/40 backdrop-blur-xl animate-in fade-in duration-700">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              ● LIVE
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[11px]">
              Updated {secondsAgo} seconds ago
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-medium hidden sm:inline">
              Deterministic Urban Flow Engine
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black font-display tracking-tight text-white leading-[1.05] max-w-4xl drop-shadow-2xl animate-in slide-in-from-bottom-6 duration-700">
            MOVE SMARTER.{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
              LIVE BETTER.
            </span>
          </h1>

          {/* Supporting Text */}
          <p className="text-base sm:text-xl lg:text-2xl font-medium text-slate-300 max-w-3xl mt-6 leading-relaxed animate-in fade-in duration-1000">
            AI-powered urban mobility for faster journeys, smarter routes, safer roads, and greener cities.
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-3 leading-relaxed">
            Synthesizes traffic flow sensors, rapid electric transit, dynamic road pricing, and carbon offset tracking into one unified autonomous city layer.
          </p>

          {/* Primary & Secondary Hero Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-in fade-in duration-1000">
            {/* Primary CTA: PLAN YOUR JOURNEY */}
            <button
              onClick={() => {
                navigate('/auth/signin');
              }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm sm:text-base shadow-2xl shadow-cyan-500/35 hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer border border-cyan-300/40"
            >
              <span>{t('landing.planJourney', 'PLAN YOUR JOURNEY')}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Secondary CTA: EXPLORE LIVE MAP */}
            <button
              onClick={() => {
                if (user) {
                  navigate('/app/map');
                } else {
                  navigate('/auth/signin');
                }
              }}
              className="px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 font-bold text-sm sm:text-base shadow-xl backdrop-blur-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{t('nav.liveMap', 'EXPLORE LIVE MAP')}</span>
            </button>

            {/* Route & ERP Planner Button */}
            <button
              onClick={() => {
                if (user) {
                  navigate('/app/routes');
                } else {
                  navigate('/auth/signin');
                }
              }}
              className="px-6 py-4 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 border border-indigo-500/40 font-bold text-sm sm:text-base shadow-xl backdrop-blur-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4 text-indigo-400" />
              <span>{t('nav.planner', 'ROUTE PLANNER')}</span>
            </button>
          </div>

          {/* Floating Live Data Cards */}
          <div className="mt-12 w-full max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-in fade-in duration-1000">
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 text-left hover:border-cyan-400 transition-all hover:scale-105 shadow-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Traffic
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-black text-lg text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Low
              </div>
              <span className="text-[10px] text-slate-400">48 km/h arterial flow</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 text-left hover:border-cyan-400 transition-all hover:scale-105 shadow-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Travel Time
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-black text-lg text-white font-mono">
                <Clock className="w-4 h-4 text-cyan-400" />
                18 min
              </div>
              <span className="text-[10px] text-emerald-400">-6 min saved via AI</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 text-left hover:border-cyan-400 transition-all hover:scale-105 shadow-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Distance
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-black text-lg text-white font-mono">
                <MapPin className="w-4 h-4 text-cyan-400" />
                7.2 km
              </div>
              <span className="text-[10px] text-slate-400">Optimal multi-lane</span>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/30 text-left hover:border-cyan-400 transition-all hover:scale-105 shadow-xl">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Estimated Cost
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-black text-lg text-cyan-300 font-mono">
                <Coins className="w-4 h-4 text-amber-400" />
                ₹42
              </div>
              <span className="text-[10px] text-emerald-400">Dynamic ERP + fuel</span>
            </div>
          </div>
        </div>
      </section>

      {/* Floating AI Mobility Assistant (✦ AI) */}
      <AIMobilityDrawer />

      {/* Clean Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-12 border-t border-slate-900 bg-slate-950/80 backdrop-blur-xl text-xs text-slate-400 max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs">
            S
          </div>
          <div>
            <span className="font-bold text-white font-display">SMARTMOVE</span>
            <span className="text-slate-500 ml-2">© 2026 AI-Powered Urban Mobility Platform</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-400">
          <button onClick={handleLaunchCitizen} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Citizen App
          </button>
          <button onClick={() => navigate('/app/map')} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Live Map
          </button>
          <button onClick={() => navigate('/app/routes')} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Route Planner
          </button>
          <button onClick={() => navigate('/app/road-pricing')} className="hover:text-cyan-400 transition-colors cursor-pointer">
            Road Pricing
          </button>
        </div>
      </footer>
    </div>
  );
};
