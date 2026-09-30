// Crowding Estimator Provider (Always Estimated as per Provenance Rules)

import { DataProvider, ProviderResult } from './types.ts';

export class CrowdingEstimatorProvider implements DataProvider<any> {
  name = 'smartmove-crowding-model';
  category = 'bus' as const;

  isConfigured(): boolean {
    return true; // Always active
  }

  async fetch(): Promise<ProviderResult<any>> {
    const observedAt = new Date().toISOString();
    return {
      data: {
        bus_102_occupancy: 94,
        bus_105_occupancy: 76,
        bus_210_occupancy: 52,
      },
      dataSource: 'estimated',
      providerName: 'smartmove-crowding-model',
      observedAt,
      confidence: 91,
    };
  }
}
