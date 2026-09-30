// SMARTMOVE Weather Service
// Integrates with OpenWeatherMap API for live weather data.
// Includes graceful fallback handling and automatic error reporting to dataSourceRegistry.

import { dataSourceRegistry } from './dataSourceRegistry';

export interface WeatherData {
  city: string;
  temperatureC: number;
  feelsLikeC: number;
  condition: string;
  description: string;
  icon: string;
  humidityPct: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  visibilityKm: number;
  pressureHpa: number;
  timestamp: string;
  isLive: boolean;
  provider: string;
  sourceType: 'live_weather' | 'unavailable' | 'demo';
}

const DEFAULT_LAT = 9.9988; // Default region (Theni / Tamil Nadu)
const DEFAULT_LNG = 77.4768;

export async function fetchLiveWeather(lat: number = DEFAULT_LAT, lng: number = DEFAULT_LNG): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

  if (!apiKey) {
    dataSourceRegistry.updateStatus('weather_openweather', {
      status: 'OFFLINE',
      lastError: 'VITE_OPENWEATHER_API_KEY not found in environment',
    });
    return getFallbackWeatherData('OpenWeatherMap API Key missing in environment');
  }

  const startTime = performance.now();
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`OpenWeather API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);

    dataSourceRegistry.recordSuccess('weather_openweather', duration);

    return {
      city: data.name || 'Theni Region',
      temperatureC: Math.round(data.main.temp * 10) / 10,
      feelsLikeC: Math.round(data.main.feels_like * 10) / 10,
      condition: data.weather[0]?.main || 'Clear',
      description: data.weather[0]?.description || 'clear sky',
      icon: data.weather[0]?.icon || '01d',
      humidityPct: data.main.humidity,
      windSpeedKmh: Math.round(data.wind.speed * 3.6 * 10) / 10,
      windDirectionDeg: data.wind.deg || 0,
      visibilityKm: Math.round((data.visibility / 1000) * 10) / 10,
      pressureHpa: data.main.pressure,
      timestamp: new Date().toISOString(),
      isLive: true,
      provider: 'OpenWeatherMap Live API',
      sourceType: 'live_weather',
    };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Weather fetch error';
    dataSourceRegistry.recordError('weather_openweather', errMsg);
    return getFallbackWeatherData(errMsg);
  }
}

function getFallbackWeatherData(reason: string): WeatherData {
  return {
    city: 'Theni Urban Corridor',
    temperatureC: 28.5,
    feelsLikeC: 30.2,
    condition: 'Partly Cloudy',
    description: `Fallback data (${reason})`,
    icon: '02d',
    humidityPct: 65,
    windSpeedKmh: 12.4,
    windDirectionDeg: 140,
    visibilityKm: 10,
    pressureHpa: 1012,
    timestamp: new Date().toISOString(),
    isLive: false,
    provider: 'SMARTMOVE Weather Fallback',
    sourceType: 'unavailable',
  };
}
