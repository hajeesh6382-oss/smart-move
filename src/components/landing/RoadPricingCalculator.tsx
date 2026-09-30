import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coins,
  Clock,
  Car,
  Zap,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Percent,
} from 'lucide-react';

export const RoadPricingCalculator: React.FC = () => {
  const navigate = useNavigate();

  // Calculator State
  const [fromZone, setFromZone] = useState('Tech Corridor (Zone 3)');
  const [toZone, setToZone] = useState('CBD Financial Core (Zone 1)');
  const [vehicleType, setVehicleType] = useState<'EV' | 'Car' | 'Bike' | 'Commercial'>('EV');
  const [timeSlot, setTimeSlot] = useState<'peak' | 'normal' | 'offpeak'>('peak');

  // Display & Animated Price State
  const [calculatedPrice, setCalculatedPrice] = useState(42);
  const [displayPrice, setDisplayPrice] = useState(42);
  const [isCalculating, setIsCalculating] = useState(false);
  const [nextChangeSeconds, setNextChangeSeconds] = useState(18 * 60 + 24);

  // Countdown timer for "Next Price Change"
  useEffect(() => {
    const timer = setInterval(() => {
      setNextChangeSeconds((prev) => (prev > 0 ? prev - 1 : 18 * 60));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Smooth number counter animation
  const handleCalculate = () => {
    setIsCalculating(true);

    let base = 25;
    if (fromZone.includes('Zone 3') && toZone.includes('Zone 1')) base = 35;
    if (fromZone.includes('Zone 2') && toZone.includes('Zone 1')) base = 28;

    let timeMultiplier = timeSlot === 'peak' ? 1.4 : timeSlot === 'normal' ? 1.0 : 0.6;
    let vehicleDiscount = vehicleType === 'EV' ? 0.75 : vehicleType === 'Bike' ? 0.4 : vehicleType === 'Commercial' ? 1.8 : 1.0;

    const targetPrice = Math.round(base * timeMultiplier * vehicleDiscount);
    setCalculatedPrice(targetPrice);

    // Number rolling effect
    let current = displayPrice;
    const step = targetPrice > current ? 1 : -1;
    const duration = 500;
    const steps = Math.abs(targetPrice - current);
    const intervalTime = Math.max(15, Math.floor(duration / (steps || 1)));

    const rollTimer = setInterval(() => {
      if (current === targetPrice) {
        clearInterval(rollTimer);
        setIsCalculating(false);
      } else {
        current += step;
        setDisplayPrice(current);
      }
    }, intervalTime);
  };

  return (
    <div className="w-full">
      {/* 4 Live Pricing Metrics (Prompt Section 8) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-5 rounded-3xl border border-cyan-500/30 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold mb-1">
            <span>CURRENT ZONE</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div className="text-3xl font-black font-display text-white mt-1">
            ₹12
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
            Zone 2 Standard Flow Rate
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold mb-1">
            <span>PEAK PRICING</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-3xl font-black font-display text-amber-300 mt-1">
            ₹25
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1 font-semibold">
            Rush Hour Congestion Surcharge
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-blue-500/30 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold mb-1">
            <span>ESTIMATED TRIP COST</span>
            <Coins className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black font-display text-cyan-300 mt-1">
            ₹{displayPrice}
          </div>
          <p className="text-[11px] text-cyan-400 mt-1 font-semibold">
            Point A → B Dynamic Toll
          </p>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-purple-500/30 text-left">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono font-bold mb-1">
            <span>NEXT PRICE CHANGE</span>
            <Clock className="w-4 h-4 text-purple-400 animate-spin" />
          </div>
          <div className="text-3xl font-black font-display text-purple-300 mt-1 font-mono">
            {formatCountdown(nextChangeSeconds)}
          </div>
          <p className="text-[11px] text-purple-400/90 mt-1 font-semibold">
            15-minute AI re-calibration
          </p>
        </div>
      </div>

      {/* Interactive Road Pricing Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Animated Zone Map Representation (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-cyan-500/30 bg-slate-950/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white font-display">
                Dynamic Pricing Zone Map
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                ERP GANTRY MESH
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Tolls adapt autonomously based on vehicle speeds detected across gantries to avoid bottleneck jams.
            </p>
          </div>

          {/* Concentric Animated Zone Rings Visual */}
          <div className="relative h-64 flex items-center justify-center my-4 overflow-hidden">
            {/* Zone 3: Outer Ring */}
            <div className="absolute w-60 h-60 rounded-full border-2 border-emerald-500/30 bg-emerald-500/5 flex items-center justify-center animate-pulse-subtle">
              <span className="absolute top-2 text-[10px] font-mono text-emerald-400 font-bold">
                Zone 3 • ₹8
              </span>

              {/* Zone 2: Inner Ring */}
              <div className="w-44 h-44 rounded-full border-2 border-amber-500/40 bg-amber-500/10 flex items-center justify-center">
                <span className="absolute top-10 text-[10px] font-mono text-amber-400 font-bold">
                  Zone 2 • ₹16
                </span>

                {/* Zone 1: CBD Core */}
                <div className="w-24 h-24 rounded-full border-2 border-rose-500/50 bg-rose-500/15 flex flex-col items-center justify-center shadow-lg shadow-rose-500/20">
                  <span className="text-[10px] font-mono text-rose-400 font-bold">
                    CBD Core
                  </span>
                  <span className="text-xs font-black text-white font-mono">
                    ₹25
                  </span>
                </div>
              </div>
            </div>

            {/* Simulated Scanning Laser Beam */}
            <div className="absolute inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-gantry-scan pointer-events-none" />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              EV 25% Green Rebate
            </span>
            <span>Speed Target: 45 km/h</span>
          </div>
        </div>

        {/* Interactive Pricing Calculator (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 bg-slate-950/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm sm:text-base font-black font-display text-white">
                Interactive Trip Price Calculator
              </h4>
              <span className="text-xs font-mono text-cyan-400">
                FROM → TO → VEHICLE → TIME
              </span>
            </div>

            {/* Inputs: FROM & TO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  FROM ZONE
                </label>
                <select
                  value={fromZone}
                  onChange={(e) => setFromZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="Tech Corridor (Zone 3)">Tech Corridor (Zone 3)</option>
                  <option value="Residential Belt (Zone 2)">Residential Belt (Zone 2)</option>
                  <option value="Outer Expressway (Zone 3)">Outer Expressway (Zone 3)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  TO ZONE
                </label>
                <select
                  value={toZone}
                  onChange={(e) => setToZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                >
                  <option value="CBD Financial Core (Zone 1)">CBD Financial Core (Zone 1)</option>
                  <option value="Airport Link Expressway">Airport Link Expressway</option>
                  <option value="University Hub (Zone 2)">University Hub (Zone 2)</option>
                </select>
              </div>
            </div>

            {/* Vehicle Type Toggle */}
            <div className="mt-5">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                VEHICLE CLASSIFICATION
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'EV', label: 'Electric EV', icon: '⚡', tag: 'Rebate' },
                  { id: 'Car', label: 'IC Car', icon: '🚗', tag: 'Standard' },
                  { id: 'Bike', label: 'Two Wheeler', icon: '🏍️', tag: 'Low' },
                  { id: 'Commercial', label: 'Commercial', icon: '🚚', tag: 'Heavy' },
                ].map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVehicleType(v.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      vehicleType === v.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-base">{v.icon}</div>
                    <div className="text-xs font-bold mt-0.5">{v.label}</div>
                    <div className="text-[9px] text-cyan-400 font-mono">{v.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Toggle */}
            <div className="mt-5">
              <label className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                TIME OF COMMUTE
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'peak', label: 'Peak Hour', time: '8:00 - 10:30 AM', badge: '1.4x' },
                  { id: 'normal', label: 'Regular Flow', time: '11:00 AM - 4:00 PM', badge: '1.0x' },
                  { id: 'offpeak', label: 'Off-Peak / Night', time: '9:00 PM - 6:00 AM', badge: '0.6x' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTimeSlot(t.id as any)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      timeSlot === t.id
                        ? 'bg-blue-600/20 border-blue-400 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{t.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.time}</div>
                    <div className="text-[9px] font-mono text-cyan-300 font-bold">{t.badge}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Price Calculation Output Box */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                TOTAL TRIP CONGESTION CHARGE
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-4xl font-black font-display text-white tracking-tight">
                  ₹{displayPrice}
                </span>
                <span className="text-xs text-emerald-400 font-semibold font-mono">
                  {vehicleType === 'EV' ? 'includes -25% clean energy discount' : 'standard gantry tariff'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCalculate}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>CALCULATE PRICE</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/app/road-pricing')}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                View Full ERP Feed →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
