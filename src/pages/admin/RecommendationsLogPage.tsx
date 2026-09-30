// SMARTMOVE AI Action & Recommendation Audit Log Page

import React from 'react';
import { useRealtimeTable } from '../../hooks/useRealtimeTable';
import { InsightCard } from '../../components/ui/InsightCard';
import { SourceBadge } from '../../components/ui/SourceBadge';
import { Sparkles, ShieldCheck, History } from 'lucide-react';

export const RecommendationsLogPage: React.FC = () => {
  const { data: aiRecs } = useRealtimeTable('ai_recommendations');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono font-bold text-cyan-400">
              Autonomous Intelligence Ledger
            </span>
            <SourceBadge source="SIMULATED DATA" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-black font-display text-white mt-0.5">
            AI Recommendations & Decision Explainability Log
          </h2>
          <p className="text-xs text-slate-400">
            Full transparent record of detected bottlenecks, predictive horizons, why factors, and estimated systemic impacts.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        {aiRecs.map((rec: any) => (
          <InsightCard key={rec.id} insight={rec} />
        ))}
      </div>
    </div>
  );
};
