// Pluggable Data Provider Interfaces & Types

export type DataSourceType = 'simulated' | 'demo_seed' | 'live_api' | 'sensor' | 'estimated';

export interface ProviderResult<T> {
  data: T;
  dataSource: DataSourceType;
  providerName: string;
  observedAt: string;
  confidence?: number;
}

export interface DataProvider<T> {
  name: string;
  category: 'traffic' | 'bus' | 'parking' | 'emissions';
  isConfigured(): boolean;
  fetch(): Promise<ProviderResult<T>>;
}
