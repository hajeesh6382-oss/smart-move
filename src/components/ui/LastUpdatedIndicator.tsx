// SMARTMOVE Last Updated Indicator
// Shows relative time since last data update with auto-refresh every second.
// "Updated 12 sec ago" or "Updated: 14:32:18"

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface LastUpdatedIndicatorProps {
  timestamp: Date | string | null;
  showAbsolute?: boolean;
  className?: string;
}

export const LastUpdatedIndicator: React.FC<LastUpdatedIndicatorProps> = ({
  timestamp,
  showAbsolute = false,
  className = '',
}) => {
  const [, setTick] = useState(0);

  // Re-render every 5 seconds to keep relative time fresh
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!timestamp) {
    return (
      <span className={`text-[10px] font-mono text-slate-500 flex items-center gap-1 ${className}`}>
        <Clock className="w-3 h-3" />
        Never updated
      </span>
    );
  }

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);

  let relativeText: string;
  if (seconds < 5) relativeText = 'Just now';
  else if (seconds < 60) relativeText = `${seconds} sec ago`;
  else if (seconds < 3600) relativeText = `${Math.round(seconds / 60)} min ago`;
  else relativeText = `${Math.round(seconds / 3600)} hr ago`;

  const absoluteText = date.toLocaleTimeString('en-US', { hour12: false });

  const isStale = seconds > 300; // 5 minutes

  return (
    <span
      className={`text-[10px] font-mono flex items-center gap-1 ${
        isStale ? 'text-amber-400' : 'text-slate-400'
      } ${className}`}
      title={`Last update: ${date.toISOString()}`}
    >
      <Clock className="w-3 h-3" />
      {showAbsolute ? `Updated: ${absoluteText}` : `Updated ${relativeText}`}
    </span>
  );
};
