import React from 'react';

interface SmartMoveLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const SmartMoveLogo: React.FC<SmartMoveLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSize = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const subTextSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Animated Futuristic Mobility Beacon */}
      <div
        className="relative flex items-center justify-center shrink-0 cursor-pointer"
        style={{ width: iconSize, height: iconSize }}
      >
        {/* Outer Orbiting Glowing Ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 p-[1.5px] shadow-lg shadow-blue-500/25 animate-[spin_8s_linear_infinite]">
          <div className="w-full h-full bg-white rounded-2xl" />
        </div>

        {/* Pulsing Beacon Glow */}
        <div className="absolute -inset-1 rounded-2xl bg-blue-500/20 blur-md group-hover:bg-blue-500/40 transition-all duration-500 animate-pulse" />

        {/* Core Icon Canvas */}
        <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-2 shadow-inner overflow-hidden">
          {/* Subtle Scanning Light Bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />

          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-white transform group-hover:scale-110 transition-transform duration-300"
          >
            {/* Speed Waves */}
            <path
              d="M3 12h3m12 0h3M7 8h10M5 16h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="opacity-70 animate-[pulse_2s_ease-in-out_infinite]"
            />
            {/* Mobility Hub Diamond Node */}
            <path
              d="M12 4L16 12L12 20L8 12Z"
              fill="currentColor"
              className="text-cyan-300 drop-shadow-md"
            />
            {/* Core Pulse Point */}
            <circle cx="12" cy="12" r="2.5" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className={`font-black font-display tracking-tight text-blue-950 flex items-center gap-1.5 ${textSize}`}>
            <span>SMART</span>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              MOVE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
          </div>
          <span className={`font-mono font-bold tracking-widest text-blue-600 uppercase ${subTextSize}`}>
            AI Urban Mobility
          </span>
        </div>
      )}
    </div>
  );
};
