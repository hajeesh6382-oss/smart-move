import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bus,
  Car,
  Train,
  Zap,
  ShieldAlert,
  MapPin,
  TrendingDown,
  Navigation,
  Sparkles,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const SmartCityLiveVisualizer: React.FC = () => {
  const [activeLayer, setActiveLayer] = useState<'all' | 'transit' | 'emergency' | 'ev'>('all');
  const [counters, setCounters] = useState({
    journeys: 42000,
    trafficReduction: 18,
    co2Reduction: 27,
    routeAccuracy: 94,
  });

  // Dynamic ticking counter animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCounters((prev) => ({
        ...prev,
        journeys: prev.journeys + Math.floor(Math.random() * 3) + 1,
      }));
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full">
      {/* 4 Floating Statistics with Animated Counters (Prompt Section 11) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <span className="text-3xl sm:text-4xl font-black font-display text-white">
            {(counters.journeys / 1000).toFixed(1)}K+
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-cyan-300 mt-1">
            Daily Journeys
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Orchestrated autonomously across city corridors
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <span className="text-3xl sm:text-4xl font-black font-display text-emerald-400">
            {counters.trafficReduction}%
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-emerald-300 mt-1">
            Traffic Reduction
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Through pre-emptive signal synchronization
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-blue-500/30 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <span className="text-3xl sm:text-4xl font-black font-display text-sky-400">
            {counters.co2Reduction}%
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-sky-300 mt-1">
            CO₂ Reduction
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Eliminating idle queuing at critical intersections
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 text-left relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform" />
          <span className="text-3xl sm:text-4xl font-black font-display text-purple-400">
            {counters.routeAccuracy}%
          </span>
          <h4 className="text-xs sm:text-sm font-bold text-purple-300 mt-1">
            Route Accuracy
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Machine-learned ETA precision on OSRM & GPS
          </p>
        </div>
      </div>

      {/* Futuristic Animated Smart City Environment (Prompt Section 11) */}
      <div className="glass-panel rounded-3xl border border-cyan-500/30 bg-slate-950/90 overflow-hidden relative shadow-2xl">
        {/* Layer Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Multimodal City Network Simulation
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: 'All Corridors' },
              { id: 'transit', label: '🚌 Metro & Rapid Bus' },
              { id: 'emergency', label: '🚨 Emergency Corridors' },
              { id: 'ev', label: '⚡ Smart EV Grid' },
            ].map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id as any)}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeLayer === layer.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>
        </div>

        {/* Isometric / Cyber SVG Multi-Layer City Canvas */}
        <div className="relative w-full h-[400px] sm:h-[460px] bg-[#020617] overflow-hidden flex items-center justify-center">
          {/* Subtle Grid Backdrop */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle, #38bdf8 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <svg
            className="w-full h-full"
            viewBox="0 0 1000 500"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
              </linearGradient>

              <filter id="cityGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Road Arteries */}
            {/* Lane 1: Outer Highway */}
            <path
              d="M 50 120 L 950 120"
              stroke="#1e293b"
              strokeWidth="32"
              strokeLinecap="round"
            />
            <path
              d="M 50 120 L 950 120"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="16 12"
              className="animate-road-dash"
            />

            {/* Lane 2: Metro Transit Elevated Rail */}
            <path
              d="M 50 250 L 950 250"
              stroke="#0f172a"
              strokeWidth="40"
              strokeLinecap="round"
            />
            <path
              d="M 50 250 L 950 250"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="24 16"
              className="animate-road-dash"
              style={{ animationDuration: '0.8s' }}
            />

            {/* Lane 3: Green EV Boulevard */}
            <path
              d="M 50 380 L 950 380"
              stroke="#064e3b"
              strokeWidth="32"
              strokeLinecap="round"
              strokeOpacity="0.3"
            />
            <path
              d="M 50 380 L 950 380"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="12 12"
              className="animate-road-dash"
              style={{ animationDuration: '1.2s' }}
            />

            {/* Cross Avenues */}
            <line x1="280" y1="50" x2="280" y2="450" stroke="#1e293b" strokeWidth="18" />
            <line x1="280" y1="50" x2="280" y2="450" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 8" className="animate-road-dash" />

            <line x1="720" y1="50" x2="720" y2="450" stroke="#1e293b" strokeWidth="18" />
            <line x1="720" y1="50" x2="720" y2="450" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="8 8" className="animate-road-dash" />

            {/* Intersections with Synchronized Adaptive Signals */}
            {[
              { x: 280, y: 120, label: 'North Interchange', color: '#10b981', state: 'GREEN WAVE' },
              { x: 280, y: 250, label: 'Metro Junction Alpha', color: '#38bdf8', state: 'SYNC' },
              { x: 280, y: 380, label: 'Eco Crossing West', color: '#10b981', state: 'GREEN' },
              { x: 720, y: 120, label: 'Expressway Toll Gantry', color: '#f59e0b', state: 'ERP ₹18' },
              { x: 720, y: 250, label: 'Airport Hub Interconnect', color: '#38bdf8', state: 'CLEAR' },
              { x: 720, y: 380, label: 'EV Station Campus', color: '#10b981', state: 'CHARGING' },
            ].map((node, i) => (
              <g key={i}>
                <circle cx={node.x} cy={node.y} r="18" fill="none" stroke={node.color} strokeWidth="1" strokeOpacity="0.5" className="animate-ping-slow" />
                <circle cx={node.x} cy={node.y} r="8" fill={node.color} filter="url(#cityGlow)" />
                <circle cx={node.x} cy={node.y} r="3" fill="#ffffff" />
                <text x={node.x} y={node.y - 14} fill="#94a3b8" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {node.label}
                </text>
                <text x={node.x} y={node.y + 22} fill={node.color} fontSize="8" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  {node.state}
                </text>
              </g>
            ))}

            {/* Animated Vehicles Passing */}
            {/* 1. Metro High-Speed Train */}
            <g>
              <rect x="0" y="243" width="90" height="14" rx="7" fill="#3b82f6" filter="url(#cityGlow)">
                <animate attributeName="x" from="-120" to="1100" dur="4.5s" repeatCount="indefinite" />
              </rect>
            </g>

            {/* 2. Rapid Electric Bus */}
            <g>
              <rect x="0" y="113" width="55" height="14" rx="4" fill="#06b6d4" filter="url(#cityGlow)">
                <animate attributeName="x" from="-80" to="1100" dur="7s" repeatCount="indefinite" />
              </rect>
            </g>

            {/* 3. Connected Electric Car */}
            <g>
              <circle cx="0" cy="380" r="7" fill="#10b981" filter="url(#cityGlow)">
                <animate attributeName="cx" from="-50" to="1100" dur="6s" repeatCount="indefinite" />
              </circle>
            </g>

            {/* 4. Emergency Ambulance Corridor Vehicle */}
            {(activeLayer === 'all' || activeLayer === 'emergency') && (
              <g>
                <rect x="0" y="113" width="35" height="14" rx="4" fill="#f43f5e" filter="url(#cityGlow)">
                  <animate attributeName="x" from="1100" to="-80" dur="3.5s" repeatCount="indefinite" />
                </rect>
              </g>
            )}
          </svg>

          {/* Telemetry Legend Floating Tags */}
          <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <Train className="w-3.5 h-3.5" /> High-Capacity Transit (Every 3m)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-3.5 h-3.5" /> 100% Electrified Bus Corridors
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <ShieldAlert className="w-3.5 h-3.5" /> Priority Pre-emption for Ambulances
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
