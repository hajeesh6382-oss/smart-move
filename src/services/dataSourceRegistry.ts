// SMARTMOVE Data Source Registry Service
// Observability system tracking real-time data sources, status, latency, and error counts.

export type SourceStatus = 'LIVE' | 'DELAYED' | 'OFFLINE' | 'AI_PREDICTION' | 'DEMO';

export interface DataSourceMetadata {
  id: string;
  name: string;
  category: 'weather' | 'air_quality' | 'transit' | 'parking' | 'ev_charging' | 'traffic' | 'pedestrian_risk';
  provider: string;
  status: SourceStatus;
  lastUpdated: string | null;
  latencyMs: number | null;
  errorCount: number;
  lastError: string | null;
  requiresApiKey: boolean;
  apiKeyConfigured: boolean;
  description: string;
}

class DataSourceRegistry {
  private sources: Map<string, DataSourceMetadata> = new Map();
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.registerDefaults();
  }

  private registerDefaults() {
    const hasOpenWeatherKey = Boolean(import.meta.env.VITE_OPENWEATHER_API_KEY);
    const hasGoogleMapsKey = Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

    this.register({
      id: 'weather_openweather',
      name: 'OpenWeatherMap Weather Stream',
      category: 'weather',
      provider: 'OpenWeatherMap API',
      status: hasOpenWeatherKey ? 'LIVE' : 'OFFLINE',
      lastUpdated: new Date().toISOString(),
      latencyMs: hasOpenWeatherKey ? 120 : null,
      errorCount: 0,
      lastError: hasOpenWeatherKey ? null : 'VITE_OPENWEATHER_API_KEY missing in .env',
      requiresApiKey: true,
      apiKeyConfigured: hasOpenWeatherKey,
      description: 'Real-time temperature, humidity, precipitation, and wind vector feeds.',
    });

    this.register({
      id: 'air_quality_openweather',
      name: 'OpenWeather Air Quality Stream',
      category: 'air_quality',
      provider: 'OpenWeather Air Pollution API',
      status: hasOpenWeatherKey ? 'LIVE' : 'OFFLINE',
      lastUpdated: new Date().toISOString(),
      latencyMs: hasOpenWeatherKey ? 140 : null,
      errorCount: 0,
      lastError: hasOpenWeatherKey ? null : 'VITE_OPENWEATHER_API_KEY missing in .env',
      requiresApiKey: true,
      apiKeyConfigured: hasOpenWeatherKey,
      description: 'Real-time AQI, PM2.5, PM10, NO2, SO2, O3 metrics.',
    });

    this.register({
      id: 'ev_openchargemap',
      name: 'Global EV Charger Network',
      category: 'ev_charging',
      provider: 'Open Charge Map API',
      status: 'LIVE',
      lastUpdated: new Date().toISOString(),
      latencyMs: 310,
      errorCount: 0,
      lastError: null,
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Global public EV charging locations and live status telemetry.',
    });

    this.register({
      id: 'routes_osrm',
      name: 'OSRM Route Engine',
      category: 'traffic',
      provider: 'Open Source Routing Machine (OSRM)',
      status: 'LIVE',
      lastUpdated: new Date().toISOString(),
      latencyMs: 95,
      errorCount: 0,
      lastError: null,
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Turn-by-turn driving, cycling, and walking routes calculated via OpenStreetMap topology.',
    });

    this.register({
      id: 'search_nominatim',
      name: 'OpenStreetMap Nominatim Geocoding',
      category: 'traffic',
      provider: 'OpenStreetMap Nominatim',
      status: 'LIVE',
      lastUpdated: new Date().toISOString(),
      latencyMs: 140,
      errorCount: 0,
      lastError: null,
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Forward and reverse geocoding for Indian cities, towns, and coordinates.',
    });

    this.register({
      id: 'poi_overpass',
      name: 'Overpass API Mobility Infrastructure',
      category: 'transit',
      provider: 'OpenStreetMap Overpass API',
      status: 'LIVE',
      lastUpdated: new Date().toISOString(),
      latencyMs: 280,
      errorCount: 0,
      lastError: null,
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Live spatial queries for urban parking lots, bus stops, metro stations, and EV chargers.',
    });

    this.register({
      id: 'transit_gtfs_rt',
      name: 'Municipal GTFS-Realtime Bus Stream',
      category: 'transit',
      provider: 'GTFS-RT VehiclePositions',
      status: 'OFFLINE',
      lastUpdated: null,
      latencyMs: null,
      errorCount: 0,
      lastError: 'Municipal feed URL unconfigured for local zone',
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Protobuf feed stream for live bus locations, speed, and ETA delays.',
    });

    this.register({
      id: 'parking_smart_hub',
      name: 'Smart Parking & EV Hub Telemetry',
      category: 'parking',
      provider: 'Prediction Engine + Sensor Gateway',
      status: 'AI_PREDICTION',
      lastUpdated: new Date().toISOString(),
      latencyMs: 45,
      errorCount: 0,
      lastError: null,
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Real-time parking occupancy calculated via ML time-series prediction.',
    });

    this.register({
      id: 'pedestrian_risk_ai',
      name: 'Pedestrian Conflict & Crossing Risk Model',
      category: 'pedestrian_risk',
      provider: 'SMARTMOVE Mobility Risk AI Engine',
      status: 'AI_PREDICTION',
      lastUpdated: new Date().toISOString(),
      latencyMs: 60,
      errorCount: 0,
      lastError: null,
      requiresApiKey: false,
      apiKeyConfigured: true,
      description: 'Multi-variable risk scoring combining traffic flow, weather, and historical incidents.',
    });
  }

  public register(meta: DataSourceMetadata) {
    this.sources.set(meta.id, meta);
    this.notify();
  }

  public getSource(id: string): DataSourceMetadata | undefined {
    return this.sources.get(id);
  }

  public getSourcesByCategory(category: DataSourceMetadata['category']): DataSourceMetadata[] {
    return Array.from(this.sources.values()).filter((s) => s.category === category);
  }

  public getAllSources(): DataSourceMetadata[] {
    return Array.from(this.sources.values());
  }

  public updateStatus(id: string, updates: Partial<DataSourceMetadata>) {
    const existing = this.sources.get(id);
    if (existing) {
      this.sources.set(id, { ...existing, ...updates, lastUpdated: new Date().toISOString() });
      this.notify();
    }
  }

  public recordSuccess(id: string, latencyMs: number) {
    const existing = this.sources.get(id);
    if (existing) {
      this.sources.set(id, {
        ...existing,
        status: existing.status === 'OFFLINE' ? 'LIVE' : existing.status,
        lastUpdated: new Date().toISOString(),
        latencyMs,
        lastError: null,
      });
      this.notify();
    }
  }

  public recordError(id: string, errorMessage: string) {
    const existing = this.sources.get(id);
    if (existing) {
      this.sources.set(id, {
        ...existing,
        errorCount: existing.errorCount + 1,
        lastError: errorMessage,
        status: 'OFFLINE',
      });
      this.notify();
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }
}

export const dataSourceRegistry = new DataSourceRegistry();
