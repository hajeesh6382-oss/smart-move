// SMARTMOVE Air Quality Service
// Integrates with OpenWeatherMap Air Pollution API for live AQI and pollutant concentrations.

import { dataSourceRegistry } from './dataSourceRegistry';

export interface AirQualityData {
  aqi: number; // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
  aqiCategory: 'Good' | 'Fair' | 'Moderate' | 'Poor' | 'Very Poor';
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  o3: number;
  co: number;
  healthRecommendation: string;
  timestamp: string;
  isLive: boolean;
  provider: string;
  sourceType: 'live_api' | 'unavailable' | 'demo';
}

const DEFAULT_LAT = 9.9988;
const DEFAULT_LNG = 77.4768;

const AQI_MAP: Record<number, AirQualityData['aqiCategory']> = {
  1: 'Good',
  2: 'Fair',
  3: 'Moderate',
  4: 'Poor',
  5: 'Very Poor',
};

const RECOMMENDATIONS: Record<AirQualityData['aqiCategory'], string> = {
  Good: 'Air quality is satisfactory. Ideal for outdoor active transit and cycling.',
  Fair: 'Air quality is acceptable. Sensitive individuals should consider reducing intense outdoor activity.',
  Moderate: 'Air quality is acceptable for most, but prolonged outdoor exposure may cause mild irritation.',
  Poor: 'Air pollution is high. Consider using public transit with air filtration or indoor alternatives.',
  'Very Poor': 'Health alert: high pollution levels. Avoid outdoor exercise and wear protective masks.',
};

export async function fetchLiveAirQuality(lat: number = DEFAULT_LAT, lng: number = DEFAULT_LNG): Promise<AirQualityData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

  if (!apiKey) {
    dataSourceRegistry.updateStatus('air_quality_openweather', {
      status: 'OFFLINE',
      lastError: 'VITE_OPENWEATHER_API_KEY not found in environment',
    });
    return getFallbackAirQualityData('OpenWeatherMap API key missing');
  }

  const startTime = performance.now();
  try {
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Air pollution API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);

    dataSourceRegistry.recordSuccess('air_quality_openweather', duration);

    const list0 = data.list[0];
    const rawAqi = list0.main.aqi as number;
    const category = AQI_MAP[rawAqi] || 'Moderate';
    const components = list0.components;

    return {
      aqi: rawAqi,
      aqiCategory: category,
      pm25: Math.round(components.pm2_5 * 10) / 10,
      pm10: Math.round(components.pm10 * 10) / 10,
      no2: Math.round(components.no2 * 10) / 10,
      so2: Math.round(components.so2 * 10) / 10,
      o3: Math.round(components.o3 * 10) / 10,
      co: Math.round(components.co * 10) / 10,
      healthRecommendation: RECOMMENDATIONS[category],
      timestamp: new Date().toISOString(),
      isLive: true,
      provider: 'OpenWeather Air Pollution API',
      sourceType: 'live_api',
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Air quality fetch error';
    dataSourceRegistry.recordError('air_quality_openweather', errMsg);
    return getFallbackAirQualityData(errMsg);
  }
}

function getFallbackAirQualityData(reason: string): AirQualityData {
  return {
    aqi: 2,
    aqiCategory: 'Fair',
    pm25: 18.4,
    pm10: 42.1,
    no2: 24.5,
    so2: 8.2,
    o3: 35.0,
    co: 410.0,
    healthRecommendation: `Moderate air quality. (${reason})`,
    timestamp: new Date().toISOString(),
    isLive: false,
    provider: 'SMARTMOVE AQI Fallback Engine',
    sourceType: 'unavailable',
  };
}
