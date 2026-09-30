// SMARTMOVE Urban Mobility Live Animation & Interactive Simulation Engine
// Visualizes real-time multimodal traffic flow: Electric Rapid Bus, Connected EV,
// Emergency Corridor Clearance, Dynamic ERP Gantry Scanner, and IoT Road Sensor Grid.
// 100% Blue & Dark Blue on White Aesthetic with High-Performance CSS/SVG Micro-animations.

import React, { useState, useEffect } from 'react';
import {
  Bus,
  Car,
  Siren,
  Zap,
  Activity,
  Play,
  Pause,
  Gauge,
  TrendingDown,
  Sparkles,
  Wifi,
  Coins,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface UrbanMobilityAnimationProps {
  className?: string;
  compact?: boolean;
}

export const UrbanMobilityAnimation: React.FC<UrbanMobilityAnimationProps> = ({
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [trafficMode, setTrafficMode] = useState<'smooth' | 'peak' | 'emergency'>('smooth');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [scannedToll, setScannedToll] = useState<number>(25);
  const [vehicleCount, setVehicleCount] = useState<number>(1420);
  const [gantryActive, setGantryActive] = useState<boolean>(true);

  // Periodic sensor telemetry pulse
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setVehicleCount((prev) => {
        const delta = Math.floor(Math.sin(Date.now() / 3000) * 12);
        return Math.max(900, prev + delta);
      });
      if (Math.random() > 0.6) {
        setGantryActive(true);
        setTimeout(() => setGantryActive(false), 900);
      }
    }, 2000 / simulationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, simulationSpeed]);

  const speedMultiplier = simulationSpeed === 1 ? '10s' : simulationSpeed === 2 ? '5s' : '2.5s';
  const busSpeed = simulationSpeed === 1 ? '12s' : simulationSpeed === 2 ? '6s' : '3s';
  const emergencySpeed = simulationSpeed === 1 ? '7s' : simulationSpeed === 2 ? '3.5s' : '1.8s';

  return (
    <div
      className={`glass-panel p-4 sm:p-6 rounded-3xl border-2 border-blue-200 bg-white shadow-xl shadow-blue-500/10 overflow-hidden relative ${className}`}
    >
      {/* Top Banner Header & Mode Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-blue-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 shadow-sm animate-pulse">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black font-display text-blue-950 tracking-tight">
                Live Urban Mobility Corridor Simulation
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-[10px] font-mono font-bold">
                AI REAL-TIME
              </span>
            </div>
            <p className="text-xs text-blue-800 font-medium">
              Multimodal transit grid, V2X connected vehicles, and automated ERP gantry scanning
            </p>
          </div>
        </div>

        {/* Animation Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Traffic Scenario Selector */}
          <div className="flex items-center rounded-xl bg-blue-50 p-1 border border-blue-200 text-xs font-bold text-blue-950">
            <button
              type="button"
              onClick={() => {
                setTrafficMode('smooth');
                setScannedToll(20);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                trafficMode === 'smooth'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-900 hover:text-blue-600'
              }`}
            >
              Eco-Flow
            </button>
            <button
              type="button"
              onClick={() => {
                setTrafficMode('peak');
                setScannedToll(45);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                trafficMode === 'peak'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-blue-900 hover:text-blue-600'
              }`}
            >
              Peak Rush
            </button>
            <button
              type="button"
              onClick={() => {
                setTrafficMode('emergency');
                setScannedToll(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                trafficMode === 'emergency'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-blue-900 hover:text-rose-600'
              }`}
            >
              Emergency Clear
            </button>
          </div>

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() => setSimulationSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1))}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-950 text-xs font-mono font-bold hover:bg-blue-50 transition-colors cursor-pointer shadow-sm"
            title="Adjust Simulation Speed"
          >
            {simulationSpeed}x Speed
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
              isPlaying
                ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                : 'bg-blue-600 border-blue-600 text-white'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
        </div>
      </div>

      {/* Main Animated Highway & Transit Corridor */}
      <div className="relative my-4 rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/40 overflow-hidden shadow-inner py-2">
        {/* Overhead ERP Road Pricing Gantry Structure */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-16 z-20 pointer-events-none flex flex-col justify-between items-center">
          {/* Top Digital Toll Display Board */}
          <div className="w-32 -ml-8 bg-blue-950 text-white text-[10px] font-mono font-bold rounded-lg px-2 py-1 text-center border-2 border-blue-400 shadow-lg flex items-center justify-around">
            <span className="flex items-center gap-1 text-cyan-300">
              <Coins className="w-3 h-3 text-amber-400" /> ERP
            </span>
            <span className={trafficMode === 'emergency' ? 'text-emerald-400 font-black' : 'text-amber-300 font-black'}>
              {trafficMode === 'emergency' ? 'FREE PASS' : `₹${scannedToll}`}
            </span>
          </div>

          {/* Laser Scanner Beam */}
          <div
            className={`w-1 h-full bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent transition-opacity duration-300 ${
              gantryActive && isPlaying ? 'opacity-100 animate-gantry-scan' : 'opacity-20'
            }`}
          />

          {/* Road Sensor Waypoint */}
          <div className="w-12 h-3 bg-blue-600/30 rounded-full border border-blue-400 flex items-center justify-center text-[8px] font-mono text-blue-900 font-bold">
            SCAN
          </div>
        </div>

        {/* Corridor Tracks */}
        <div className="space-y-3 px-2">
          {/* LANE 1: Electric Rapid Transit Bus */}
          <div className="relative h-12 flex items-center border-b border-dashed border-blue-200">
            {/* Lane Tag */}
            <span className="absolute left-2 text-[9px] font-mono font-bold uppercase text-blue-400 tracking-wider">
              LANE 1 • SMART RAPID TRANSIT
            </span>

            {/* Moving Bus Component */}
            <div
              className={`absolute flex items-center gap-2 transition-all ${
                isPlaying ? 'animate-vehicle-bob' : ''
              }`}
              style={{
                animation: isPlaying ? `moveAcross ${busSpeed} linear infinite` : 'none',
                left: isPlaying ? undefined : '35%',
              }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white shadow-lg border border-blue-400">
                <Bus className="w-4 h-4 text-white" />
                <div className="leading-tight">
                  <div className="text-[10px] font-black font-mono tracking-tight flex items-center gap-1">
                    BUS 102 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[8px] text-blue-100 font-mono">Electric Express</div>
                </div>
              </div>
              <span className="text-[9px] font-mono text-blue-700 bg-white/90 border border-blue-200 px-1.5 py-0.5 rounded-md font-bold shadow-sm">
                48 km/h • 78% Seats
              </span>
            </div>
          </div>

          {/* LANE 2: Autonomous Connected EV Car */}
          <div className="relative h-12 flex items-center border-b border-dashed border-blue-200">
            {/* Lane Tag */}
            <span className="absolute left-2 text-[9px] font-mono font-bold uppercase text-blue-400 tracking-wider">
              LANE 2 • CONNECTED EV CORRIDOR
            </span>

            {/* Moving EV Car Component */}
            <div
              className="absolute flex items-center gap-2"
              style={{
                animation: isPlaying ? `moveAcross ${speedMultiplier} linear infinite` : 'none',
                animationDelay: '1.5s',
                left: isPlaying ? undefined : '65%',
              }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border-2 border-blue-600 text-blue-950 shadow-md">
                <Car className="w-3.5 h-3.5 text-blue-600" />
                <div className="text-[10px] font-bold font-mono">EV-9024</div>
                <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" />
              </div>
              <span className="text-[8px] font-mono text-blue-800 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded font-bold">
                V2X Active
              </span>
            </div>
          </div>

          {/* LANE 3: AI Priority Emergency Corridor / Smart Traffic Wave */}
          <div className="relative h-12 flex items-center">
            {/* Lane Tag */}
            <span className="absolute left-2 text-[9px] font-mono font-bold uppercase text-blue-400 tracking-wider">
              LANE 3 • AI DYNAMIC PRIORITY LANE
            </span>

            {trafficMode === 'emergency' ? (
              /* Emergency Ambulance Clearance Animation */
              <div
                className="absolute flex items-center gap-2"
                style={{
                  animation: isPlaying ? `moveAcross ${emergencySpeed} linear infinite` : 'none',
                  left: isPlaying ? undefined : '20%',
                }}
              >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white shadow-xl border-2 border-rose-300 animate-pulse">
                  <Siren className="w-4 h-4 text-white animate-spin" />
                  <div className="leading-tight">
                    <div className="text-[10px] font-black font-mono">AMBULANCE-01</div>
                    <div className="text-[8px] text-rose-100 font-mono">GREEN CORRIDOR</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md font-bold shadow-sm">
                  Signals Pre-Cleared
                </span>
              </div>
            ) : (
              /* Eco-Commuter Autonomous Shuttles */
              <div
                className="absolute flex items-center gap-2"
                style={{
                  animation: isPlaying ? `moveAcross ${speedMultiplier} linear infinite` : 'none',
                  animationDelay: '3s',
                  left: isPlaying ? undefined : '45%',
                }}
              >
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-100 border border-blue-300 text-blue-900 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[10px] font-mono font-bold">AI Shuttle Micro-Pod</span>
                </div>
                <span className="text-[8px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded font-bold">
                  Zero Emission
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Animated Highway Divider Stripes at Bottom */}
        <div className="h-1.5 w-full animate-road-move mt-2" />
      </div>

      {/* Corridor Live Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
            <Gauge className="w-3 h-3 text-blue-600" /> AVERAGE VELOCITY
          </span>
          <div className="text-base font-black font-mono text-blue-950 mt-0.5">
            {trafficMode === 'peak' ? '32 km/h' : trafficMode === 'emergency' ? '64 km/h' : '52 km/h'}
          </div>
          <span className="text-[10px] text-blue-700 font-medium">
            {trafficMode === 'peak' ? 'Dense Flow' : 'Free Flow Corridor'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
            <Wifi className="w-3 h-3 text-blue-600" /> CONNECTED FLEET
          </span>
          <div className="text-base font-black font-mono text-blue-950 mt-0.5">
            {vehicleCount.toLocaleString()} units
          </div>
          <span className="text-[10px] text-blue-700 font-medium">99.4% V2X Telemetry</span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-500" /> DYNAMIC ROAD TOLL
          </span>
          <div className="text-base font-black font-mono text-blue-950 mt-0.5">
            ₹{scannedToll}
          </div>
          <span className="text-[10px] text-blue-700 font-medium">
            {trafficMode === 'emergency' ? 'Toll Exempt' : 'AI Adaptive Pricing'}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200">
          <span className="text-[10px] font-mono uppercase font-bold text-blue-900 block flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-600" /> CO₂ REDUCTION
          </span>
          <div className="text-base font-black font-mono text-emerald-700 mt-0.5">
            -34.8%
          </div>
          <span className="text-[10px] text-blue-700 font-medium">Electric Mode Enabled</span>
        </div>
      </div>

      {/* Inline Keyframe Definition for Vehicle Translation */}
      <style>{`
        @keyframes moveAcross {
          0% {
            left: -20%;
          }
          100% {
            left: 110%;
          }
        }
      `}</style>
    </div>
  );
};
