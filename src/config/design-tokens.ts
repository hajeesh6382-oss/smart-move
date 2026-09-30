// SMARTMOVE Design Tokens & Provenance Definitions (Stitch Integrated)
// Single Source of Truth for Colors, Typography, Provenance Badges, and Semantic Mobility Tokens

export const DESIGN_TOKENS = {
  colors: {
    bg: {
      primary: '#030712',
      surface: '#090d16',
      panel: 'rgba(15, 23, 42, 0.75)',
      panelSubtle: 'rgba(15, 23, 42, 0.45)',
      panelGlow: 'rgba(15, 23, 42, 0.85)',
      elevated: '#0f172a',
      input: '#020617',
    },
    borders: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      default: '#1e293b',
      accent: 'rgba(6, 182, 212, 0.3)',
      glow: 'rgba(6, 182, 212, 0.6)',
      danger: 'rgba(244, 63, 94, 0.4)',
      warning: 'rgba(245, 158, 11, 0.4)',
      success: 'rgba(16, 185, 129, 0.4)',
    },
    brand: {
      cyan: '#06b6d4',
      cyanLight: '#38bdf8',
      blue: '#2563eb',
      indigo: '#4f46e5',
      purple: '#9333ea',
      amber: '#f59e0b',
      rose: '#f43f5e',
      emerald: '#10b981',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      muted: '#94a3b8',
      subtle: '#64748b',
      accent: '#38bdf8',
    },
  },
  typography: {
    fontSans: "'Inter', 'Noto Sans Devanagari', 'Noto Sans Tamil', 'Noto Sans Telugu', 'Noto Sans Kannada', 'Noto Sans Malayalam', 'Noto Sans Bengali', 'Noto Sans Gujarati', 'Noto Sans Gurmukhi', sans-serif",
    fontDisplay: "'Outfit', 'Inter', sans-serif",
    fontMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    glowCyan: '0 0 25px -5px rgba(6, 182, 212, 0.2)',
    glowAmber: '0 0 25px -5px rgba(245, 158, 11, 0.2)',
    glowRose: '0 0 25px -5px rgba(244, 63, 94, 0.2)',
    glowEmerald: '0 0 25px -5px rgba(16, 185, 129, 0.2)',
    elevation: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
  },
} as const;

// Semantic Mobility Severity System
export type MobilitySeverity = 'low' | 'moderate' | 'high' | 'severe';

export const MOBILITY_SEVERITY_CONFIG: Record<MobilitySeverity, {
  label: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  iconName: string;
}> = {
  low: {
    label: 'Low / Flowing',
    color: '#10b981',
    badgeBg: 'bg-emerald-500/15',
    borderColor: 'border-emerald-500/30',
    textColor: 'text-emerald-300',
    strokeColor: '#10b981',
    strokeWidth: 6,
    iconName: 'CheckCircle',
  },
  moderate: {
    label: 'Moderate Traffic',
    color: '#eab308',
    badgeBg: 'bg-amber-500/15',
    borderColor: 'border-amber-500/30',
    textColor: 'text-amber-300',
    strokeColor: '#eab308',
    strokeWidth: 8,
    iconName: 'AlertTriangle',
  },
  high: {
    label: 'High Volume',
    color: '#f97316',
    badgeBg: 'bg-orange-500/15',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-300',
    strokeColor: '#f97316',
    strokeWidth: 10,
    iconName: 'Flame',
  },
  severe: {
    label: 'Severe Bottleneck',
    color: '#f43f5e',
    badgeBg: 'bg-rose-500/15',
    borderColor: 'border-rose-500/40',
    textColor: 'text-rose-300',
    strokeColor: '#f43f5e',
    strokeWidth: 12,
    iconName: 'Flame',
  },
};

// Data Provenance Sources
export type DataSourceType = 'simulated' | 'demo_seed' | 'live_api' | 'sensor' | 'estimated' | 'ai_prediction' | 'delayed' | 'unavailable' | 'live_weather' | 'demo';

export const DATA_PROVENANCE_CONFIG: Record<DataSourceType, {
  label: string;
  description: string;
  badgeClass: string;
  dotColor: string;
  icon: string;
}> = {
  simulated: {
    label: 'SIMULATED DATA',
    description: 'Computed by SMARTMOVE reactive city simulation engine.',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-400',
    icon: 'Cpu',
  },
  demo_seed: {
    label: 'DEMO DATA',
    description: 'Pre-seeded baseline scenarios for hackathon evaluation.',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-400',
    icon: 'Database',
  },
  demo: {
    label: 'DEMO',
    description: 'Controlled simulated scenario for demonstration. Not real-time data.',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-400',
    icon: 'Database',
  },
  live_api: {
    label: 'LIVE API',
    description: 'Fetched directly from a connected external real-time API.',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    icon: 'Radio',
  },
  live_weather: {
    label: 'LIVE WEATHER',
    description: 'Real-time weather data from OpenWeatherMap API.',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    icon: 'Radio',
  },
  sensor: {
    label: 'IOT SENSOR DATA',
    description: 'Derived from connected roadside camera or loop detector.',
    badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    dotColor: 'bg-cyan-400',
    icon: 'Wifi',
  },
  estimated: {
    label: 'ESTIMATED',
    description: 'Mathematically estimated based on speed, queues, and vehicle count models.',
    badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
    dotColor: 'bg-sky-400',
    icon: 'Calculator',
  },
  ai_prediction: {
    label: 'AI PREDICTION',
    description: 'Forecasted by SMARTMOVE ML/AI prediction engine based on real input data. Not a direct observation.',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-400',
    icon: 'Sparkles',
  },
  delayed: {
    label: 'DELAYED',
    description: 'Data source is connected but last update is older than expected. Values may be stale.',
    badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    dotColor: 'bg-amber-300',
    icon: 'Clock',
  },
  unavailable: {
    label: 'UNAVAILABLE',
    description: 'No authorized real-time data source is connected for this metric. Showing last known or demo data.',
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-600/30',
    dotColor: 'bg-slate-400',
    icon: 'WifiOff',
  },
};

// City Map Center & Bounds Configuration (Bengaluru Tech Corridor)
export const MAP_CONFIG = {
  cityCenter: [12.9716, 77.5946] as [number, number],
  defaultZoom: 13,
  minZoom: 11,
  maxZoom: 18,
  attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors | SMARTMOVE GIS',
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};
