// SMARTMOVE Pluggable Data-Source Adapter Manager & Provenance Tracker
// Enforces field-level provenance rules, stale data tracking, and source_mode switching

import { DataSourceType } from '../../config/design-tokens';

export interface ProviderResult<T> {
  data: T;
  dataSource: DataSourceType;
  providerName: string;
  observedAt: string;
  confidence?: number;
  isStale: boolean;
}

export interface IngestLogEntry {
  id: string;
  provider: string;
  category: 'traffic' | 'bus' | 'parking' | 'emissions' | 'simulation';
  status: 'success' | 'fallback' | 'failed' | 'empty';
  latencyMs: number;
  dataSource: DataSourceType;
  message: string;
  timestamp: string;
}

export type SourceMode = 'simulated' | 'hybrid' | 'live_only';

export interface DataProvider<T> {
  name: string;
  category: 'traffic' | 'bus' | 'parking' | 'emissions';
  isConfigured(): boolean;
  fetch(): Promise<ProviderResult<T>>;
}

class ProviderRegistry {
  private sourceMode: SourceMode = 'simulated';
  private logs: IngestLogEntry[] = [
    {
      id: 'log_01',
      provider: 'sim-engine',
      category: 'traffic',
      status: 'success',
      latencyMs: 14,
      dataSource: 'simulated',
      message: 'Idempotent reactive loop updated 5 arterial road segments',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'log_02',
      provider: 'crowding-estimator',
      category: 'bus',
      status: 'success',
      latencyMs: 8,
      dataSource: 'estimated',
      message: 'Bus occupancy estimated from class/shift schedule models',
      timestamp: new Date().toISOString(),
    },
  ];

  public getSourceMode(): SourceMode {
    return this.sourceMode;
  }

  public setSourceMode(mode: SourceMode) {
    this.sourceMode = mode;
  }

  public getLogs(): IngestLogEntry[] {
    return this.logs;
  }

  public logIngest(entry: Omit<IngestLogEntry, 'id' | 'timestamp'>) {
    const newEntry: IngestLogEntry = {
      id: 'log_' + Date.now(),
      ...entry,
      timestamp: new Date().toISOString(),
    };
    this.logs = [newEntry, ...this.logs.slice(0, 20)];
  }

  public checkIsStale(observedAt: string, thresholdSeconds: number = 120): boolean {
    if (!observedAt) return true;
    const diff = (Date.now() - new Date(observedAt).getTime()) / 1000;
    return diff > thresholdSeconds;
  }
}

export const providerManager = new ProviderRegistry();
