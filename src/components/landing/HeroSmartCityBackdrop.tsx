import React, { useEffect, useState } from 'react';

export const HeroSmartCityBackdrop: React.FC = () => {
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* Deep Space / Cyber Dark Backdrop */}
      <div className="absolute inset-0 bg-[#030712] opacity-95" />

      {/* Radiant Glowing Gradient Meshes */}
      <div className="absolute -top-32 left-1/4 w-[600px] h-[500px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent blur-[140px] rounded-full animate-pulse-subtle" />
      <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-gradient-to-bl from-indigo-600/20 via-sky-500/15 to-transparent blur-[150px] rounded-full animate-pulse-subtle" />
      <div className="absolute -bottom-24 left-1/3 w-[700px] h-[450px] bg-gradient-to-t from-emerald-500/10 via-cyan-500/10 to-transparent blur-[160px] rounded-full" />

      {/* Cyber Grid Lines Perspective */}
      <div 
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.25) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.25) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
        }}
      />

      {/* Animated SVG Mobility Network & Arterial Highways */}
      <svg
        className="absolute inset-0 w-full h-full opacity-80"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="arteryCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="arteryGreen" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="arteryAmber" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.9" />
          </linearGradient>

          {/* Glow filter for paths */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Primary Arterial Express Highway */}
        <path
          d="M -100 250 C 300 200, 500 450, 850 380 C 1100 320, 1300 520, 1600 480"
          fill="none"
          stroke="rgba(56, 189, 248, 0.15)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M -100 250 C 300 200, 500 450, 850 380 C 1100 320, 1300 520, 1600 480"
          fill="none"
          stroke="url(#arteryCyan)"
          strokeWidth="3.5"
          filter="url(#neonGlow)"
          strokeDasharray="14 10"
          className="animate-road-dash"
        />

        {/* Secondary Cross-City Rapid Transit Loop */}
        <path
          d="M 100 850 C 350 600, 480 320, 720 310 C 980 300, 1150 700, 1500 650"
          fill="none"
          stroke="rgba(16, 185, 129, 0.12)"
          strokeWidth="8"
        />
        <path
          d="M 100 850 C 350 600, 480 320, 720 310 C 980 300, 1150 700, 1500 650"
          fill="none"
          stroke="url(#arteryGreen)"
          strokeWidth="2.5"
          strokeDasharray="10 12"
          className="animate-road-dash"
          style={{ animationDirection: 'reverse', animationDuration: '2s' }}
        />

        {/* Diagonal Tech Park Express Spoke */}
        <path
          d="M 200 -50 C 380 220, 750 480, 1100 850"
          fill="none"
          stroke="rgba(99, 102, 241, 0.1)"
          strokeWidth="6"
        />
        <path
          d="M 200 -50 C 380 220, 750 480, 1100 850"
          fill="none"
          stroke="url(#arteryCyan)"
          strokeWidth="2"
          strokeDasharray="16 12"
          className="animate-road-dash"
          style={{ animationDuration: '1.4s' }}
        />

        {/* Congestion Relief Bypass */}
        <path
          d="M 850 380 C 950 250, 1200 200, 1550 220"
          fill="none"
          stroke="url(#arteryAmber)"
          strokeWidth="2"
          strokeDasharray="8 8"
          className="animate-road-dash"
          style={{ animationDuration: '2.5s' }}
        />

        {/* Interactive Pulsing Sensor Nodes / Intersections */}
        {[
          { cx: 320, cy: 220, label: 'Node α (Tech Hub)', status: '🟢 Free-Flow' },
          { cx: 720, cy: 310, label: 'Interchange Central', status: '🟢 Green Wave' },
          { cx: 850, cy: 380, label: 'ERP Gantry 04', status: '⚡ Dynamic Toll' },
          { cx: 1100, cy: 410, label: 'Metro Junction', status: '🟢 98% On-Time' },
          { cx: 480, cy: 430, label: 'EV Station Beta', status: '🔋 12 Available' },
          { cx: 1250, cy: 500, label: 'Port Express Link', status: '🟢 Low Traffic' },
        ].map((node, i) => {
          const isActive = pulseIndex === i % 4;
          return (
            <g key={i} className="transition-all duration-700">
              {/* Outer Pulse Ring */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isActive ? 28 : 16}
                fill="none"
                stroke={i === 2 ? '#38bdf8' : '#10b981'}
                strokeWidth={isActive ? '1.5' : '0.8'}
                strokeOpacity={isActive ? '0.8' : '0.3'}
                className="transition-all duration-700"
              />
              {/* Core Node Circle */}
              <circle
                cx={node.cx}
                cy={node.cy}
                r={isActive ? 7 : 5}
                fill={i === 2 ? '#38bdf8' : '#10b981'}
                filter="url(#neonGlow)"
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r="2.5"
                fill="#ffffff"
              />
              {/* Node Telemetry Tag */}
              <text
                x={node.cx + 12}
                y={node.cy - 10}
                fill="#94a3b8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                letterSpacing="0.05em"
              >
                {node.label}
              </text>
              <text
                x={node.cx + 12}
                y={node.cy + 4}
                fill={i === 2 ? '#38bdf8' : '#34d399'}
                fontSize="8"
                fontFamily="sans-serif"
                fontWeight="600"
              >
                {node.status}
              </text>
            </g>
          );
        })}

        {/* Dynamic Moving Vehicle Markers (SVG Motion Paths) */}
        {/* Vehicle 1: Connected EV */}
        <circle r="4" fill="#06b6d4" filter="url(#neonGlow)">
          <animateMotion
            path="M -100 250 C 300 200, 500 450, 850 380 C 1100 320, 1300 520, 1600 480"
            dur="9s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Vehicle 2: Electric Rapid Bus */}
        <circle r="5" fill="#10b981" filter="url(#neonGlow)">
          <animateMotion
            path="M 100 850 C 350 600, 480 320, 720 310 C 980 300, 1150 700, 1500 650"
            dur="13s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Vehicle 3: Emergency Corridor Vehicle */}
        <circle r="4.5" fill="#f43f5e" filter="url(#neonGlow)">
          <animateMotion
            path="M 200 -50 C 380 220, 750 480, 1100 850"
            dur="6s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Vehicle 4: Autonomous Delivery Pod */}
        <circle r="3.5" fill="#38bdf8" filter="url(#neonGlow)">
          <animateMotion
            path="M 850 380 C 950 250, 1200 200, 1550 220"
            dur="8s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
};
