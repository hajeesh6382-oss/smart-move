import React, { useState, useEffect } from 'react';
import { Leaf, Car, Zap, Bus, Footprints, ArrowUpRight, Sparkles } from 'lucide-react';

interface SustainabilityMetric {
  id: string;
  label: string;
  icon: string;
  percentage: number;
  highlight: string;
  description: string;
  color: string;
}

export const SustainabilityGauges: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const metrics: SustainabilityMetric[] = [
    {
      id: 'co2',
      label: 'CO₂ Saved',
      icon: '🌱',
      percentage: 78,
      highlight: '-142 tons',
      description: 'Monthly vehicular emissions curtailed across express corridors',
      color: '#10b981',
    },
    {
      id: 'traffic',
      label: 'Traffic Reduced',
      icon: '🚗',
      percentage: 64,
      highlight: '-22 mins',
      description: 'Average commuter idling eliminated via AI green split scheduling',
      color: '#06b6d4',
    },
    {
      id: 'ev',
      label: 'EV Usage',
      icon: '⚡',
      percentage: 82,
      highlight: '+38% YoY',
      description: 'Charge point network utilization with prioritized routing',
      color: '#38bdf8',
    },
    {
      id: 'transit',
      label: 'Public Transport',
      icon: '🚌',
      percentage: 71,
      highlight: '38K daily',
      description: 'Shifted from single-occupancy cars to electric metro & feeder buses',
      color: '#8b5cf6',
    },
    {
      id: 'trips',
      label: 'Sustainable Trips',
      icon: '🚶',
      percentage: 58,
      highlight: 'Last-mile',
      description: 'Active micro-mobility, e-bikes and pedestrian safe corridors',
      color: '#10b981',
    },
  ];

  // SVG Circular Gauge helper
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((metric) => {
          const strokeDashoffset = animated
            ? circumference - (metric.percentage / 100) * circumference
            : circumference;

          return (
            <div
              key={metric.id}
              className="glass-panel p-5 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all duration-300 flex flex-col items-center text-center group relative overflow-hidden"
            >
              {/* Subtle Ambient Hover Glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-3xl"
                style={{ backgroundColor: metric.color }}
              />

              {/* Animated Circular Progress Gauge */}
              <div className="relative w-28 h-28 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Gauge Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="7"
                  />
                  {/* Animated Progress Indicator */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke={metric.color}
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
                      filter: `drop-shadow(0 0 6px ${metric.color}80)`,
                    }}
                  />
                </svg>

                {/* Center Content Icon & Value */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl mb-0.5">{metric.icon}</span>
                  <span className="text-base font-black font-display text-white">
                    {animated ? metric.percentage : 0}%
                  </span>
                </div>
              </div>

              {/* Metric Label & Summary */}
              <h4 className="text-sm font-bold text-white font-display mt-2 group-hover:text-emerald-300 transition-colors">
                {metric.label}
              </h4>
              <span
                className="text-xs font-mono font-bold mt-0.5 px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${metric.color}15`,
                  color: metric.color,
                }}
              >
                {metric.highlight}
              </span>
              <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                {metric.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
