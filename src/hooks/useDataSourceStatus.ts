// SMARTMOVE Hook for querying Data Source Registry status
// Provides reactive updates when data sources change status or latency.

import { useState, useEffect } from 'react';
import { dataSourceRegistry, DataSourceMetadata } from '../services/dataSourceRegistry';

export function useDataSourceStatus(category?: DataSourceMetadata['category']) {
  const [sources, setSources] = useState<DataSourceMetadata[]>(() =>
    category ? dataSourceRegistry.getSourcesByCategory(category) : dataSourceRegistry.getAllSources()
  );

  useEffect(() => {
    const update = () => {
      setSources(category ? dataSourceRegistry.getSourcesByCategory(category) : dataSourceRegistry.getAllSources());
    };

    update();
    const unsubscribe = dataSourceRegistry.subscribe(update);
    return () => {
      unsubscribe();
    };
  }, [category]);

  const primarySource = sources[0];

  return {
    sources,
    primarySource,
    status: primarySource?.status || 'DEMO',
    isLive: primarySource?.status === 'LIVE',
    isPrediction: primarySource?.status === 'AI_PREDICTION',
    isOffline: primarySource?.status === 'OFFLINE',
    lastUpdated: primarySource?.lastUpdated,
    provider: primarySource?.provider || 'SMARTMOVE System',
  };
}
