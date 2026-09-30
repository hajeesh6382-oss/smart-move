// Simulation Provider (Default Fallback Engine)

import { DataProvider, ProviderResult } from './types.ts';

export class SimulationTrafficProvider implements DataProvider<any[]> {
  name = 'sim-engine';
  category = 'traffic' as const;

  isConfigured(): boolean {
    return true; // Always available
  }

  async fetch(): Promise<ProviderResult<any[]>> {
    const observedAt = new Date().toISOString();
    return {
      data: [
        { id: 'tf_college', road_id: 'road_college', road_name: 'College Road (Tech Corridor)', congestion_pct: 84, avg_speed_kmh: 14, vehicle_count: 1180, status: 'severe' },
        { id: 'tf_bus_stand', road_id: 'road_bus_stand', road_name: 'Main Bus Stand Road', congestion_pct: 73, avg_speed_kmh: 19, vehicle_count: 1320, status: 'moderate' },
        { id: 'tf_market', road_id: 'road_market', road_name: 'Market Central Avenue', congestion_pct: 81, avg_speed_kmh: 11, vehicle_count: 890, status: 'severe' },
        { id: 'tf_hospital', road_id: 'road_hospital', road_name: 'Hospital Emergency Express Link', congestion_pct: 38, avg_speed_kmh: 42, vehicle_count: 620, status: 'low' },
      ],
      dataSource: 'simulated',
      providerName: 'sim-engine',
      observedAt,
      confidence: 94,
    };
  }
}
