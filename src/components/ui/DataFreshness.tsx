// SMARTMOVE Data Freshness & Stale Indicator Component
// Displays "Observed Xs ago" and triggers a prominent STALE warning if older than 120s

import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface DataFreshnessProps {
  observedAt?: string | Date;
  staleThresholdSeconds?: number;
  className?: string;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({
  observedAt = new Date(),
  staleThresholdSeconds = 120,
  className = '',
}) => {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const updateDiff = () => {
      const time = typeof observedAt === 'string' ? new Date(observedAt).getTime() : observedAt.getTime();
      const diff = Math.max(0, Math.floor((Date.now() - time) / 1000));
      setSecondsAgo(diff);
    };

    updateDiff();
    const timer = setInterval(updateDiff, 1000);
    return () => clearInterval(timer);
  }, [observedAt]);

  const isStale = secondsAgo > staleThresholdSeconds;

  if (isStale) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse ${className}`}
        title={`Observed ${secondsAgo}s ago (> ${staleThresholdSeconds}s threshold)`}
      >
        <AlertTriangle className="w-3 h-3 text-rose-400" /> STALE DATA ({secondsAgo}s)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 ${className}`}
      title={`Observed at ${new Date(observedAt).toLocaleTimeString()}`}
    >
      <Clock className="w-3 h-3 text-cyan-400" />
      <span>observed {secondsAgo < 5 ? 'just now' : `${secondsAgo}s ago`}</span>
    </span>
  );
};
